// pages/api/postPRODUCTS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';
import StoreData from '../../../../models/StoreData';

export default async function handler(req, res) {
  await connectToDatabase();
  let storeID;  // storeIDをスコープの外で宣言
  let productID;
  try {
    // 新しいProductDataを保存
    const Product = new ProductData(req.body);
    await Product.save();
    
    // storeIdを取得
    storeID = Product.storeId;
    productID = Product._id;
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving product data:", error);
    return res.status(400).json({
      success: false,
      message: "Error saving product data",
      error: error.message, // エラーメッセージを含める
    });
  }

  try {
    // storeIdに該当するStoreDataを見つけてproductListに追加
    const updatedStoreData = await StoreData.findByIdAndUpdate(
      storeID, 
      { $push: { productList: productID } }, // productListにProduct._idを追加
      { new: true, runValidators: true }
    );
    
    if (!updatedStoreData) {
      return res.status(404).json({ success: false, message: 'StoreData not found' });
    }
    res.status(200).json(updatedStoreData);
  } catch (error) {
    console.error("Error updating store data:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}
