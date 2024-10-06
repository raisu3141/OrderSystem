// pages/api/getOrders.js
import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrderSchema from '../../../../models/StoreOrder';
import OrderData from '../../../../models/OrderData';
import ProductData from '../../../../models/ProductData';

// モデルをキャッシュするためのオブジェクト
const modelCache = {};

export default async function handler(req, res) {
    const { storeName } = req.query;
    const collectionName = storeName + "_orders";

    await connectToDatabase();

    try {
        const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    
        if (collections.length === 0) {
            return res.status(404).json({ success: false, message: `Collection '${collectionName}' does not exist.` });
        }
  
        // キャッシュされたモデルを使用するか、新しいモデルを作成してキャッシュする
        let StoreOrder;
        if (modelCache[collectionName]) {
            StoreOrder = modelCache[collectionName];
        } else {
            StoreOrder = mongoose.models[collectionName] || mongoose.model(collectionName, StoreOrderSchema);
            modelCache[collectionName] = StoreOrder;
        }

        const allStoreOrder = await StoreOrder.find({}, "orderId orderList.productId orderList.orderQuantity cookStatus getStatus orderTime")
            .populate([
                {path: 'orderId', select: 'clientName ticketNumber'}, 
                {path: 'orderList.productId', select: 'productName productImageUrl'},
            ]);

        const formattedOrders = allStoreOrder.map(order => ({
            orderId: order.orderId._id,
            ticketNumber: order.orderId.ticketNumber,
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
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}