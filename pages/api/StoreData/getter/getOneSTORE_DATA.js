import mongoose from 'mongoose';
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    // _id が文字列であることを確認
    if (typeof req.body._id !== 'string') {
      throw new Error(`Store ID should be a string, got: ${typeof req.body._id}`);
    }

    // req.body._idがObjectIdであるかの確認
    if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
      throw new Error(`Invalid store ID format: ${req.body._id}`);
    }

    const storeId = req.body._id;

    // StoreDataを検索し、productListをポピュレート
    const store = await StoreData.findOne({ _id: storeId }).populate('productList');

    if (!store) {
      return res.status(404).json({ success: false, message: `Store not found for ID: ${storeId}` });
    }

    // productListのcookTimeを/1000する
    const updatedProductList = store.productList.map(product => {
      // cookTimeを/1000し、新しいオブジェクトとして返す
      const updatedCookTime = product.cookTime ? product.cookTime / 1000 : null;

      return {
        ...product.toObject(), // productの元のプロパティを全てコピー
        cookTime: updatedCookTime, // cookTimeのみ/1000したものに置き換える
      };
    });

    // フロントにstoreと更新されたproductListを返す
    res.status(200).json({ ...store.toObject(), productList: updatedProductList });
  } catch (error) {
    res.status(400).json({ success: false, message: `Error: ${error.message}, Store ID: ${req.body._id}` });
  }
};