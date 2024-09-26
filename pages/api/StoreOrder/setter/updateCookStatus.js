// pages/api/updateCookStatus.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;  // クエリパラメータからidを取得
  const { cookStatus } = req.body; // 更新するcookStatusをリクエストボディから取得

  // cookStatusがtrueまたはfalse以外の場合のバリデーション
  if (typeof cookStatus !== 'boolean') {
    return res.status(400).json({ success: false, message: 'cookStatus must be a boolean value' });
  }

  try {
    const updatedOrder = await StoreOrder.findByIdAndUpdate(id, { cookStatus }, {
      new: true, // 更新後のドキュメントを返す
      runValidators: true, // バリデーションを実行
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Status not found' });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}