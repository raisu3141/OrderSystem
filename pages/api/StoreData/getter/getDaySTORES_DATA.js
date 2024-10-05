// pages/api/getSTORES_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';

export default async function handler(req, res) {
  await connectToDatabase();

  // デストラクチャリング法
  const { openDay } = req.body; // req.bodyからdayを取得
//   const day = req.body.openDay
  try {
    // dayフィールドがリクエストで渡された値と一致するデータを検索
    const stores = await StoreData.find({ openDay: openDay });
    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ success: false });
  }
}
