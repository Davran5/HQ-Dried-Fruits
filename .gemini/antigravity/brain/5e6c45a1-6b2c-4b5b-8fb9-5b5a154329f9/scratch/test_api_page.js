async function test() {
    const res = await fetch('http://localhost:10000/api/pages/home?lang=ru');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
