// pages/api/postSTORES_ORDER.js
import mongoose from 'mongoose';  // mongooseのインポートを追加
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrderSchema from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  const {storeName} = req.query;
  console.log(typeof(storeName));
  const collectionName = storeName + "_orders";

  await connectToDatabase();
  try {
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      // コレクションが存在しない場合はエラーレスポンスを返す
      return res.status(404).json({ success: false, message: `Collection '${collectionName}' does not exist.` });
    }

    const StoreOrder = mongoose.model(collectionName, StoreOrderSchema);
    const allStoreOrder = await StoreOrder(req.body);
    await allStoreOrder.save();
    res.status(201).json(allStoreOrder);
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving order by store:", error);
    res.status(400).json({
      success: false,
      message: "Error saving order by store",
      error: error.message, // エラーメッセージを含める
    });
  }
}
