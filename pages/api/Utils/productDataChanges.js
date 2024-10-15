import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';
import mongoose from 'mongoose';
import Cors from 'cors';

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

export default async function handler(req, res) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  const storeId = req.query.storeId;

  if (!storeId) {
    return res.status(400).json({ success: false, message: 'storeId is required' });
  }
  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({ success: false, message: `Invalid storeId format ${storeId}` });
  }

  // Set headers for SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  // Connect to MongoDB
  await connectToDatabase();

  // Set up change streams for StoreData with specific storeId
  const storeDataChangeStream = StoreData.watch([
    { $match: { 'documentKey._id': new mongoose.Types.ObjectId(storeId) } }
  ]);
  
  const productDataChangeStream = ProductData.watch(
    [
      { $match: { 'fullDocument.storeId': new mongoose.Types.ObjectId(storeId) } }
    ],
    { fullDocument: 'updateLookup' } // 完全なドキュメントを取得するために追加
  );

  // Function to send data to client
  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    // 即座にレスポンスを返す　デフォルトならバッファ処理があり、レスポンスが蓄積されるが、それはSSEの規格に沿わない
    res.flush();
  };

  // Listen for changes in StoreData
  storeDataChangeStream.on('change', async (change) => {
    const updatedStore = change.fullDocument; // 変更後の完全なドキュメント
    sendData(updatedStore); // クライアントに送信
    console.log('Change detected in StoreData:', JSON.stringify(change, null, 2));
  });

  // Listen for changes in ProductData
  productDataChangeStream.on('change', async (change) => {
    console.log('Change detected in ProductData:', change);
    try {
      const updatedProduct = change.fullDocument; // 変更後の完全なドキュメント
      sendData(updatedProduct); // クライアントに送信
    } catch (error) {
      console.error('Error handling product data change:', error);
      sendData({ success: false, message: 'Error handling product data change' });
    }
  });

  // Keep the connection alive by sending a comment every 30 seconds
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 30000);

  // Release resources when the connection is closed
  req.on('close', () => {
    console.log('Client disconnected, closing streams.');
    clearInterval(keepAlive);
    storeDataChangeStream.close();
    productDataChangeStream.close();
    res.end();
  });
}
