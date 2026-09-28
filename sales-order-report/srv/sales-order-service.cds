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
