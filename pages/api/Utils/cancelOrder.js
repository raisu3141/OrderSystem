// pages/api/Utils/cancelOrder.js 
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongoose";
import StoreData from "../../../models/StoreData";
import OrderData from "../../../models/OrderData";
import StoreOrderSchema from "../../../models/StoreOrder";
import ProductData from "../../../models/ProductData";

import { storeWaitTimeSuber2 } from "./storeWaitTimeSuber";

export default async function handler(req, res) {
  const client = await connectToDatabase(); // データベースに接続
  const session = await client.startSession(); // セッションを開始

  // トランザクションを開始
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' }
  };

  try {
    // 整理券番号の格納
    const ticketNumber = req.body.ticketNumber;

    // リクエストデータの検証
    if (!ticketNumber) {
      return res.status(400).json({ message: '整理券番号が必要です。' });
    }

    const order = await OrderData.findOne({ ticketNumber: ticketNumber })
      .populate('orderList.storeId', 'storeName');

    console.log("order", order);

    if (!order) {
      return res.status(404).json({ message: '注文が見つかりませんでした。' });
    }

    // 屋台名を格納
    let storeOrders = new Set();
    order.orderList.forEach((item) => {
      storeOrders.add(item.storeId.storeName);
    });
    storeOrders = Array.from(storeOrders); // Set を配列に変換

    console.log(storeOrders);

    // トランザクションを開始
    let cancelOrders = []; // キャンセルした商品をすべて格納
    let orderList = []; // cookStatusがfalseの商品をすべて格納

    await session.withTransaction(async () => {
      console.log("startTransaction");

      // 各屋台の注文情報を処理
      for (const store of storeOrders) {
        const StoreOrder = mongoose.models[`${store}_orders`] || mongoose.model(`${store}_orders`, StoreOrderSchema);

        // cookStatus: false なら cancelStatusをtrueに更新
        const storeOrder = await StoreOrder.findOneAndUpdate(
          { orderId: order._id, cookStatus: false, cancelStatus: false },
          { $set: { cancelStatus: true } },
          { new: true, session }
        );

        if (storeOrder) {
          cancelOrders.push(storeOrder); // キャンセルした商品を追加
          if (storeOrder.orderList && storeOrder.orderList.length > 0) {
            orderList.push(...storeOrder.orderList);
            console.log("storeOrder.orderList", storeOrder.orderList);
          }
        } else {
          console.log(`キャンセル可能な注文が見つかりませんでした: ${store}`);
        }
      }

      // もしcancelOrdersに何も追加されなかった場合は、すべてがnullだったと判断してエラーをスロー
      if (cancelOrders.length === 0) {
        throw new Error("キャンセルできる注文が見つかりませんでした。すべての注文が既に処理済みです。");
      }

      // orderListで同じ商品があったらorderQuantityを加算
      let aggregatedOrderList = [];
      orderList.forEach((item) => {
        if (!item.productId) return; // productId が存在しない場合はスキップ

        // 既に productId が存在するかどうか確認
        const existingItem = aggregatedOrderList.find(i => item.productId.equals(i.productId));

        if (existingItem) {
          // 既存のアイテムが見つかったら、orderQuantity を加算
          existingItem.orderQuantity += item.orderQuantity;
        } else {
          // 見つからなければ、新しいアイテムとして追加
          aggregatedOrderList.push(item);
        }
      });
      console.log("aggregatedOrderList", aggregatedOrderList);

      // 在庫数・売上個数を戻す
      // const updateStockQuery = aggregatedOrderList.map((item) => {
      //   return ProductData.updateMany(
      //     { _id: item.productId },
      //     { $inc: { stock: item.orderQuantity, soldCount: -item.orderQuantity } },
      //     { session }
      //   );
      // });
      // console.log("zaiko update mae");
      // await Promise.all(updateStockQuery);
      // console.log("zaiko update ato");

      // 待ち時間を減らす
      const waitTimeResult = await storeWaitTimeSuber2(aggregatedOrderList, session);
      console.log("waitTimeResult", waitTimeResult);

    }, transactionOptions);

    console.log("commitTransaction");
    res.status(200).json({ success: true, message: "注文をキャンセルしました" });
    
  } catch (error) {
    console.error("エラー:", error);

    // エラー詳細を含めたレスポンス
    res.status(500).json({
      message: 'キャンセル処理中にエラーが発生しました。',
      error: error.message
    });
  } finally {
    try {
      await session.endSession();
      console.log("session ended");
    } catch (endSessionError) {
      console.error("セッション終了時にエラー:", endSessionError);
    }
  }
}

// ESLintの警告を無効にするためのコメント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
StoreData;