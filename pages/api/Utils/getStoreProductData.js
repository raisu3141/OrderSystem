// pages/api/Utils/getStoreProductData.js
import connectToDatabase from '../../../lib/mongoose';
import '../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    // StoreDataモデルを使用してクエリを実行し、productList を populate
    const storeProducts = await StoreData.find({}, 'storeName productList openDay')
      .populate('productList', 'productName productImageUrl price stock')
      .then((storeProduct) => { return storeProduct })
      .catch((error) => { return error });
    res.status(200).json(storeProducts);  // 取得したデータをクライアントに返す

  } catch (error) {
    res.status(500).json({
      message: 'データの取得に失敗しました',
      error: error.message  // エラーメッセージを返す
    });
  }
}
