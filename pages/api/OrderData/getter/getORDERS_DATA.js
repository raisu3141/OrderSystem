// pages/api/getORDERS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import OrderData from '../../../../models/OrderData';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allOrderData = await OrderData.find({});
    res.status(200).json(allOrderData);
  } catch {
    // エラーメッセージは必要ない場合は削除
    res.status(400).json({ success: false });
  }
}
