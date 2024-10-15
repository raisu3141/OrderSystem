// pages/api/getPRODUCTS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allProductData = await ProductData.find({});
    res.status(200).json(allProductData);
  } catch {
    // エラーメッセージは必要ない場合は削除
    res.status(400).json({ success: false });
  }
}
