// pages/api/postSTORES_ORDER.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allStoreOrder = new StoreOrder(req.body);
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
