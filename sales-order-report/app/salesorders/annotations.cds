using SalesOrderService from '../../srv/sales-order-service';

annotate SalesOrderService.SalesOrders with @(
  UI.HeaderInfo: {
    TypeName: 'Sales Order',
    TypeNamePlural: 'Sales Orders',
    Title: { Value: OrderNumber },
    Description: { Value: CustomerName }
  },
  UI.LineItem: [
    { Value: OrderNumber, Label: 'Order Number' },
    { Value: OrderDate, Label: 'Order Date' },
    { Value: CustomerName, Label: 'Customer' },
    { Value: NetValue, Label: 'Net Value' }
  ],
  UI.SelectionFields: [
    OrderNumber,
    CustomerName,
    OrderDate
  ],
  UI.PresentationVariant: {
    GroupBy: [ CustomerName ],
    SortOrder: [
      { Property: CustomerName, Descending: false },
      { Property: OrderDate, Descending: true }
    ],
    Visualizations: [ '@UI.LineItem' ]
  }
);
