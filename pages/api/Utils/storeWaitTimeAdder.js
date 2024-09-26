// pages/api/Utils/storeWaitTimeAdder.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';
import StoreData from '../../../models/StoreData';

export default async function handler(req, res) {
    if (req.method === 'POST') {
      await storeWaitTimeAdder(req, res);
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
}


export const storeWaitTimeAdder = async (req, res) => {
  const { orderList } = req.body;

  await connectToDatabase();
  try {
    // 屋台ごとの待ち時間を管理するオブジェクト
    const storeWaitTimes = {};

    // 注文リストを処理する
    for (const order of orderList) {
      const { productId, storeId, orderQuantity } = order;

      // 商品の調理時間を取得
      const product = await ProductData.findById(productId);
      const store = await StoreData.findById(storeId);

      if (!product || !store) {
        return res.status(404).json({ message: '商品または屋台が見つかりませんでした。' });
      }

      // 調理時間を個数に応じて計算
      const addTime = product.cookTime * orderQuantity;

      // 屋台の待ち時間を更新
      storeWaitTimes[storeId] = (storeWaitTimes[storeId] || store.storeWaitTime) + addTime;

      // 屋台の待ち時間をデータベースに反映
      store.storeWaitTime += addTime;
      await store.save();
    }

    // 各屋台の更新後の待ち時間をレスポンスとして返す
    return res.status(200).json({ storeWaitTimes });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'エラーが発生しました。' });
  }
};