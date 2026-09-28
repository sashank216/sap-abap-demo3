# RULEBOOK — Open Sales Orders demo

## How to treat business prompts
- Each business prompt names a STEP (1–5) or an everyday action. Execute it using ONLY the blueprint below.
- "Blueprint" means: create the listed files with EXACTLY the given content. Never invent, rename, reformat or improve them.
- Change only the files the request needs. After any change, show the changed file(s) briefly and run "npm run verify".
- Report results in one or two plain sentences, no technical jargon, using the "You should see" wording where given.
- If anything fails: report the FAIL lines, do NOT attempt fixes, and stop.

## Steps
- STEP 1: create the Step 1 files, then run: npm install   (exactly that; no extra flags). Report "Step 1 complete — project created, dependencies installed."
- STEP 2: create the Step 2 file. Report "14 orders loaded — 12 open, 2 not open."
- STEP 3: create the Step 3 file, run "npm run verify" (it starts its own temporary server) and report "Service published — 12 open orders returned." if the service check passes.
- STEP 4: create the Step 4 files. Report "Screen created — 5 files."
- STEP 5: create the Step 5 file if missing, run "npm run verify", show the full output. Expected: ALL 21 CHECKS PASSED.
- "Start the report": check port 4004. If free, start "npm run watch" in a new terminal that stays open and wait for "server listening". Give the link http://localhost:4004/salesorders/webapp/index.html and tell the user to press Ctrl+Shift+R once. If already running, just give the link.
- "Stop the report": stop the process listening on port 4004 (Windows: Get-NetTCPConnection -LocalPort 4004 | Stop-Process -Id ...OwningProcess).
- "Save to GitHub": clone https://github.com/sashank216/sap-abap-demo3.git into a temp folder next to this project; copy this project (excluding node_modules, gen, .git) into <clone>/sales-order-report; commit "Add verified CAP Open Sales Orders report" (or the user's message); push to the default branch. Never force-push, never create a repository. Report the commit URL. If login is needed, tell the user exactly what to click.
- "Final status": three one-line checks: server on 4004, 12 open orders from the service, latest GitHub commit URL.

## Everyday actions (edit only the named file, then npm run verify)
- Filter to a customer: in app/salesorders/webapp/view/SalesOrders.view.xml add, inside the items binding, filters: [{ path: 'CustomerName', operator: 'EQ', value1: '<name>' }]. Remove it for "Show all customers again."
- Sort by value: change the second sorter to { path: 'NetValue', descending: true }; "newest first" restores { path: 'OrderDate', descending: true }.
- Add an order: append one row to db/data/sales-SalesOrders.csv with a new UUID, Status A, values as given (date as YYYY-MM-DD, amount with 2 decimals).
- Anything not listed here: say it is not part of the approved demo and stop.

## Helpers (MCP servers) — governed by Appendix B of the playbook
- One server per step, advisory only: CAP MCP may confirm CDS files (Steps 1, 3); UI5 MCP may confirm control names (Step 4). Servers never generate or alter blueprint files.
- Do not call the Fiori MCP, UI5 Web Components MCP, ADTMCP, ABAPDocMCP or SAP BTP Docs MCP unless the request names ABAP, S/4HANA or BTP explicitly.
- Before any MCP call state: INVOKE / INPUT / OUTPUT / VALIDATE / ON FAIL. If a server is unreachable, mark it unavailable for the session, continue with the blueprint, report in one sentence.
- Run cds/npm/git commands in the terminal, not via MCP.
- Maintain ARTIFACTS.md (create it in Step 1) with the register CAP-001, SO-DATA-001, CAP-SVC-001, FIORI-001, GIT-001 — columns ID | type | name | status | source | dependsOn; update status after each step (created → verified → pushed).
- Resolve "the orders/the data" = SO-DATA-001, "the service" = CAP-SVC-001, "the report/the screen/the app" = FIORI-001, "GitHub" = GIT-001, "this/same/it" = the artifact of the previous prompt.

## Never
- Never use sap.fe.templates or add "routing" to manifest.json. Never put data logic in the controller.
- Never remove data-sap-ui-compat-version, data-sap-ui-binding-syntax, data-height="100%" from index.html, or height="100%" from the view.
- Never start a second server on port 4004. Never work outside this project folder.
- Proxy workaround (only when npm install fails with a certificate error): run "npm config set strict-ssl false" once, then retry npm install.

# BLUEPRINT — approved files (create EXACTLY; each starts after "=== FILE: <path> ===" and ends at the next "=== FILE" or "=== END OF BLUEPRINT ===")

## STEP 1 — Project
=== FILE: package.json ===
{
  "name": "sales-order-report",
  "version": "1.0.0",
  "description": "Open Sales Orders report - SAP CAP + UI5",
  "private": true,
  "scripts": {
    "start": "cds-serve",
    "watch": "cds watch",
    "verify": "node scripts/verify.js"
  },
  "dependencies": {
    "@sap/cds": "10.1.1"
  },
  "devDependencies": {
    "@cap-js/sqlite": "3.1.1",
    "@sap/cds-dk": "10.1.2"
  },
  "cds": {
    "requires": {
      "db": {
        "kind": "sqlite",
        "credentials": {
          "url": ":memory:"
        }
      }
    }
  }
}
=== FILE: .gitignore ===
node_modules/
gen/
*.log
*.db
=== FILE: db/schema.cds ===
namespace sales;

// Status: A = Open, B = Delivered, C = Completed
entity SalesOrders {
  key ID       : UUID;
  OrderNumber  : String(10);
  OrderDate    : Date;
  CustomerName : String(100);
  NetValue     : Decimal(15,2);
  Status       : String(1);
}
=== FILE: README.md ===
# Open Sales Orders — SAP CAP + UI5

Shows all **open** sales orders grouped by customer: Order Number, Order Date, Customer Name, Net Value.

## Run
```
npm install
npm run verify         # 19 automated checks; starts a temporary server itself if none is running
npm run watch          # starts CAP on http://localhost:4004 for normal use
```
UI:      http://localhost:4004/salesorders/webapp/index.html  
Service: http://localhost:4004/odata/v4/sales-order/SalesOrders

## Structure
| Path | Purpose |
|---|---|
| `db/schema.cds` | `sales.SalesOrders` entity (Status A=Open, B=Delivered, C=Completed) |
| `db/data/sales-SalesOrders.csv` | 14 sample orders (12 open, 2 not) |
| `srv/sales-order-service.cds` | read-only projection, `where Status = 'A'` |
| `app/salesorders/webapp/` | UI5 app: Component + manifest + XML view (grouped table) + empty controller |
| `scripts/verify.js` | end-to-end self-check |

Do not change: the bootstrap flags in `index.html`, `height="100%"` on the view, or the empty controller — each prevents a known failure.

## STEP 2 — Sample orders
=== FILE: db/data/sales-SalesOrders.csv ===
ID;OrderNumber;OrderDate;CustomerName;NetValue;Status
11111111-0000-4000-8000-000000000001;500001;2026-01-08;Alpine Ski House;18450.00;A
11111111-0000-4000-8000-000000000002;500002;2026-01-15;Alpine Ski House;7290.50;A
11111111-0000-4000-8000-000000000003;500003;2026-02-03;Blue Ocean Retail;45200.00;A
11111111-0000-4000-8000-000000000004;500004;2026-02-18;Blue Ocean Retail;11875.25;A
11111111-0000-4000-8000-000000000005;500005;2026-03-02;Cedar Grove Foods;9630.00;A
11111111-0000-4000-8000-000000000006;500006;2026-03-11;Cedar Grove Foods;25780.75;A
11111111-0000-4000-8000-000000000007;500007;2026-03-19;Delta Office Supplies;6325.40;A
11111111-0000-4000-8000-000000000008;500008;2026-04-06;Delta Office Supplies;17490.00;A
11111111-0000-4000-8000-000000000009;500009;2026-04-14;Evergreen Manufacturing;58200.00;A
11111111-0000-4000-8000-000000000010;500010;2026-04-21;Evergreen Manufacturing;31650.80;A
11111111-0000-4000-8000-000000000011;500011;2026-05-05;Alpine Ski House;12890.00;A
11111111-0000-4000-8000-000000000012;500012;2026-05-12;Blue Ocean Retail;22340.60;A
11111111-0000-4000-8000-000000000013;500013;2026-02-25;Cedar Grove Foods;3100.00;B
11111111-0000-4000-8000-000000000014;500014;2026-01-30;Delta Office Supplies;8800.00;C

## STEP 3 — Open-orders service
=== FILE: srv/sales-order-service.cds ===
using { sales } from '../db/schema';

// Read-only report service: only OPEN orders (Status = 'A') are exposed.
service SalesOrderService {
  @readonly
  entity SalesOrders as projection on sales.SalesOrders {
    key ID,
    OrderNumber,
    OrderDate,
    CustomerName,
    NetValue
  } where Status = 'A';
}

## STEP 4 — Screen
=== FILE: app/salesorders/webapp/index.html ===
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Open Sales Orders</title>
  <style>
    html, body, #content { height: 100%; margin: 0; }
  </style>
  <script id="sap-ui-bootstrap"
    src="https://ui5.sap.com/1.120.30/resources/sap-ui-core.js"
    data-sap-ui-theme="sap_horizon"
    data-sap-ui-async="true"
    data-sap-ui-compat-version="edge"
    data-sap-ui-binding-syntax="complex"
    data-sap-ui-resource-roots='{"salesorders": "./"}'
    data-sap-ui-xx-component-preload="off"
    data-sap-ui-on-init="module:sap/ui/core/ComponentSupport">
  </script>
</head>
<body class="sapUiBody sapUiSizeCompact">
  <div id="content"
       data-sap-ui-component
       data-name="salesorders"
       data-id="container"
       data-height="100%"
       data-settings='{"id":"salesorders"}'></div>
</body>
</html>
=== FILE: app/salesorders/webapp/Component.js ===
sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
  "use strict";
  return UIComponent.extend("salesorders.Component", {
    metadata: { manifest: "json" }
  });
});
=== FILE: app/salesorders/webapp/manifest.json ===
{
  "_version": "1.59.0",
  "sap.app": {
    "id": "salesorders",
    "type": "application",
    "title": "Open Sales Orders",
    "description": "Open sales orders grouped by customer",
    "applicationVersion": { "version": "1.0.0" },
    "dataSources": {
      "mainService": {
        "uri": "/odata/v4/sales-order/",
        "type": "OData",
        "settings": { "odataVersion": "4.0" }
      }
    }
  },
  "sap.ui": {
    "technology": "UI5",
    "deviceTypes": { "desktop": true, "tablet": true, "phone": true }
  },
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.120.0",
      "libs": { "sap.m": {}, "sap.ui.core": {} }
    },
    "contentDensities": { "compact": true, "cozy": true },
    "models": {
      "": {
        "dataSource": "mainService",
        "settings": {
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true
        }
      }
    },
    "rootView": {
      "viewName": "salesorders.view.SalesOrders",
      "type": "XML",
      "async": true,
      "id": "salesOrdersView"
    }
  }
}
=== FILE: app/salesorders/webapp/view/SalesOrders.view.xml ===
<mvc:View
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  controllerName="salesorders.controller.SalesOrders"
  displayBlock="true"
  height="100%">
  <Page title="Open Sales Orders">
    <Table id="salesOrdersTable"
      items="{
        path: '/SalesOrders',
        sorter: [
          { path: 'CustomerName', group: true },
          { path: 'OrderDate', descending: true }
        ]
      }">
      <columns>
        <Column><Text text="Order Number"/></Column>
        <Column><Text text="Order Date"/></Column>
        <Column><Text text="Customer Name"/></Column>
        <Column hAlign="End"><Text text="Net Value"/></Column>
      </columns>
      <items>
        <ColumnListItem>
          <cells>
            <Text text="{OrderNumber}"/>
            <Text text="{path: 'OrderDate', type: 'sap.ui.model.odata.type.Date', formatOptions: { style: 'medium' }}"/>
            <Text text="{CustomerName}"/>
            <ObjectNumber number="{path: 'NetValue', type: 'sap.ui.model.odata.type.Decimal', formatOptions: { minFractionDigits: 2, maxFractionDigits: 2 }}"/>
          </cells>
        </ColumnListItem>
      </items>
    </Table>
  </Page>
</mvc:View>
=== FILE: app/salesorders/webapp/controller/SalesOrders.controller.js ===
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";
  // Intentionally empty: all data binding is declared in the XML view.
  return Controller.extend("salesorders.controller.SalesOrders", {
    onInit: function () {}
  });
});

## STEP 5 — Health check
=== FILE: scripts/verify.js ===
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

=== END OF BLUEPRINT ===
