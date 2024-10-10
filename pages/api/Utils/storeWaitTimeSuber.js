import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';

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
        const storeWaitTimes = {}; // 各屋台の待ち時間を管理するオブジェクト

        // 注文リストの処理
        for (const order of orderList) {
            const { productId, storeId, orderQuantity } = order;

            // 商品と屋台を取得
            const product = await ProductData.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `商品ID ${productId} が見つかりませんでした。` });
            }

            // 調理時間を計算して減少させる待ち時間を加算
            const cookTime = product.cookTime * orderQuantity;
            storeWaitTimes[storeId] = (storeWaitTimes[storeId] || 0) + cookTime;
        }

        // 屋台の待ち時間を更新
        await Promise.all(
            Object.keys(storeWaitTimes).map(async (storeId) => {
                const store = await StoreData.findById(storeId);
                if (!store) {
                    return res.status(404).json({ message: `屋台ID ${storeId} が見つかりませんでした。` });
                }

                // 待ち時間を減らし、負の値にならないように調整
                store.storeWaitTime = Math.max(0, store.storeWaitTime - storeWaitTimes[storeId]);
                await store.save();
            })
        );

        return res.status(200).json({ status: true, storeWaitTimes });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'エラーが発生しました。', error: error.message });
    }
}
