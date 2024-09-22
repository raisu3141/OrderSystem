// models/OrderData.js
import mongoose from 'mongoose';

const OrderDataSchema = new mongoose.Schema({
  // 注文ID
  "_id": {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },

  // 整理券番号
  "tiketNumber": {
    type: mongoose.Schema.Types.Number,
    required: true,
    unique: true,
    default: 0,
    min: 0,
  },

  // 注文リスト
  "orderList": [{
    // 商品ID
    "productId": {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ProductData",
    },

    // 屋台ID
    "storeId": {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "StoreData",
    },

    // 個数
    "orderQuantity": {
      type: mongoose.Schema.Types.Number,
      required: true,
      default: 0,
      min: 0,
    },
  }],

  // 注文者名
  "clientName": {
    type: mongoose.Schema.Types.String,
    required: true,
    validate: {
      validator: (v) => {
        // カタカナのみ許可
        const katakanaRegex = /^[\u30A0-\u30FF]+$/;
        return katakanaRegex.test(v);
      },
      message: "clientName is required",
    },
  },

  // 注文時間
  "orderTime": {
    type: mongoose.Schema.Types.Date,
    required: true,
    default: Date.now,
  },


}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

export default mongoose.models.OrderData || mongoose.model('OrderData', OrderDataSchema);
