// pages/api/Utils/getStoreProductData.js
import connectToDatabase from '../../../lib/mongoose';
import '../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    // StoreData モデルを使用してクエリを実行し、productList を populate
    const storeProducts = await StoreData.findOne({storeName: "demoStore"})
      .populate('productList')
      .then((storeProduct) => { return storeProduct.productList })
      .catch((error) => { return error });
    res.status(200).json(storeProducts);  // 取得したデータをクライアントに返す
  } catch (error) {
    res.status(500).json({
      message: 'データの取得に失敗しました',
      error: error.message  // エラーメッセージを返す
    });
  }
}
