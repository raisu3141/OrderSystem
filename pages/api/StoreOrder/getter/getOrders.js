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
      return res.status(200).json(allStoreOrder);
    } catch (error) {
      console.error(error); // エラーをコンソールに出力
      res.status(400).json({ success: false, error: error.message });
    }
    
  }
