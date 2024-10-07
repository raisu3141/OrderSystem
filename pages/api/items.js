// pages/api/items.js
import connectToDatabase from '../../lib/mongoose';
import Item from '../../models/Item';

export default async function handler(req, res) {
  const { method } = req;
  await connectToDatabase();

  switch (method) {
    case 'GET':
      try {
        const items = await Item.find({});
        res.status(200).json(items);
      } catch {
        // エラーメッセージは必要ない場合は削除
        res.status(400).json({ success: false });
      }
      break;

    case 'POST':
      try {
        const item = new Item(req.body);
        await item.save();
        res.status(201).json(item);
      } catch {
        // エラーメッセージは必要ない場合は削除
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
