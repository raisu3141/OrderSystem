import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    // _id が文字列であることを確認
    if (typeof req.body._id !== 'string') {
      throw new Error(`Product ID should be a string, got: ${typeof req.body._id}`);
    }

    // req.body._idがObjectIdであるかの確認
    if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
      throw new Error(`Invalid Product ID format: ${req.body._id}`);
    }

    const ProductId = (req.body._id);
    const Product = await ProductData.deleteOne({ _id: ProductId });

    if (!Product) {
      return res.status(404).json({ success: false, message: `Product not found for ID: ${ProductId}` });
    }

    res.status(200).json(Product);
  } catch (error) {
    res.status(400).json({ success: false, message: `Error: ${error.message}, Product ID: ${req.body._id}` });
  }
}
