// pages/api/updateSTORE_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import StoreData from '../../../../models/StoreData';

export default async function handler(req, res) {
  // Connect to the database
  await connectToDatabase();

  // Destructure _id and the fields to update from the request body
  const { _id, ...updateFields } = req.body;

  try {
    // Find the store by _id and update it with the new fields
    const updatedStore = await StoreData.findByIdAndUpdate(
      _id, 
      updateFields, 
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Respond with the updated store data
    res.status(200).json(updatedStore);
  } catch (error) {
    // Respond with an error message
    res.status(400).json({ success: false, message: error.message });
  }
}
