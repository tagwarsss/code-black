const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");

const htmlPath = __dirname + "/../index.html";
const jsPath = __dirname + "/../index.js";
const cssPath = __dirname + "/../index.css";

const html = fs.readFileSync(htmlPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");

test("home section should not contain check connection button", () => {
  const dom = new JSDOM(html);
  const checkConnectionBtn = dom.window.document.getElementById("checkConnectionBtn");
  assert.strictEqual(checkConnectionBtn, null);
});

test("home section should not contain status div", () => {
  const dom = new JSDOM(html);
  const status = dom.window.document.querySelector("#home #status");
  assert.strictEqual(status, null);
});

test("home section should still contain the heading", () => {
  const dom = new JSDOM(html);
  const home = dom.window.document.getElementById("home");
  assert.ok(home);
  const heading = home.querySelector("h1");
  assert.ok(heading);
  assert.match(heading.textContent.trim(), /Supabase Connection/);
});

test("index.js should not reference checkConnectionBtn", () => {
  assert.ok(!js.includes("checkConnectionBtn"), "checkConnectionBtn reference still exists in index.js");
});

test("index.js should not contain connection test logic", () => {
  assert.ok(!js.includes("Checking..."), "connection test 'Checking...' text still in index.js");
  assert.ok(!js.includes("Connected to Supabase Auth!"), "connection test success message still in index.js");
});

test("index.css should not contain checkConnectionBtn styles", () => {
  assert.ok(!css.includes("checkConnectionBtn"), "checkConnectionBtn styles still in index.css");
  assert.ok(!css.includes("#status"), "status styles still in index.css");
  assert.ok(!css.includes(".success"), "success class styles still in index.css");
});
