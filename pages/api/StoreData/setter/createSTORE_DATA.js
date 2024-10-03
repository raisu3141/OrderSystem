import mongoose from 'mongoose';  // mongooseのインポートを追加
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';
import StoreOrderSchema from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  let storeID;  // storeIDをスコープの外で宣言
  let storeName;

  // 屋台作成
  try {
    const store = new StoreData(req.body);
    await store.save();
    storeID = store._id;
    storeName = store.storeName;
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error saving store data:", error);
    return res.status(401).json({
      success: false,
      message: "Error saving store data",
      error: error.message, // エラーメッセージを含める
    });
  }

  // storeNameが正しく取得されていない場合、処理を終了
  if (!storeName) {
    return res.status(402).json({
      success: false,
      message: "Invalid storeName",
    });
  }

  // 屋台Nを作成   
  try {
    // 動的にモデルを作成
    const StoreOrder = mongoose.model(storeName + "_Order", StoreOrderSchema);

    // 仮データ挿入
    const tempDoc = new StoreOrder({
      tiketNumber: 1,
      orderList: [],
      clientName: "仮データ",
    });
    await tempDoc.save();
    
    // 保存直後にドキュメントを削除
    await StoreOrder.findByIdAndDelete(tempDoc._id);
    console.log('コレクションのみが作成されました');
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error creating storeOrder data:", error);
    return res.status(403).json({
      success: false,
      message: "Error creating storeOrder data",
      error: error.message, // エラーメッセージを含める
    });
  }

  // 屋台データにStoreOrderのコレクション名を格納
  try {
    const updateFields = { storeOrder: storeName + "_Order" };
    // Find the store by _id and update it with the new fields
    const updatedStore = await StoreData.findByIdAndUpdate(
      storeID, 
      updateFields, 
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // 更新されたデータを返す
    res.status(200).json(updatedStore);
  } catch (error) {
    // エラーメッセージを含めた詳細を表示
    console.error("Error updating store data:", error);
    return res.status(400).json({
      success: false,
      message: "Error updating store data",
      error: error.message, // エラーメッセージを含める
    });
  }
}
