import mongoose from 'mongoose';  // mongooseのインポートを追加
import connectToDatabase from '../../../lib/mongoose';
import StoreOrderSchema from'../../../models/StoreOrder'; // ProductData モデルをインポート
import orderData from'../../../models/OrderData';
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res){
    await connectToDatabase();
    const {orderId} = req.query;
    console.log(orderId);
    
    try{
        //全屋台名を取得・リストに分けるためのデータ作成
        let stores = [];
        const storeData = await StoreData.find({}, "_id storeName storeWaitTime");
        storeData.forEach(data => {
            stores.push({[data.storeName]: [], storeId: data._id, waitTime: data.storeWaitTime});
        });

        //注文の受け取り
        const orders = await orderData.findById(orderId, "_id orderList")
        .populate([
            {path: "orderList.storeId", select: "storeName"}
        ]);


        //StoreOrderSchemaにフォーマットを合わせる
        const formatOrders = {
            orderList: orders.orderList.map(data => ({
                productId: data.productId,
                storeId: data.storeId._id,
                orderQuantity: data.orderQuantity,
                storeName: data.storeId.storeName
            })),
        };

        //屋台ごとにリストに仕分け
        formatOrders.orderList.forEach(data => {
            for(let i = 0; i < stores.length; i++){
                let keyName = Object.keys(stores[i])[0];
                if(keyName === data.storeName){
                    stores[i][keyName].push(data);
                    delete stores[i][keyName][stores[i][keyName].length - 1].storeName;
                }
            }
        });

        //追加されなかったオブジェクトの削除
        const cleaneData = stores.filter(item => {
            // 各オブジェクトのプロパティをチェックし、リストが空でないものを保持
            return Object.values(item).some(value => Array.isArray(value) && value.length > 0);
        });

        for (const data of cleaneData) {
            const storeName = Object.keys(data)[0];
            
            // 既存のモデルがあるかどうか確認し、なければ新しいモデルを定義
            const StoreOrder = mongoose.models[storeName + "_orders"] || mongoose.model(storeName + "_orders", StoreOrderSchema);
            
            // new キーワードを使ってインスタンスを作成
            const allStoreOrder = new StoreOrder({
                orderId: orders._id, 
                orderList: data[storeName],  // リストのデータを渡す
            });
            
            // データベースに保存
            await allStoreOrder.save();
        }

        const waitTimes = {};
        cleaneData.forEach(data =>{
            waitTimes[data.storeId] = data.waitTime;
        });

        const updatedStatus = await orderData.findOneAndUpdate(
            {_id: orderId}, 
            { 
              waitTime: waitTimes
            }, 
            {new: true }
        );
        
        if (!updatedStatus) {
            return res.status(404).json({ success: false, message: 'Status not found' });
        }

        res.status(200).json(updatedStatus);
    }
    catch(error){
        console.error(error); // エラーをコンソールに出力
        res.status(500).json({ success: false, message: error.message });
    }
}

