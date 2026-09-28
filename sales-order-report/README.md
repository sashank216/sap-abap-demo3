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
