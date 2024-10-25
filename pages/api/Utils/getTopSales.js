import connectToDatabase from '../../../lib/mongoose';
import ProductData from '../../../models/ProductData';
import StoreData from '../../../models/StoreData';

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const productData = await ProductData.find({}, "storeId productName soldCount productImageUrl")
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
        soldCount: data.soldCount
    }));

    const sortFormatData = formatData.sort((a, b) => b.soldCount - a.soldCount);
    
    if (sortFormatData[0].soldCount === sortFormatData[1].soldCount && sortFormatData[0].soldCount === sortFormatData[2].soldCount){
      for (let i = 0; i < 3; i++){
        sortFormatData[i].productRanks = 1;
      }
    }
    else if(sortFormatData[0].soldCount === sortFormatData[1].soldCount){
      for (let i = 0; i < 2; i++){
        sortFormatData[i].productRanks = 1;
      }
      sortFormatData[2].productRanks = 3;
    }
    else if (sortFormatData[1].soldCount === sortFormatData[2].soldCount){
      sortFormatData[0].productRanks = 1;
      for (let i = 1; i < 3; i++){
        sortFormatData[i].productRanks = 2;
      }
    }
    else{
      for (let i = 0; i < 3; i++){
        sortFormatData[i].productRanks = i + 1;
      }
    }

    res.status(200).json(sortFormatData.slice(0, 3));
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

StoreData;