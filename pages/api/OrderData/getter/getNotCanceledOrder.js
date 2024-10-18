// pages/api/OrderData/getter/getNotCanceledOrder.js
import { MongoClient } from 'mongodb';
import OrderData from '../../../../models/OrderData';

export default async function monitorChanges(req, res) {
  const collectionName = 'orderdatas';

  // SSEヘッダーを設定
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 初回接続でクライアントへ即座にレスポンスを送信
  
  try {
    const uri = process.env.MONGODB_URI; // .env.local から MONGODB_URI を取得
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    const client = new MongoClient(uri);
    await client.connect();
    const database = client.db('db_test');
    const collection = database.collection(collectionName); // 動的に指定されたコレクションを監視

    // MongoDB変更ストリームを作成
    const changeStream = collection.watch([
      { $match: { operationType: {$in: ['insert', 'update'] } } },
    ]);

    changeStream.on('change', async (change) => {
      // change.operationTypeが存在するかを確認
      if (change.operationType && change.operationType === 'insert') {
        const updatedDocument = change.fullDocument;
        console.log('Detected change:', updatedDocument);

        res.write(`data: ${JSON.stringify(updatedDocument)}\n\n`);
        res.flush();
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

    res.status(200).json();
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ success: false });
  }
}
