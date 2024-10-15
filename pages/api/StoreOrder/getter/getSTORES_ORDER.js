// pages/api/getSTORES_ORDER.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allStoreOrder = await StoreOrder.find({});
    res.status(200).json(allStoreOrder);
  } catch {
    // エラーメッセージは必要ない場合は削除
    res.status(400).json({ success: false });
  }
}
