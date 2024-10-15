import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {

  let results = [];
  let storeIds = [];
  let products = [];

  // データベースに接続
  await connectToDatabase();

  try {
    // StoreData から全ての _id を取得
    storeIds = await StoreData.find({}, '_id');
  } catch (error) {
    console.error('Error fetching store IDs:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch store IDs.' });
  }

  // 非同期処理のため for...of を使用
  for (const storeIdObj of storeIds) {
    const storeId = storeIdObj._id;

    try {
      // ストアデータを取得
      const store = await StoreData.findById(storeId);

      // ストアが見つからない場合はエラーメッセージを返す
      if (!store) {
        return res.status(404).json({ success: false, message: `Store not found: ${storeId}` });
      }

      // ストアの商品リストを取得
      const productIds = store.productList;

      // すべての商品の_idとsoldCountを取得
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
        results.push(maxCountId); // append の代わりに push を使用
      } else {
        return res.status(404).json({ success: false, message: `No products found for store: ${storeId}` });
      }
    } catch (error) {
      console.error(`Error processing store ${storeId}: ${error.message}`);
      return res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
  }

  await Promise.all(
    results.map(async (id) => {
      const product = await ProductData.find({ _id: id })
        .select('productName price productImageUrl')
        .populate('storeId', 'storeName');  // storeId から storeName だけを取得
      
      products.push(product);  // productを配列に追加
    })
  );

  const formattedData = products.flat().map(item => ({
    storeName: item.storeId.storeName,
    productName: item.productName,
    productImageUrl: item.productImageUrl,
    price: item.price
}));

  res.status(200).json(formattedData);
}

