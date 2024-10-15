// pages/api/Utils/postOrderData.js
import connectToDatabase from "../../../lib/mongoose";
import OrderData from "../../../models/OrderData";
import ProductData from "../../../models/ProductData";
import TicketManagement from "../../../models/TicketManagement";
// import "./orderSorting"; (もとき実装中)

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


      // 各商品の在庫が足りているか確認
      const stockStatusList = await checkStock(req.body.orderList, session);

      // 在庫不足があるか確認
      const allStocksEnoughStatus = stockStatusList.every(
        (stockStatus) => stockStatus.stockEnoughStatus
      );

      // 在庫不足の場合はエラーレスポンスを返す
      if (!allStocksEnoughStatus) {
        return res.status(400).json({
          message: "在庫が不足しています",
          stockStatusList,
        });
      }

    // トランザクションを開始
    await session.withTransaction(async () => {
      console.log("startTransaction");

      // 注文処理を実行
      console.log("Start processOrder");
      const result = await processOrder(
        req.body.orderList,
        req.body.clientName,
        session
      );
      console.log("End processOrder");

      // 成功レスポンスを返す
      res.status(200).json({
        ticketNumber: result.ticketNumber,
        clientName: result.clientName,
        stockStatusList,
      });
    }, transactionOptions);
  } catch (error) {
    console.error(error.message);

    if (error.code === 11000) {
      // 整理券番号をリセット
      const lastTicketNumber = await OrderData.findOne({}, "ticketNumber")
        .sort({ ticketNumber: -1 })
        .session(session);
      const newTicketNumber = await TicketManagement.findOneAndUpdate(
        { name: "ticketNumber" },
        { $set: { ticketNumber: lastTicketNumber ? lastTicketNumber.ticketNumber + 1 : 1} },
        { session }
      );
      console.log(newTicketNumber);

      return res.status(400).json({
        message: "注文に失敗しました",
        error: `{ ${Object.keys(error.keyValue)[0]}: ${Object.values(error.keyValue)[0]} } が重複しています`,
      });
    } else {
      return res.status(500).json({
        message: "注文に失敗しました",
        error: error.message,
      });
    }

  } finally {
    session.endSession(); // セッションを終了
    console.log("endSession");
  }
}

// 在庫・売上個数を更新し、注文データを返す関数
const processOrder = async (orderList, clientName, session) => {

  // 在庫と売上個数を更新
  const updateStockQuery = orderList.map((order) =>
    ProductData.updateMany(
      { _id: order.productId },
      { $inc: { stock: -order.orderQuantity, soldCount: order.orderQuantity } },
      { session }
    )
  );
  console.log("zaiko update mae");
  await Promise.all(updateStockQuery);
  console.log("zaiko update ato");

  // 整理券番号を生成
  const newTicketNumber = await generateTicketNumber(session);

  // LineUserIdの生成 (uniqueエラー回避のため)
  let newLineUserId = newTicketNumber !== 1
    ? "LineUserId" + newTicketNumber
    : "LineUserId1";
  
  // 注文データを保存
  const newOrderData = new OrderData({
    ticketNumber: newTicketNumber,
    lineUserId: newLineUserId,
    clientName,
    orderList,
  });

  console.log("save mae");
  await newOrderData.save({ session });
  console.log("save ato");


  // 屋台ごとに注文商品をソート (もとき実装中)
  // await orderSorting(result.orderId, session);

  // 注文IDの取得
  const orderId = newOrderData._id;

  console.log("return processOrder");
  return {
    ticketNumber: newTicketNumber,
    orderId,
  };
};

// 注文商品の在庫が足りてるかチェックする関数
const checkStock = async (orderList, session) => {
  // すべての商品の在庫が十分かチェック
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
}

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
