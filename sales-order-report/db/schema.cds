namespace sales.orders;

/**
 * Open sales orders used by the report.
 * All records in the local sample dataset represent open orders.
 */
entity SalesOrders {
  key OrderNumber : String(10);
      OrderDate   : Date;
      CustomerName: String(100);
      NetValue    : Decimal(15, 2);
}
