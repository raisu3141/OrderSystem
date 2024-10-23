// pages/api/Utils/storeWaitTimeSuber.js
import mongoose from 'mongoose';
import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';
import StoreOrderSchema from '../../../models/StoreOrder';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        await storeWaitTimeSuber(req, res);
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export const storeWaitTimeSuber = async (req, res) => {
    const { orderList } = req.body;

    await connectToDatabase();
    try {
        let subtime = 0; // 初期化

        for (const order of orderList) {
            // 注文リストの取得
            const { productId, storeName, orderQuantity } = order;

            // メニューと屋台を取得
            const product = await ProductData.findById(productId);
            const store = await StoreData.findOne({ storeName: storeName });

            // メニューと屋台が取れたかエラー処理
            if (!product || !store) {
                return res.status(404).json({ message: '商品または屋台が見つかりませんでした。' });
            }

            const cookTime = product.cookTime * orderQuantity;
            subtime += cookTime;
        }

        // 屋台の待ち時間更新
        const store = await StoreData.findOne({ storeName: orderList[0].storeName }); // 最後の注文のstoreNameで取得
        store.storeWaitTime -= subtime;

        await store.save();

        // データを返す必要はないが、処理が成功したことを返す
        return res.status(200).json({ status: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'エラーが発生しました' });
    }
}

export const storeWaitTimeSuber2 = async (orderList, session) => {
    await connectToDatabase();
    try {
        const storeWaitTimes = {};

        // 注文リストを処理する
        for (const order of orderList) {
            const { productId, storeId, orderQuantity } = order;

            try {
                const product = await ProductData.findById(productId).session(session);
                const store = await StoreData.findById(storeId).session(session);

                if (!product || !store) {
                    console.error(`商品または屋台が見つかりませんでした。productId: ${productId}, storeId: ${storeId}`);
                    return { message: '商品または屋台が見つかりませんでした。' };
                }

                // 調理時間を個数に応じて計算
                const subTime = product.cookTime * orderQuantity;
                storeWaitTimes[storeId] = (storeWaitTimes[storeId] || store.storeWaitTime) - subTime;

            } catch (findError) {
                console.error(`Error fetching product or store: ${findError.message}`);
                return { message: `商品または屋台の取得中にエラーが発生しました。`, error: findError.message };
            }
        }

        // 各屋台の待ち時間をデータベースに一括更新
        await Promise.all(
            Object.keys(storeWaitTimes).map(async (storeId) => {
                try {
                    const store = await StoreData.findById(storeId).session(session);
                    if (store) {
                        store.storeWaitTime = storeWaitTimes[storeId];
                        try {
                            await store.save({ session });
                        } catch (saveError) {
                            console.error(`Error saving store ${storeId}:`, saveError);
                            return { message: '待ち時間の保存中にエラーが発生しました。', error: saveError.message };
                        }
                    } else {
                        console.error(`Store with storeId ${storeId} not found`);
                        return { message: `Store with storeId ${storeId} not found` };
                    }
                } catch (findStoreError) {
                    console.error(`Error finding store ${storeId}: ${findStoreError.message}`);
                    return { message: `屋台の取得中にエラーが発生しました。`, error: findStoreError.message };
                }
            })
        );

        console.log("storeWaitTimes", storeWaitTimes);
        return { storeWaitTimes };

    } catch (error) {
        console.error(`全体の処理中にエラーが発生しました: ${error.message}`);
        return { message: 'エラーが発生しました。', error: error.message };
    }
};

// ESLintの警告を無効にするためのコメント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
mongoose;
StoreOrderSchema;