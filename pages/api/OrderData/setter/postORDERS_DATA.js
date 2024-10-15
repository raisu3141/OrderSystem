// pages/api/postORDERS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import OrderData from '../../../../models/OrderData';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allOrderData = new OrderData(req.body);
    await allOrderData.save();
    res.status(201).json(allOrderData);
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving order data:", error);
    res.status(400).json({
      success: false,
      message: "Error saving order data",
      error: error.message, // エラーメッセージを含める
    });
  }
}
