import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  // Connect to the database
  await connectToDatabase();

  // クエリパラメータから _id と updateStook を取得
  const { _id, updateStook } = req.query;

  // 数値に変換（もし文字列として渡されている場合）
  const stockIncrement = parseInt(updateStook, 10);

  if (isNaN(stockIncrement)) {
    return res.status(400).json({ success: false, message: 'Invalid stock value' });
  }

  try {
    // 指定された商品の在庫を増減する
    const updatedProduct = await ProductData.findByIdAndUpdate(
      _id, 
      { $inc: { stock: stockIncrement } }, // 在庫数を増減する
      { new: true, runValidators: true } // 新しい値を返すオプション
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 更新された商品データを返す
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}
