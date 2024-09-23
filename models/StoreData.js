// models/StoreData.js
import mongoose from 'mongoose';

const StoreDataSchema = new mongoose.Schema({

  // 屋台名
  "storeName": {
    type: mongoose.Schema.Types.String,
    required: true,
  },

  // 屋台画像URL
  "storeImageUrl" : {
    type: mongoose.Schema.Types.String,
    required: false,
    default: "https://via.placeholder.com/150",
  },

  // 商品リスト
  "productList": [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductData', // ProductDataコレクションを参照
    required: false,
    unique: true,
  }],
  
  // 待ち時間
  "storeWaitTime": {
    type: mongoose.Schema.Types.Number,
    required: true,
    default: 0,
    min: 0,
  },

}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

export default mongoose.models.StoreData || mongoose.model('StoreData', StoreDataSchema);