// pages/api/updateCookStatus.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;  // クエリパラメータからidを取得
  const { cookStatus, getStatus } = req.body; // 更新するcookStatusをリクエストボディから取得
  console.log(req.body);

  // cookStatusがtrueまたはfalse以外の場合のバリデーション
  if (typeof cookStatus !== 'boolean') {
    return res.status(400).json({ success: false, message: 'cookStatus must be a boolean value' });
  }
  if (typeof getStatus !== 'boolean'){
    return res.status(400).json({ success: false, message: 'getStatus must be a boolean value' });
  }

  try {
    const updatedStatus = await StoreOrder.findByIdAndUpdate(id, { cookStatus, getStatus }, { new: true });
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