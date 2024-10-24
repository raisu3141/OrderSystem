import { Order } from '../../types/ordermanage';
  
  export async function fetchOrders(storeName: string): Promise<Order[]> {
    const response = await fetch(`/api/StoreOrder/getter/getOrders?storeName=${storeName}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data: Order[] = await response.json();
  
    return data;
  }

export type { Order };
