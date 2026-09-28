#!/usr/bin/env node
/* End-to-end self-check.  Run with:  npm run verify
   - Works whether or not a server is already running: if nothing answers on port 4004,
     the script starts its own CAP server, runs the checks, and stops it again.
   - Tries 127.0.0.1 first (Node on Windows may resolve "localhost" to IPv6).
   Exit code 0 = all checks passed, 1 = something failed. Prints one line per check. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const HOSTS = ["http://127.0.0.1:4004", "http://localhost:4004"];
let BASE = HOSTS[0];
const results = [];
const pass = (n, d = "") => results.push(`PASS  ${n}${d ? " — " + d : ""}`);
const fail = (n, d = "") => results.push(`FAIL  ${n}${d ? " — " + d : ""}`);

function get(url) {
  return new Promise((res, rej) => {
    const req = http.get(url, (r) => { let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => res({ status: r.statusCode, body: b })); });
    req.on("error", rej); req.setTimeout(5000, () => { req.destroy(new Error("timeout")); });
  });
}
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function reachable() {
  for (const h of HOSTS) { try { await get(h + "/"); BASE = h; return true; } catch {} }
  return false;
}

let child = null;
async function ensureServer() {
  if (await reachable()) { pass("Server responds on 4004", "already running"); return true; }
  const cdsBin = path.join(__dirname, "..", "node_modules", ".bin", process.platform === "win32" ? "cds.cmd" : "cds");
  console.log("No server on 4004 — starting a temporary one for verification...");
  child = spawn(cdsBin, ["serve", "--in-memory"], { cwd: path.join(__dirname, ".."), stdio: "ignore",
                 shell: process.platform === "win32", detached: process.platform !== "win32" });
  for (let i = 0; i < 40; i++) { await sleep(750); if (await reachable()) { pass("Server responds on 4004", "started by verify"); return true; } }
  fail("Server responds on 4004", "could not start cds serve — run `npm install` and check for errors");
  return false;
}
function stopServer() {
  if (!child) return;
  try {
    if (process.platform === "win32") require("child_process").spawnSync("taskkill", ["/pid", String(child.pid), "/f", "/t"]);
    else process.kill(-child.pid, "SIGTERM");           // kill the whole process group
  } catch {}
}

(async () => {
  // 1. server up (start one if needed)
  if (!(await ensureServer())) { print(); process.exit(1); }

  // 2. service returns exactly the open orders
  const svc = await get(BASE + "/odata/v4/sales-order/SalesOrders?$orderby=OrderNumber");
  let rows = [];
  try { rows = JSON.parse(svc.body).value || []; } catch {}
  svc.status === 200 ? pass("Service /odata/v4/sales-order/SalesOrders reachable") : fail("Service reachable", "HTTP " + svc.status);
  rows.length === 12 ? pass("Service returns 12 open orders") : fail("Service returns 12 open orders", `got ${rows.length}`);
  const nums = rows.map((r) => r.OrderNumber);
  const closed = ["500013", "500014"].filter((n) => nums.includes(n));
  closed.length === 0 ? pass("Delivered/completed orders are filtered out") : fail("Filtering", `found ${closed.join(",")}`);
  const customers = new Set(rows.map((r) => r.CustomerName));
  customers.size === 5 ? pass("5 distinct customers") : fail("5 distinct customers", `got ${customers.size}`);
  const fields = ["OrderNumber", "OrderDate", "CustomerName", "NetValue"];
  const missing = rows[0] ? fields.filter((f) => !(f in rows[0])) : fields;
  missing.length === 0 ? pass("All 4 report fields present") : fail("Report fields", `missing ${missing.join(",")}`);

  // 3. UI served (path without /app)
  const ui = await get(BASE + "/salesorders/webapp/index.html");
  ui.status === 200 ? pass("UI served at /salesorders/webapp/index.html") : fail("UI served", "HTTP " + ui.status);
  ["/salesorders/webapp/manifest.json", "/salesorders/webapp/Component.js",
   "/salesorders/webapp/view/SalesOrders.view.xml", "/salesorders/webapp/controller/SalesOrders.controller.js"]
    .forEach(async () => {});
  for (const p of ["/salesorders/webapp/manifest.json", "/salesorders/webapp/Component.js",
                   "/salesorders/webapp/view/SalesOrders.view.xml", "/salesorders/webapp/controller/SalesOrders.controller.js"]) {
    const r = await get(BASE + p);
    r.status === 200 ? pass(`UI file served ${p.split("/").pop()}`) : fail(`UI file served ${p}`, "HTTP " + r.status);
  }

  // 4. static rules that prevented the known failures
  const idx = read("app/salesorders/webapp/index.html");
  idx.includes('data-sap-ui-compat-version="edge"') && idx.includes('data-sap-ui-binding-syntax="complex"')
    ? pass("Complex binding syntax enabled (rule: bootstrap flags)") : fail("Complex binding syntax flags missing in index.html");
  idx.includes("ComponentSupport") ? pass("Single wiring path via ComponentSupport") : fail("index.html does not use ComponentSupport");
  idx.includes('data-height="100%"') ? pass("ComponentContainer has height=100% (rule: Page layout)") : fail("index.html component div missing data-height=\"100%\"");
  idx.includes('data-sap-ui-xx-component-preload="off"') ? pass("Component-preload lookup disabled (clean console)") : fail("index.html missing data-sap-ui-xx-component-preload=\"off\"");

  const view = read("app/salesorders/webapp/view/SalesOrders.view.xml");
  view.includes('height="100%"') ? pass("View has height=100% (rule: Page layout)") : fail("View missing height=100%");
  view.includes("<ColumnListItem>") ? pass("Table has row template") : fail("Table row template missing");
  view.includes("group: true") ? pass("Grouping by CustomerName declared") : fail("Grouping sorter missing");

  const ctrl = read("app/salesorders/webapp/controller/SalesOrders.controller.js");
  /bindItems|requestContexts|metadataLoaded|fetch\(/.test(ctrl) ? fail("Controller contains data-loading logic") : pass("Controller has no data-loading logic");

  const mani = JSON.parse(read("app/salesorders/webapp/manifest.json"));
  mani["sap.ui5"].routing ? fail("manifest.json contains routing (not allowed)") : pass("manifest.json has no routing");
  mani["sap.app"].dataSources.mainService.uri === "/odata/v4/sales-order/" ? pass("manifest dataSource matches service path") : fail("manifest dataSource uri mismatch");

  print();
  stopServer();
  process.exit(results.some((l) => l.startsWith("FAIL")) ? 1 : 0);

  function print() {
    console.log("\n=== Open Sales Orders — self-verification ===");
    results.forEach((l) => console.log(l));
    const f = results.filter((l) => l.startsWith("FAIL")).length;
    console.log(f ? `\n${f} check(s) FAILED` : `\nALL ${results.length} CHECKS PASSED\nStart the app with:  npm run watch\nThen open:           http://localhost:4004/salesorders/webapp/index.html`);
  }
})();
