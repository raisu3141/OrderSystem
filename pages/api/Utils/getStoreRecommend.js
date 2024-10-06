import connectToDatabase from '../../../lib/mongoose';
import ProductData from'../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {
  await connectToDatabase();
  
  try {
    // ストアデータを取得
    const store = await StoreData.findById(req.body._id);

    // ストアが見つからない場合はエラーを返す
    if (!store) {
      return res.status(404).json({ success: false, message: `Store not found ${store}` });
    }

    // ストアの商品リストを取得
    const productIds = store.productList;

    // すべての商品の_idとcountを取得
    const products = await ProductData.find({ _id: { $in: productIds } }).select('_id soldCount');

    // countが最大の商品のIDを取得
    let maxCountId = null;
    let maxCount = -1;

    products.forEach(product => {
      if (product.soldCount > maxCount) {
        maxCount = product.soldCount;
        maxCountId = product._id;
      }
    });

    // 結果を返す
    if (maxCountId) {
      res.status(200).json({ success: true, maxCountId });
    } else {
      res.status(404).json({ success: false, message: `No products found ${productIds}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
}
