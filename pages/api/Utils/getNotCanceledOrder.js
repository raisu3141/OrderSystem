// pages/api/Utils/getNotCanceledOrder.js
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongoose";
import StoreData from "../../../models/StoreData";
import ProductData from "../../../models/ProductData";
import OrderData from "../../../models/OrderData";
import StoreOrderSchema from "../../../models/StoreOrder";

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    // 全屋台名を取得・コレクション名をstores格納
    let storeOrders = [];
    const storeData = await StoreData.find({}, "storeName");
    storeData.forEach(data => {
      storeOrders.push(`${data.storeName}_orders`);
    });


    // 注文データを取得
    let storeOrderData = {};

    for (const storeOrder of storeOrders) {
      const StoreOrder = mongoose.models[storeOrder] || mongoose.model(storeOrder, StoreOrderSchema);
      
      // 各屋台の注文データを取得
      const orders = await StoreOrder.find(
        { cancelStatus: false, getStatus: false },
        "orderId orderList.productId orderList.orderQuantity cookStatus"
      ).populate([
        { path: 'orderList.productId', select: 'productName price'},
        { path: 'orderId', select: 'ticketNumber clientName'},
      ]);

      console.log("orders", orders);

      // 各屋台の注文データをまとめる
      for (const order of orders) {
        const orderId = order.orderId._id;
        const orderList = order.orderList;

        // storeOrderData に初期化
        if (!storeOrderData[orderId]) {
          storeOrderData[orderId] = {
            orderId,
            ticketNumber: order.orderId.ticketNumber,
            clientName: order.orderId.clientName,
            orderList: [],
          };
        }

        if (!order.cookStatus) {
          // orderList の商品をまとめる
          orderList.forEach(item => {
            const existingItem = storeOrderData[orderId].orderList.find(i =>
              i.productId.equals(item.productId._id) // equals() メソッドを使用
            );
          
            if (existingItem) {
              // 同じ商品が既に存在する場合、数量を加算
              existingItem.orderQuantity += item.orderQuantity;
            } else {
              // 新しい商品を追加
              storeOrderData[orderId].orderList.push({
                productId: item.productId._id,
                orderQuantity: item.orderQuantity,
                productName: item.productId.productName,
                price: item.productId.price,
              });
            }
          });
        }
      }
    }

    // レスポンスデータをフォーマット
    const formattedResponse = Object.values(storeOrderData).map(order => ({
      ticketNumber: order.ticketNumber,
      clientName: order.clientName,
      totalAmount: order.orderList.reduce((acc, item) => acc + item.price * item.orderQuantity, 0),
      orderList: order.orderList,
    }));

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'エラーが発生しました', error: error.message });
  }
}

// ESLintの警告を無効にするためのコメント
// eslint-disable-next-line @typescript-eslint/no-unused-vars
ProductData;
OrderData;