import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucketName = process.env.GCS_BUCKET_NAME; // バケット名を環境変数から取得

export const uploadToGCS = async (file) => {
    return new Promise((resolve, reject) => {
        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(file.originalname);

        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading to GCS:', err);
            reject(err); // エラーが発生した場合、Promiseを拒否
        });

        blobStream.on('finish', () => {
            console.log('File uploaded successfully.');
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${file.originalname}`;
            resolve(publicUrl); // アップロードが完了したらURLを解決
        });

        blobStream.end(file.buffer); // メモリ上のファイルをアップロード
    });
};
