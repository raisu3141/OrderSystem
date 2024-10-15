import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const productData = await ProductData.find({}, "storeId productName productImageUrl price soldCount")
    .populate([
        {path: 'storeId', select:"storeName"}
    ]);
    if (!productData) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const formatData = productData.map(data => ({
        storeName: data.storeId.storeName,
        productName: data.productName,
        productImageUrl: data.productImageUrl,
        salesAmount: data.price * data.soldCount
    }));

    const sortFormatData = formatData.sort((a, b) => b.salesAmount - a.salesAmount);
    res.status(200).json(sortFormatData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}