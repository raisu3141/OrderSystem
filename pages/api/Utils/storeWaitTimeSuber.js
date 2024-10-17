// pages/api/Utils/storeWaitTimeSuber.js
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