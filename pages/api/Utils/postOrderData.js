// pages/api/Utils/postOrderData.js
import connectToDatabase from "../../../lib/mongoose";
import OrderData from "../../../models/OrderData";
import ProductData from "../../../models/ProductData";

export default async function handler(req, res) {
  const client = await connectToDatabase(); // データベースに接続
  const session = await client.startSession(); // セッションを開始
  session.startTransaction(); // トランザクションを開始

  try {
    // 注文処理を実行
    const result = await processOrder(
      req.body.orderList,
      req.body.clientName,
      session
    );

    // 在庫不足の場合はエラーレスポンスを返す
    if (
      !result.stockStatusList.every(
        (stockStatus) => stockStatus.stockEnoughStatus
      )
    ) {
      return res.status(400).json({
        stockStatusList: result.stocks,
        message: "在庫が不足しています",
      });
    }

    // トランザクションをコミット
    await session.commitTransaction();

    // 成功レスポンスを返す
    return res.status(200).json(result);
  } catch (error) {
    await session.abortTransaction(); // エラー時はロールバック
    return res.status(500).json({
      message: "データの取得に失敗しました",
      error: error.message,
    });
  } finally {
    session.endSession(); // セッションを終了
  }
}

// 在庫・売上個数を更新し、結果を返す関数
const processOrder = async (orderList, clientName, session) => {
  // 全商品の在庫を取得
  const allProductStocks = await ProductData.find({}, "stock").session(session);

  // すべての商品の在庫が十分かチェック
  const stockStatusList = allProductStocks.map((productStock) => {
    const order = orderList.find(
      (order) => order.productId === productStock._id.toString()
    );
    const stockEnoughStatus = order
      ? productStock.stock > order.orderQuantity
      : true;

    return {
      productId: productStock._id.toString(),
      stock: productStock.stock,
      stockEnoughStatus,
    };
  });

  // 在庫不足があるか確認
  const allStocksEnoughStatus = stockStatusList.every(
    (stockStatus) => stockStatus.stockEnoughStatus
  );
  if (!allStocksEnoughStatus) {
    return {
      ticketNumber: null,
      clientName,
      stockStatusList,
    };
  }

  // 在庫と売上個数を更新
  const updateStockQuery = orderList.map((order) =>
    ProductData.updateMany(
      { _id: order.productId },
      { $inc: { stock: -order.orderQuantity, soldCount: order.orderQuantity } },
      { session }
    )
  );
  await Promise.all(updateStockQuery);

  // 整理券番号を生成
  const newTicketNumber = await generateTicketNumber(session);

  // LineUserIdの生成 (uniqueエラー回避のため)
  const newLineUserId = newTicketNumber !== 1
    ? "LineUserId" + newTicketNumber
    : "LineUserId1";

  // 注文データを保存
  const newOrderData = new OrderData({
    ticketNumber: newTicketNumber,
    // ticketNumber: 1,
    lineUserId: newLineUserId,
    clientName,
    orderList,
  });
  await newOrderData.save({ session });

  // stockStatusList を更新
  const updatedProductStocks = await ProductData.find({}, "stock").session(session);
  const updatedStockStatusList = updatedProductStocks.map((productStock) => {
    const order = orderList.find(
      (order) => order.productId === productStock._id.toString()
    );
    const stockEnoughStatus = order
      ? productStock.stock >= order.orderQuantity
      : true;

    return {
      productId: productStock._id,
      stock: productStock.stock,
      stockEnoughStatus,
    };
  });

  
  return {
    ticketNumber: newTicketNumber,
    clientName,
    stockStatusList: updatedStockStatusList,
  };
};

// 整理券番号を生成する関数
const generateTicketNumber = async (session) => {
  const lastTicketNumber = await OrderData.findOne({}, "ticketNumber")
    .sort({ ticketNumber: -1 })
    .session(session);

  const newTicketNumber = lastTicketNumber
    ? lastTicketNumber.ticketNumber + 1
    : 1;

  return newTicketNumber
};
