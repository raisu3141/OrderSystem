// pages/api/Utils/postOrderData.js
import connectToDatabase from "../../../lib/mongoose";
import OrderData from "../../../models/OrderData";
import ProductData from "../../../models/ProductData";
import TicketManagement from "../../../models/TicketManagement";
import orderSorting from "./orderSorting";
import { storeWaitTimeAdder2 } from "./storeWaitTimeAdder";

export default async function handler(req, res) {
  const client = await connectToDatabase();
  const session = await client.startSession();

  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' }
  };

  try {
    // トランザクション開始前に、ドキュメントがなければ追加
    await TicketManagement.findOneAndUpdate(
      { name: "ticketNumber" },
      {},
      { new: true, upsert: true, session }
    );

    let result;
    await session.withTransaction(async () => {
      // 在庫確認
      const stockStatusList = await checkStock(req.body.orderList, session);

      if (!stockStatusList) {
        throw new Error("在庫確認に失敗しました");
      }

      const allStocksEnoughStatus = stockStatusList.every(
        (stockStatus) => stockStatus.stockEnoughStatus
      );

      if (!allStocksEnoughStatus) {
        throw new Error("在庫が不足しています");
      }

      // 注文処理
      result = await processOrder(req.body.orderList, req.body.clientName, session);
      if (!result) {
        throw new Error("注文処理に失敗しました");
      }
    }, transactionOptions);

    res.status(200).json({
      ticketNumber: result.ticketNumber,
      clientName: result.clientName,
      stockStatusList,
    });

  } catch (error) {
    console.error("Error occurred:", error.message, error.stack);

    // エラーメッセージに基づいて異なるレスポンスを返す
    if (error.message.includes("在庫が不足しています")) {
      return res.status(400).json({ message: error.message, stockStatusList });
    } else if (error.message === "Status not found") {
      return res.status(404).json({ message: error.message });
    } else if (error.code === 11000) {
      const lastTicketNumber = await OrderData.findOne({}, "ticketNumber")
        .sort({ ticketNumber: -1 })
        .session(session);
      
      await TicketManagement.findOneAndUpdate(
        { name: "ticketNumber" },
        { $set: { ticketNumber: lastTicketNumber ? lastTicketNumber.ticketNumber + 1 : 1 } },
        { session }
      );

      return res.status(400).json({
        message: "注文に失敗しました。重複するデータがあります",
        error: `{ ${Object.keys(error.keyValue)[0]}: ${Object.values(error.keyValue)[0]} } が重複しています`,
      });
    } else {
      // 想定外のエラー
      return res.status(500).json({
        message: "サーバーエラーが発生しました。再度お試しください。",
        error: error.message,
      });
    }

  } finally {
    session.endSession();
  }
}

// checkStock 関数などもエラーハンドリングを強化
const checkStock = async (orderList, session) => {
  try {
    const allProductStocks = await ProductData.find({}, "stock").session(session);
    const stockStatusList = allProductStocks.map((productStock) => {
      const order = orderList.find(
        (order) => order.productId === productStock._id.toString()
      );
      const stockEnoughStatus = order
        ? productStock.stock >= order.orderQuantity
        : true;

      const stock = order && stockEnoughStatus
        ? productStock.stock - order.orderQuantity
        : productStock.stock;

      return {
        productId: productStock._id,
        stock,
        stockEnoughStatus,
      };
    });

    return stockStatusList;
  } catch (error) {
    console.error("在庫確認中にエラーが発生しました:", error.message);
    throw new Error("在庫確認に失敗しました");
  }
};

const processOrder = async (orderList, clientName, session) => {
  try {
    const updateStockQuery = orderList.map((order) =>
      ProductData.updateMany(
        { _id: order.productId },
        { $inc: { stock: -order.orderQuantity, soldCount: order.orderQuantity } },
        { session }
      )
    );

    await Promise.all(updateStockQuery);

    const newTicketNumber = await generateTicketNumber(session);

    const storeWaitTime = await storeWaitTimeAdder2(orderList, session);

    const newOrderData = new OrderData({
      ticketNumber: newTicketNumber,
      clientName,
      orderList,
      waitTime: storeWaitTime,
    });

    await newOrderData.save({ session });

    const orderId = newOrderData._id;
    const orderResult = await orderSorting(orderId, session);
    
    if (!orderResult.success) {
      throw new Error(orderResult.message);
    }

    return {
      ticketNumber: newTicketNumber,
    };
  } catch (error) {
    console.error("注文処理中にエラーが発生しました:", error.message);
    throw new Error("注文処理に失敗しました");
  }
};

// 整理券番号を生成する関数
const generateTicketNumber = async (session) => {
  const ticketNumberDoc = await TicketManagement.findOneAndUpdate(
    { name: "ticketNumber" }, // 検索条件
    {
      $inc: { ticketNumber: 1 }, // 存在すれば `ticketNumber` をインクリメント
    },
    {
      new: true, // 更新後のドキュメントを返す
      upsert: true, // ドキュメントがなければ新規作成
      session,
    }
  );
  return ticketNumberDoc.ticketNumber;
};
