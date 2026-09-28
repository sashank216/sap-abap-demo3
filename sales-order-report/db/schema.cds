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
