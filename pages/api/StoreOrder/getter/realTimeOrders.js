const { MongoClient } = require('mongodb');

async function monitorChanges(req, res) {
    const storeName = req.query; // フロントから送られたコレクション名を取得
    const collectionName = storeName.storeName + "_orders";
    console.log(collectionName);

    if (!collectionName) {
        return res.status(400).send('Collection name is required');
    }

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
            { $match: { operationType: { $in: ['insert', 'update', 'replace'] } } },
        ]);

        changeStream.on('change', (change) => {
            // change.operationTypeが存在するかを確認
            if (change.operationType && change.operationType === 'insert') {
                const updatedDocument = change.fullDocument;
                console.log('Detected change:', updatedDocument);

                res.write(`data: ${JSON.stringify(updatedDocument)}\n\n`);
                res.flush();
                
            }else if(change.operationType === 'update'){
                const updatedFields = change.updateDescription.updatedFields;

                if (updatedFields && updatedFields.hasOwnProperty('getStatus')) {
                    const updatedName = updatedFields.getStatus;
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

        // クライアントが切断した場合の処理
        req.on('close', () => {
            console.log('Client disconnected');
            changeStream.close(); // 変更ストリームを閉じる
            client.close(); // MongoDBクライアントを閉じる
            res.end(); // 接続を終了
        });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

export default monitorChanges;