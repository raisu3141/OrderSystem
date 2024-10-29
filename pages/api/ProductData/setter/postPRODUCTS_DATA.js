// pages/api/postPRODUCTS_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';
import StoreData from '../../../../models/StoreData';
import multer from 'multer';
import { uploadToGCS } from '../../../../lib/gcs'; // GCSへのアップロード関数

// multerのストレージ設定
const upload = multer({
  storage: multer.memoryStorage(), // メモリにファイルを保持
});

// multerミドルウェアを外部関数として定義
const uploadMiddleware = upload.single('image');

export default async function handler(req, res) {
  // multerミドルウェアを適用
  await new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch((err) => {
    console.error("Multer error:", err);
    return res.status(500).json({ success: false, message: 'Error uploading image', error: err.message });
  });

  await connectToDatabase();
  let storeID;  // storeIDをスコープの外で宣言
  let productID;  // productIDをスコープの外で宣言
  try {
    // 新しいProductDataを保存
    if (req.body.cookTime) {
      req.body.cookTime = req.body.cookTime * 1000 * 60;
    }
    else{
      return res.status(401).json({ success: false, message: 'Error cookTime edit'});
    }

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
  } catch (error) {
    console.error("Error updating store data:", error);
    res.status(400).json({ success: false, message: error.message });
  }

  try {
    // 画像をGCSにアップロード
    const publicUrl = await uploadToGCS(req.file);
    console.log('URL:', publicUrl);

    // 画像のURLをStoreDataに追加
    const updatedProductData = await ProductData.findByIdAndUpdate(
      productID,
      { $set: { productImageUrl: publicUrl } },
      { new: true, runValidators: true }
    );

    if (!updatedProductData) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json(updatedProductData);
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ success: false, message: "Error uploading image" });
  }
}

// multerを使って画像ファイルを処理するための設定
export const config = {
  api: {
    bodyParser: false,  // multerで処理するために無効化
  },
};