import connectToDatabase from '../../../../lib/mongoose';
import StoreOrder from '../../../../models/StoreOrder';

export default async function handler(req, res) {
  await connectToDatabase();

  const { id } = req.query;

  try {
    const storeOrder = await StoreOrder.findById(id);
    if (!storeOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(storeOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}