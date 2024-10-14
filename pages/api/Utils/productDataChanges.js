import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';
import mongoose from 'mongoose';

export default async function handler(req, res) {

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
    { fullDocument: 'updateLookup' } // これを追加
  );

  // Function to send data to client
  const sendData = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for changes in StoreData
  storeDataChangeStream.on('change', async (change) => {
    console.log('Change detected in StoreData:', JSON.stringify(change, null, 2));
  });

  // Listen for changes in ProductData
  productDataChangeStream.on('change', async (change) => {
    console.log('Change detected in ProductData:', change);
    try {
        const updatedProduct = change; // 変更後の完全なドキュメント
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
