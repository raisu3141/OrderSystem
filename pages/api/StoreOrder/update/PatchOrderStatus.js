// pages/api/updateCookStatus.js
import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrderSchema from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  const { storeName, orderId } = req.query;  // クエリパラメータからidを取得
  const { cookStatus, getStatus } = req.body; // 更新するcookStatusをリクエストボディから取得
  const collectionName = storeName + "_orders";

  // cookStatusがtrueまたはfalse以外の場合のバリデーション
  if (typeof cookStatus !== 'boolean') {
    return res.status(400).json({ success: false, message: 'cookStatus must be a boolean value' });
  }
  if (typeof getStatus !== 'boolean'){
    return res.status(400).json({ success: false, message: 'getStatus must be a boolean value' });
  }

  try {
    const StoreOrder = mongoose.model(collectionName, StoreOrderSchema);
    const updatedStatus = await StoreOrder.findOneAndUpdate(
      {orderId: orderId}, 
      { 
        cookStatus: cookStatus, 
        getStatus: getStatus 
      }, 
      {new: true }
    );

      res.status(200).json(updatedStatus);

    if (!updatedStatus) {
      return res.status(404).json({ success: false, message: 'Status not found' });
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}