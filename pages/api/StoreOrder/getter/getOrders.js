// pages/api/getOrders.js
import mongoose from 'mongoose';  // mongooseのインポートを追加
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrderSchema from '../../../../models/StoreOrder';
import OrderData from '../../../../models/OrderData';
import ProductData from '../../../../models/ProductData';
import { cloneElement } from 'react';

export default async function handler(req, res) {
    const { storeName } = req.query;
    const collectionName = storeName + "_orders";

    await connectToDatabase();
    const { storeId } = req.query;
    try {
      const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    
      if (collections.length === 0) {
        // コレクションが存在しない場合はエラーレスポンスを返す
        return res.status(404).json({ success: false, message: `Collection '${collectionName}' does not exist.` });
      }
  
      // コレクションが存在する場合のみモデルを取得
      const StoreOrder = mongoose.model(collectionName, StoreOrderSchema);
      const allStoreOrder = await StoreOrder.find({}, "orderId orderList.productId orderList.orderQuantity cookStatus getStatus orderTime")
        .populate([
          {path: 'orderId', select: 'clientName tiketNumber'}, 
          {path: 'orderList.productId', select: 'productName productImageUrl'},
        ]);

      const formattedOrders = allStoreOrder.map(order => ({
        orderId:order.orderId._id,
        ticketNumber: order.orderId.tiketNumber,
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

