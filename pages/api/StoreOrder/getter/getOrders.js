// pages/api/getORDERs.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';
import OrderData from '../../../../models/OrderData';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
    await connectToDatabase();
    const { storeId } = req.query;
    try {
      const allStoreOrder = await StoreOrder.find({} ,"orderId orderList.productId orderList.orderQuantity cookStatus getStatus orderTime")
        .populate([
          {path: 'orderId', select: 'clientName tiketNumber'}, 
          {path: 'orderList.productId', select: 'productName productImageUrl'},
        ]);

      const formattedOrders = allStoreOrder.map(order => ({
        orderId:order.orderId._id,
        tiketNumber: order.orderId.tiketNumber,
        clientName: order.orderId.clientName,   
        orderList: order.orderList.map(item => ({
          productId: item.productId._id,
          productName: item.productId.productName,
          orderQuantity: item.orderQuantity,
        })),
        cookStatus: order.cookStatus,            
        getStatus: order.getStatus,              
      }));

      return res.status(200).json(formattedOrders);
    } catch (error) {
      console.error(error); // エラーをコンソールに出力
      res.status(400).json({ success: false, error: error.message });
    }
    
  }

