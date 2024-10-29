// pages/api/Utils/getStoreProductData.js
import connectToDatabase from '../../../lib/mongoose';
import '../../../models/ProductData'; // ProductData モデルをインポート
import StoreData from '../../../models/StoreData'; // StoreData モデルをインポート

export default async function handler(req, res) {
  await connectToDatabase();
  try {
    // StoreDataモデルを使用してクエリを実行し、productList を populate
    const storeProducts = await StoreData.find({}, 'storeName productList openDay')
      .populate('productList', 'productName productImageUrl price stock');

    // フロントに渡せるようにフォーマット
    const formattedStoreProducts = storeProducts.map((storeProduct) => ({
      storeId: storeProduct._id,
      storeName: storeProduct.storeName,
      productList: storeProduct.productList.map((product) => ({
        productId: product._id,
        productName: product.productName,
        productImageUrl: product.productImageUrl,
        price: product.price,
        stock: product.stock,
      })),
      openDay: storeProduct.openDay
    }));

    res.status(200).json(formattedStoreProducts);  // 取得したデータをクライアントに返す

  } catch (error) {
    res.status(500).json({
      message: 'データの取得に失敗しました',
      error: error.message  // エラーメッセージを返す
    });
  }
}
