// pages/api/Utils/getNotCanceledOrder.js
import connectToDatabase from "../../../lib/mongoose";
import OrderData from "../../../models/OrderData";
import "../../../models/ProductData";

export default async function handler(req, res) {
  await connectToDatabase();

  try {
    const cancellableOrders = await OrderData.find(
      { cancelStatus: false, cancellableStatus: false },
      "ticketNumber clientName orderList.orderQuantity",
    ).populate('orderList.productId', 'productName price');

    console.log(cancellableOrders);

    res.status(200).json(cancellableOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'エラーが発生しました', error: error.message });
  }
}