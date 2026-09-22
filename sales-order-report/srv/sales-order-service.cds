using { sales.orders as db } from '../db/schema';

@path: 'sales-order'
@title: 'Open Sales Orders'
service SalesOrderService {
  @readonly
  entity SalesOrders as projection on db.SalesOrders;
}
