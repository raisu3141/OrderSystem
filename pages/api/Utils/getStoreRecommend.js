import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {
  let results = [];
  let storeIds = [];
  let products = [];

  // データベースに接続
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Error connecting to database:', error);
    return res.status(500).json({ success: false, message: 'Failed to connect to the database.' });
  }

  try {
    // StoreData から全ての _id を取得
    storeIds = await StoreData.find({}, '_id');
    if (storeIds.length === 0) {
      return res.status(404).json({ success: false, message: 'No stores found.' });
    }
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

      // ストアが見つからない場合
      if (!store) {
        console.error(`Store not found: ${storeId}`);
        continue; // ただちに次のループに進む
      }

      // ストアの商品リストを取得
      const productIds = store.productList;
      if (productIds.length === 0) {
        console.error(`No products found for store: ${storeId}`);
        continue; // 商品が見つからなかった場合も次に進む
      }

      // すべての商品の _id と soldCount を取得
      const productsData = await ProductData.find({ _id: { $in: productIds } }).select('_id soldCount');
      if (productsData.length === 0) {
        console.error(`No product data found for store: ${storeId}`);
        continue; // 商品データが空だった場合も次に進む
      }

      // countが最大の商品のIDを取得
      let maxCountId = null;
      let maxCount = -1;

      productsData.forEach(product => {
        if (product.soldCount > maxCount) {
          maxCount = product.soldCount;
          maxCountId = product._id;
        }
      });

      if (maxCountId) {
        results.push(maxCountId); // append の代わりに push を使用
      } else {
        console.error(`No product with a soldCount found for store: ${storeId}`);
      }
    } catch (error) {
      console.error(`Error processing store ${storeId}: ${error.message}`);
      continue; // 特定のストアでエラーが発生しても、全体を中断しない
    }
  }

  if (results.length === 0) {
    return res.status(404).json({ success: false, message: 'No valid products found.' });
  }

  try {
    await Promise.all(
      results.map(async (id) => {
        const product = await ProductData.find({ _id: id })
          .select('productName price productImageUrl')
          .populate('storeId', 'storeName'); // storeId から storeName だけを取得
        
        products.push(product);  // productを配列に追加
      })
    );
  } catch (error) {
    console.error('Error fetching product details:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }

  // データをフォーマットしてレスポンスを返す
  try {
    const formattedData = products.flat().map(item => ({
      storeName: item.storeId.storeName,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      price: item.price
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error formatting the response:', error);
    return res.status(500).json({ success: false, message: 'Failed to format the response.' });
  }
}
