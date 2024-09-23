// pages/api/getSTORES_DATA.js
import connectToDatabase from '../../lib/mongoose';
import StoreData from '../../models/StoreData';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const store = new StoreData(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving store data:", error);
    res.status(400).json({
      success: false,
      message: "Error saving store data",
      error: error.message, // エラーメッセージを含める
    });
  }
}
