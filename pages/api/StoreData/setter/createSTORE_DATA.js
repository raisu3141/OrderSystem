import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';
import StoreOrderSchema from '../../../../models/StoreOrder';
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

  let storeID;
  let storeName;

  // 屋台作成
  try {
    console.log(req.body); // ここでreq.bodyがundefinedの場合、リクエストの内容を確認
    const store = new StoreData(req.body);
    await store.save();
    storeID = store._id;
    storeName = store.storeName;
  } catch (error) {
    console.error("Error saving store data:", error);
    return res.status(401).json({
      success: false,
      message: "Error saving store data",
      error: error.message,
    });
  }

  if (!storeName) {
    return res.status(402).json({
      success: false,
      message: "Invalid storeName",
    });
  }

  try {
    // 画像をGCSにアップロード
    const publicUrl = await uploadToGCS(req.file);
    console.log('URL:', publicUrl);

    // 画像のURLをStoreDataに追加
    const updatedStoreData = await StoreData.findByIdAndUpdate(
      storeID,
      { $set: { storeImageUrl: publicUrl } },
      { new: true, runValidators: true }
    );

    if (!updatedStoreData) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(201).json({ success: true, imageUrl: publicUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ success: false, message: "Error uploading image" });
  }

  // 屋台Nを作成   
  try {
    const StoreOrder = mongoose.model(storeName + "_Order", StoreOrderSchema);

    const tempDoc = new StoreOrder({
      orderId: storeID,
      tiketNumber: 1,
      orderList: [],
      clientName: "仮データ",
    });
    await tempDoc.save();
    
    await StoreOrder.findByIdAndDelete(tempDoc._id);
    console.log('コレクションのみが作成されました');
  } catch (error) {
    console.error("Error creating storeOrder data:", error);
    return res.status(403).json({
      success: false,
      message: "Error creating storeOrder data",
      error: error.message,
    });
  }

  // 屋台データにStoreOrderのコレクション名を格納
  try {
    const updateFields = { storeOrder: storeName + "_order" };
    const updatedStore = await StoreData.findByIdAndUpdate(
      storeID, 
      updateFields, 
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    res.status(200).json(updatedStore);
  } catch (error) {
    console.error("Error updating store data:", error);
    return res.status(400).json({
      success: false,
      message: "Error updating store data",
      error: error.message,
    });
  }
}

// multerを使って画像ファイルを処理するための設定
export const config = {
  api: {
    bodyParser: false,  // multerで処理するために無効化
  },
};
