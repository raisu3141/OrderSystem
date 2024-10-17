// pages/api/OrderData/getter/getNotCanceledOrder.js
import connectToDatabase from '../../../../lib/mongoose';
import OrderData from '../../../../models/OrderData';

export default async function handler(req, res) {
  await connectToDatabase();  // データベースせ接続

  try {
    // キャンセルされていない注文データを取得
    const notCanceledOrder = await OrderData.find({
      cookStatus: false,
      cancelStatus: false,
    });
    res.status(200).json(notCanceledOrder);
  } catch {
    res.status(400).json({ success: false });
  }
}
