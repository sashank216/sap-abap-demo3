# Open Sales Orders CAP Report

This project is a standalone SAP Cloud Application Programming Model (CAP) application. It exposes local sample open sales orders through an OData V4 service and provides a freestyle UI5 table with customer grouping.

## Prerequisites

- Node.js 22 or newer
- npm

## Run locally

Install the CAP dependencies and start the local server:

```sh
npm install
npm start
```

`cds watch` creates an in-memory SQLite database through `@cap-js/sqlite` and loads the CSV seed data automatically. No SAP system or external database connection is required.

Open the service at:

- OData service: http://localhost:4004/odata/v4/sales-order/SalesOrders
- UI5 sales orders report: http://localhost:4004/salesorders/webapp/index.html

The service exposes `SalesOrders` with order number, order date, customer name, and net value. The UI table sorts records by customer and date and groups rows by customer with `sap.ui.model.Sorter`.

## Project layout

```text
db/
  schema.cds                         SalesOrders entity
  data/sales.orders-SalesOrders.csv  Local sample data
srv/
  sales-order-service.cds            OData V4 service
app/salesorders/
  annotations.cds                    OData UI annotations
  webapp/                            Freestyle UI5 app
```
