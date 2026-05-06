import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const targetOrigin = "http://127.0.0.1:10001";
const port = 10000;

app.use(express.json({ limit: "10mb" }));

app.post("/api/verify-password", (req, res) => {
  const actualPassword = process.env.COMING_SOON_PASSWORD || "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!actualPassword) {
    return res.json({ success: false, error: "Configuration error" });
  }

  return res.json({ success: password === actualPassword });
});

async function proxyRequest(req, res) {
  const targetUrl = `${targetOrigin}${req.originalUrl}`;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers["content-length"];

  const init = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req;
    init.duplex = "half";
  }

  try {
    const upstream = await fetch(targetUrl, init);
    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === "content-encoding") {
        return;
      }
      res.setHeader(key, value);
    });

    if (!upstream.body) {
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    res.status(502).json({
      error: "Proxy request failed",
      message: error instanceof Error ? error.message : String(error),
      targetUrl,
    });
  }
}

app.use("/api", proxyRequest);
app.use("/uploads", proxyRequest);

app.listen(port, () => {
  console.log(`[local-api-bridge] Listening on ${port}, forwarding to ${targetOrigin}`);
});
