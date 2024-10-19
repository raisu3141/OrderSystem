// pages/api/Utils/getNotCanceledOrder.js
import Cors from 'cors';

import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import OrderData from '../../../models/OrderData';

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Initialize the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: '*', // 必要に応じて特定のオリジンを指定してください
});

export default async function monitorChanges(req, res) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // SSEヘッダーを設定
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 初回接続でクライアントへ即座にレスポンスを送信

  // Keep the connection alive by sending a comment every 30 seconds
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 30000);

  try {
    await connectToDatabase();

    // MongoDB変更ストリームを作成
    const changeStream = OrderData.watch([
      { $match: { operationType: {$in: ['insert', 'update'] } } },
    ]);

    changeStream.on('change', async (change) => {
      // change.operationTypeが存在するかを確認
      if (change.operationType && change.operationType === 'insert') {
        const updatedDocument = change.fullDocument;
        console.log('Detected change:', updatedDocument);

        // productIdを元に、productdatasコレクションからデータを取得
        if (updatedDocument.orderList.length > 0) {
          try {
            // 注文リストからproductIdを取得
            const productIds = updatedDocument.orderList.map(order => order.productId);

            // productIdを使用してproductdatasコレクションから該当データを取得
            const orderProductData = await ProductData.find(
              { _id: { $in: productIds } },
              'productName price'
            );

            if (orderProductData) {
              console.log('Product data retrieved:', orderProductData);

              // 注文リストをフォーマット
              const formatedOrderList = updatedDocument.orderList.map((order, index) => {
                return {
                  productName: orderProductData[index].productName,
                  orderQuantity: order.orderQuantity,
                  price: orderProductData[index].price,
                };
              });

              // 注文商品の合計金額を計算
              const totalAmount = formatedOrderList.reduce((acc, order) => {
                return acc + (order.price * order.orderQuantity);
              }, 0);

              // レスポンスデータを作成
              const responseData = {
                ticketNumber: updatedDocument.ticketNumber,
                clientName: updatedDocument.clientName,
                orderList: formatedOrderList,
                totalAmount,
              };

              console.log('Sending response data:', responseData);

              // クライアントに結合データを送信 (例: Server-Sent Eventsなど)
              res.write(`data: ${JSON.stringify(responseData)}\n\n`);
              res.flush();
            } else {
              console.log('商品データを取得できませんでした');
            }
          } catch (error) {
            console.error('Error fetching product data:', error);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          }
        }

      } else if (change.operationType === 'update') {
        const updatedFields = change.updateDescription.updatedFields;

        if (updatedFields && updatedFields.hasOwnProperty('cancelStatus')) {
          const updatedName = updatedFields.cancelStatus;
          console.log('Name field was updated:', updatedName);
          console.log(change);

          // クライアントに変更された特定のフィールドを送信
          res.write(`data: ${JSON.stringify({ name: updatedName })}\n\n`);
          res.flush();
        }
      } else {
        console.log('No operationType or unsupported operation');
      }
    });

  } catch (error) {
    console.error(error.message);
    res.status(400).json({ success: false });
  }

  // Release resources when the connection is closed
  req.on('close', () => {
    console.log('Client disconnected, closing streams.');
    clearInterval(keepAlive);
    changeStream.close();
    res.end();
  });
}
