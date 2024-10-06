// pages/api/postPRODUCTS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    const allProductData = new ProductData(req.body);
    await allProductData.save();
    res.status(201).json(allProductData);
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving product data:", error);
    res.status(400).json({
      success: false,
      message: "Error saving product data",
      error: error.message, // エラーメッセージを含める
    });
  }
}
