// pages/api/updateSTORE_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  // Connect to the database
  await connectToDatabase();

  // Destructure _id and the fields to update from the request body
  const { _id, updateStook } = req.query;

  try {
    // Find the Product by _id and update its stock
    const updatedProduct = await ProductData.findByIdAndUpdate(
      _id, 
      { $inc: { stock: updateStook } }, // stockフィールドを増減する
      { new: true, runValidators: true } // 新しい値を返すオプション
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Respond with the updated Product data
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Respond with an error message
    res.status(400).json({ success: false, message: error.message });
  }
}
