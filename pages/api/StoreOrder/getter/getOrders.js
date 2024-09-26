// pages/api/getSTORES_ORDER.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';
import OrderData from '../../../../models/OrderData';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
    await connectToDatabase();
    try {
      const allStoreOrder = await StoreOrder.find({})
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

