// pages/api/Utils/storeWaitTimeAdder.js
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';
import StoreOrder from '../../../models/StoreOrder';

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
    const storeWaitTimes = {};

    // 注文リストを処理する
    for (const order of orderList) {
      const { productId, storeId, orderQuantity } = order;

      const product = await ProductData.findById(productId);
      const store = await StoreData.findById(storeId);

      if (!product || !store) {
        return res.status(404).json({ message: '商品または屋台が見つかりませんでした。' });
      }

      // 調理時間を個数に応じて計算
      const addTime = product.cookTime * orderQuantity;
      storeWaitTimes[storeId] = (storeWaitTimes[storeId] || store.storeWaitTime) + addTime;
    }

    // 各屋台の待ち時間をデータベースに一括更新
    await Promise.all(
      Object.keys(storeWaitTimes).map(async (storeId) => {
        const store = await StoreData.findById(storeId);
        if (store) {
          store.storeWaitTime = storeWaitTimes[storeId];
          try {
            await store.save();
          } catch (saveError) {
            console.error(`Error saving store ${storeId}:`, saveError);
            return res.status(500).json({ message: '待ち時間の保存中にエラーが発生しました。', error: saveError.message });
          }
        }
      })
    );

    for (const storeId in storeWaitTimes) {
      const waitTime = storeWaitTimes[storeId];
      
      // 対応するStoreOrderを取得
      const storeOrder = await StoreOrder.findOne({ "orderList.storeId": storeId });

      if (!storeOrder) {
          return res.status(404).json({ message: `StoreOrder for storeId ${storeId} not found` });
      }

      // StoreOrderのwaitTimeを更新
      storeOrder.waitTime = waitTime;
      await storeOrder.save();
    }

    return res.status(200).json({ storeWaitTimes });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'エラーが発生しました。', error: error.message });
  }
};

export const storeWaitTimeAdder2 = async (orderList, session) => {
  await connectToDatabase();
  try {
    const storeWaitTimes = {};

    // 注文リストを処理する
    for (const order of orderList) {
      const { productId, storeId, orderQuantity } = order;

      let product, store;

      // 商品と屋台を取得
      try {
        product = await ProductData.findById(productId).session(session);
        store = await StoreData.findById(storeId).session(session);
      } catch (fetchError) {
        console.error(`Error fetching product or store (productId: ${productId}, storeId: ${storeId}):`, fetchError);
        throw new Error('データの取得中にエラーが発生しました。');
      }

      if (!product || !store) {
        throw new Error('商品または屋台が見つかりませんでした。');
      }

      // 調理時間を個数に応じて計算
      const addTime = product.cookTime * orderQuantity;
      storeWaitTimes[storeId] = (storeWaitTimes[storeId] || store.storeWaitTime) + addTime;
    }

    // 各屋台の待ち時間をデータベースに一括更新
    await Promise.all(
      Object.keys(storeWaitTimes).map(async (storeId) => {
        let store;

        try {
          store = await StoreData.findById(storeId).session(session);
        } catch (fetchError) {
          console.error(`Error fetching store (storeId: ${storeId}):`, fetchError);
          throw new Error('屋台のデータ取得中にエラーが発生しました。');
        }

        if (store) {
          store.storeWaitTime = storeWaitTimes[storeId];

          try {
            await store.save({ session });
          } catch (saveError) {
            console.error(`Error saving store ${storeId}:`, saveError);
            throw new Error('待ち時間の保存中にエラーが発生しました。');
          }
        } else {
          console.warn(`Store not found (storeId: ${storeId}).`);
        }
      })
    );

    return storeWaitTimes;

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    throw new Error('エラーが発生しました。' + error.message);
  }
};

// ESLintの警告を無効にするためのコメント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
mongoose;