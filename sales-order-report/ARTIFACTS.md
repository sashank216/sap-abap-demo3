| ID | type | name | status | source | dependsOn |
|---|---|---|---|---|---|
| CAP-001 | CAP_PROJECT | sales-order-report | created | blueprint | — |
| SO-DATA-001 | DATASET | sales-SalesOrders.csv (14 rows, 12 open) | created | blueprint | CAP-001 |
| CAP-SVC-001 | CAP_SERVICE | SalesOrderService.SalesOrders (open only) | created | blueprint | SO-DATA-001 |
| FIORI-001 | UI5_APPLICATION | Open Sales Orders screen | created | blueprint | CAP-SVC-001 |
| GIT-001 | REPOSITORY_COMMIT | sap-abap-demo3/sales-order-report | planned | git | CAP-001…FIORI-001 |
