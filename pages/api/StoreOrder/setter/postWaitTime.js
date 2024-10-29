// pages/api/StoreOrder/setter/postWaitTime.js

//このファイルは基本的に使わない！機能をstoreWaitTimeAdderに統合しているから!一応残しているだけ！

import StoreOrder from '../../../../models/StoreOrder';
import { storeWaitTimeAdder } from '../../Utils/storeWaitTimeAdder';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        await setStoreOrderWaitTimes(req, res);
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

const setStoreOrderWaitTimes = async (req, res) => {
    try {
        // storeWaitTimeAdderを呼び出し、最新の待ち時間を取得
        const { storeWaitTimes } = await storeWaitTimeAdder(req, res);

        // 各屋台の待ち時間をStoreOrderに反映
        for (const storeId in storeWaitTimes) {
            const waitTime = storeWaitTimes[storeId];

            // 対応するStoreOrderを取得し、waitTimeを更新
            const storeOrder = await StoreOrder.findOne({ storeId });

            if (!storeOrder) {
                return res.status(404).json({ message: `StoreOrder for storeId ${storeId} not found` });
            }

            // StoreOrderのwaitTimeを更新
            storeOrder.waitTime = waitTime;
            await storeOrder.save();
        }

        return res.status(200).json({ message: 'StoreOrder wait times updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'エラーが発生しました。' });
    }
};