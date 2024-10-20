// pages/api/updateSTORE_DATA.js
import connectToDatabase from '../../../../lib/mongoose';
import ProductData from '../../../../models/ProductData';

export default async function handler(req, res) {
  // Connect to the database
  await connectToDatabase();

  // Destructure _id and the fields to update from the request body
  if (req.body.cookTime) {
    req.body.cookTime = req.body.cookTime * 1000;
  }
  else{
    return res.status(401).json({ success: false, message: 'Error cookTime edit'});
  }
  
  const { _id, ...updateFields } = req.body;

  try {
    // Find the Product by _id and update it with the new fields
    const updatedProduct = await ProductData.findByIdAndUpdate(
      _id, 
      updateFields, 
      { new: true, runValidators: true }
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
