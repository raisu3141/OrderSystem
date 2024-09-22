// models/ProductData.js
import mongoose from 'mongoose';

const ProductDataSchema = new mongoose.Schema({
  // 商品ID
  "_id": {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },

  // 屋台ID
  "storeId": {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "StoreData",
  },

  // 商品名
  "productName": {
    type: mongoose.Schema.Types.String,
    required: true,
  },

  // 商品画像URL
  "productImageUrl" : {
    type: mongoose.Schema.Types.String,
    required: true,
    default: "https://via.placeholder.com/150",
  },

  // 値段
  "price": {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: 0,
    min: 0,
  },

  // 調理時間
  "cookTime": {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: 0,
    min: 0,
  },

  // 在庫数
  "stock": {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: 0,
    min: 0,
  },

}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

export default mongoose.models.ProductData || mongoose.model('ProductData', ProductDataSchema);
