import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  await connectToDatabase();
  let storeID;
  let ProductID;

  try {
    // _id が文字列であることを確認
    if (typeof req.body._id !== 'string') {
      throw new Error(`Product ID should be a string, got: ${typeof req.body._id}`);
    }

    // req.body._idがObjectIdであるかの確認
    if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
      throw new Error(`Invalid Product ID format: ${req.body._id}`);
    }

    ProductID = req.body._id;
    const product = await ProductData.findById(ProductID);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // storeIDを取得
    storeID = product.storeId;

    // Productを削除
    const deletedProduct = await ProductData.deleteOne({ _id: ProductID });

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: `Product not found for ID: ${ProductID}` });
    }

    // StoreData の productList から ProductID を削除
    const updatedStoreData = await StoreData.findByIdAndUpdate(
      storeID, 
      { $pull: { productList: ProductID } }, // productListから一致するProductIDを削除
      { new: true, runValidators: true }
    );
    
    if (!updatedStoreData) {
      return res.status(404).json({ success: false, message: 'StoreData not found' });
    }

    // 最終レスポンスとして、StoreDataを返す
    res.status(200).json({ success: true, message: 'Product and StoreData updated successfully', storeData: updatedStoreData });

  } catch (error) {
    res.status(400).json({ success: false, message: `Error: ${error.message}, Product ID: ${req.body._id}` });
  }
}
