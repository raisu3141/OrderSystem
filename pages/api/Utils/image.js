import multer from 'multer';
import connectToDatabase from '../../../lib/mongoose';
import { uploadToGCS } from '../../../lib/gcs'; // GCSへのアップロード関数
import ProductData from '../../../models/ProductData'; // ProductData モデルをインポート

// multerのストレージ設定
const upload = multer({
  storage: multer.memoryStorage(), // メモリにファイルを保持
});

// APIハンドラ
async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'POST') {
    // multerミドルウェアを適用
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ success: false, message: 'Error uploading image', error: err.message });
      }

      try {
        // 画像をGCSにアップロード
        const publicUrl = await uploadToGCS(req.file); // req.fileがアップロードされたファイル

        // 画像のURLをProductDataに追加
        const productId = '67025ec2b71cc04c0338aabf'; // 対象のプロダクトID
        const updatedProduct = await ProductData.findByIdAndUpdate(
          productId,
          { $set: { productImageUrl: publicUrl } }, // productImageUrlに新しいURLを追加
          { new: true, runValidators: true } // 更新後のドキュメントを返す
        );

        if (!updatedProduct) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(201).json({ success: true, imageUrl: publicUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ success: false, message: "Error uploading image" });
      }
    });
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}

// multerを使って画像ファイルを処理するための設定
export const config = {
  api: {
    bodyParser: false,  // multerで処理するために無効化
  },
};

export default handler;
