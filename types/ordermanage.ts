export interface OrderList {
    productId: string;
    productName: string;
    orderQuantity: number;
  }
  
  export interface Order {
    clientName: string;
    cookStatus: boolean;
    cancelStatus: boolean;
    getStatus: boolean;
    orderId: string;
    orderList: OrderList[];
    ticketNumber: number;
    orderTime: string;
  }