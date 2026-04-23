/**
 * Reads database.json and imports it into MySQL.
 * Run after configuring DB_* values in .env:
 *   node migrate-mysql.cjs
 */

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnv(filePath) {
  const env = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || rest.length === 0) continue;
    env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
  return env;
}

function stringify(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function toJson(value, fallback) {
  return JSON.stringify(value === undefined ? fallback : value);
}

function createReplaceStatement(tableName, columns) {
  const placeholders = columns.map(() => "?").join(", ");
  return `REPLACE INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`;
}

async function replaceRow(pool, tableName, columns, values) {
  await pool.execute(createReplaceStatement(tableName, columns), values);
}

async function migrate() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env was not found");
  }

  const env = loadEnv(envPath);
  const pool = await mysql.createPool({
    host: env.DB_HOST || "localhost",
    user: env.DB_USER || "root",
    password: env.DB_PASS || "",
    database: env.DB_NAME || "hq_dried_fruits",
    port: parseInt(env.DB_PORT || "3306", 10),
    waitForConnections: true,
    connectionLimit: 5,
  });

  const dbFile = path.join(process.cwd(), "database.json");
  if (!fs.existsSync(dbFile)) {
    console.log("No database.json found. Nothing to import.");
    await pool.end();
    return;
  }

  const legacy = JSON.parse(fs.readFileSync(dbFile, "utf8"));
  let count = 0;

  for (const row of legacy.global_settings || []) {
    if (!row.lang) continue;
    await replaceRow(
      pool,
      "global_settings",
      [
        "id",
        "lang",
        "header_logo",
        "site_name",
        "nav_links",
        "cta_text",
        "cta_url",
        "footer_logo",
        "footer_description",
        "footer_lead_text",
        "quick_links",
        "office_address",
        "phone_number",
        "email_address",
        "telegram_url",
        "footer_cta_title",
        "footer_cta_email",
        "footer_copyright_text",
        "ui_labels",
        "google_site_verification_id",
      ],
      [
        1,
        row.lang,
        stringify(row.header_logo),
        stringify(row.site_name),
        toJson(row.nav_links, []),
        stringify(row.cta_text),
        stringify(row.cta_url),
        stringify(row.footer_logo),
        stringify(row.footer_description),
        stringify(row.footer_lead_text),
        toJson(row.quick_links, []),
        stringify(row.office_address),
        stringify(row.phone_number),
        stringify(row.email_address),
        stringify(row.telegram_url),
        stringify(row.footer_cta_title),
        stringify(row.footer_cta_email),
        stringify(row.footer_copyright_text),
        toJson(row.ui_labels, {}),
        stringify(row.google_site_verification_id),
      ],
    );
    count++;
  }
  console.log("Imported global_settings");

  for (const tableName of ["home_page", "about_page", "privacy_page", "terms_page"]) {
    for (const row of legacy[tableName] || []) {
      if (!row.lang) continue;
      await replaceRow(pool, tableName, ["id", "lang", "content"], [1, row.lang, toJson(row.content, {})]);
      count++;
    }
    console.log(`Imported ${tableName}`);
  }

  for (const row of legacy.products_page || []) {
    if (!row.lang) continue;
    await replaceRow(
      pool,
      "products_page",
      [
        "id",
        "lang",
        "page_title",
        "page_subtitle",
        "hero_bg_image",
        "ordering_bg_image",
        "ordering_form_title",
        "ordering_form_subtitle",
        "step_one_label",
        "step_two_label",
        "step_three_label",
        "mixed_container_label",
        "volume_options",
        "view_specs_label",
        "step_one_placeholder",
        "step_three_placeholder",
        "next_step_button_label",
        "back_button_label",
        "submit_button_label",
        "submitting_button_label",
        "detail_ui",
        "quick_contact_title",
        "quick_contact_subtitle",
        "telegram_label",
        "telegram_sublabel",
        "call_label",
        "email_label",
        "quick_phone",
        "quick_email",
      ],
      [
        1,
        row.lang,
        stringify(row.page_title),
        stringify(row.page_subtitle),
        stringify(row.hero_bg_image),
        stringify(row.ordering_bg_image),
        stringify(row.ordering_form_title),
        stringify(row.ordering_form_subtitle),
        stringify(row.step_one_label),
        stringify(row.step_two_label),
        stringify(row.step_three_label),
        stringify(row.mixed_container_label),
        toJson(row.volume_options, []),
        stringify(row.view_specs_label),
        stringify(row.step_one_placeholder),
        stringify(row.step_three_placeholder),
        stringify(row.next_step_button_label),
        stringify(row.back_button_label),
        stringify(row.submit_button_label),
        stringify(row.submitting_button_label),
        toJson(row.detail_ui, {}),
        stringify(row.quick_contact_title),
        stringify(row.quick_contact_subtitle),
        stringify(row.telegram_label),
        stringify(row.telegram_sublabel),
        stringify(row.call_label),
        stringify(row.email_label),
        stringify(row.quick_phone),
        stringify(row.quick_email),
      ],
    );
    count++;
  }
  console.log("Imported products_page");

  for (const row of legacy.export_page || []) {
    if (!row.lang) continue;
    const content = row.content || {};
    await replaceRow(
      pool,
      "export_page",
      [
        "id",
        "lang",
        "hero_title",
        "hero_subtitle",
        "hero_bg_image",
        "map_section_title",
        "supply_routes",
        "logistics_content",
        "packaging_title",
        "packaging_methods",
        "transportation_title",
        "transportation_methods",
        "documentation_title",
        "documentation_content",
        "quality_title",
        "technical_specs",
        "quality_checks",
        "certifications_gallery",
      ],
      [
        1,
        row.lang,
        stringify(content.heroTitle ?? row.hero_title),
        stringify(content.heroSubtitle ?? content.heroDescription ?? row.hero_subtitle),
        stringify(row.hero_bg_image),
        stringify(row.map_section_title),
        toJson(row.supply_routes, []),
        stringify(row.logistics_content),
        stringify(row.packaging_title),
        stringify(row.packaging_methods),
        stringify(row.transportation_title),
        stringify(row.transportation_methods),
        stringify(row.documentation_title),
        stringify(row.documentation_content),
        stringify(content.qualityCommitmentTitle ?? row.quality_title),
        stringify(content.qualityCommitmentDesc ?? row.technical_specs),
        toJson(row.quality_checks, []),
        toJson(row.certifications_gallery, []),
      ],
    );
    count++;
  }
  console.log("Imported export_page");

  for (const row of legacy.contacts_page || []) {
    if (!row.lang) continue;
    await replaceRow(
      pool,
      "contacts_page",
      [
        "id",
        "lang",
        "page_title",
        "intro_text",
        "form_destination_email",
        "contact_form_title",
        "response_label_prefix",
        "form_name_label",
        "form_company_label",
        "form_email_label",
        "form_message_label",
        "submit_button_label",
        "submitting_button_label",
        "email",
        "phone",
        "office_address",
        "working_hours",
        "map_pin_label",
        "info_email_label",
        "info_phone_label",
        "info_address_label",
        "info_hours_label",
        "social_section_title",
        "telegram_url",
        "instagram_url",
        "whatsapp_url",
        "facebook_url",
        "headquarters_image",
        "google_maps_url",
      ],
      [
        1,
        row.lang,
        stringify(row.page_title),
        stringify(row.intro_text),
        stringify(row.form_destination_email),
        stringify(row.contact_form_title),
        stringify(row.response_label_prefix),
        stringify(row.form_name_label),
        stringify(row.form_company_label),
        stringify(row.form_email_label),
        stringify(row.form_message_label),
        stringify(row.submit_button_label),
        stringify(row.submitting_button_label),
        stringify(row.email ?? row.email_address),
        stringify(row.phone ?? row.phone_number),
        stringify(row.office_address),
        stringify(row.working_hours),
        stringify(row.map_pin_label),
        stringify(row.info_email_label),
        stringify(row.info_phone_label),
        stringify(row.info_address_label),
        stringify(row.info_hours_label),
        stringify(row.social_section_title),
        stringify(row.telegram_url),
        stringify(row.instagram_url),
        stringify(row.whatsapp_url),
        stringify(row.facebook_url),
        stringify(row.headquarters_image),
        stringify(row.google_maps_url),
      ],
    );
    count++;
  }
  console.log("Imported contacts_page");

  for (const row of legacy.products || []) {
    if (!row.id) continue;
    await replaceRow(
      pool,
      "products",
      [
        "id",
        "lang",
        "name",
        "category",
        "status",
        "image",
        "image_gallery",
        "short_description",
        "long_description",
        "highlights",
        "content_sections",
        "nutrition",
        "inquiry_subject_line",
        "tonnage_options",
        "seo",
      ],
      [
        stringify(row.id),
        stringify(row.lang, "en"),
        stringify(row.name),
        stringify(row.category),
        stringify(row.status, "Active"),
        stringify(row.image),
        toJson(row.image_gallery ?? row.imageGallery, []),
        stringify(row.short_description ?? row.shortDescription),
        stringify(row.long_description ?? row.longDescription),
        toJson(row.highlights, []),
        toJson(row.content_sections ?? row.contentSections, []),
        toJson(row.nutrition, {}),
        stringify(row.inquiry_subject_line ?? row.inquirySubjectLine),
        toJson(row.tonnage_options ?? row.tonnageOptions, []),
        toJson(row.seo, {}),
      ],
    );
    count++;
  }
  console.log("Imported products");

  for (const row of legacy.leads || []) {
    if (!row.id) continue;
    await pool.execute(
      `INSERT IGNORE INTO leads (id, date, name, company, email, phone, telegram, product_interest, est_tonnage, status, message, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stringify(row.id),
        stringify(row.date),
        stringify(row.name),
        stringify(row.company),
        stringify(row.email),
        stringify(row.phone),
        stringify(row.telegram),
        stringify(row.product_interest ?? row.productInterest),
        stringify(row.est_tonnage ?? row.estTonnage),
        stringify(row.status, "New"),
        stringify(row.message),
        stringify(row.notes),
      ],
    );
    count++;
  }
  console.log("Imported leads");

  for (const row of legacy.page_seo || []) {
    if (!row.page_id) continue;
    await replaceRow(
      pool,
      "page_seo",
      ["page_id", "lang", "meta_title", "meta_description", "slug", "og_title", "image_alt"],
      [
        stringify(row.page_id),
        stringify(row.lang, "en"),
        stringify(row.meta_title),
        stringify(row.meta_description),
        stringify(row.slug),
        stringify(row.og_title),
        stringify(row.image_alt),
      ],
    );
    count++;
  }
  console.log("Imported page_seo");

  await pool.end();
  console.log(`Migration complete. Imported ${count} rows into MySQL.`);
}

migrate().catch(async (error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
