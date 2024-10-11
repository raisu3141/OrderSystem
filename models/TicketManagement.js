// models/TicketNumber.js
import mongoose from 'mongoose';

const TicketManagementSchema = new mongoose.Schema({
  // 名前
  "name": {
    type: mongoose.Schema.Types.String,
    required: true,
  },

  // 整理券番号
  "ticketNumber": {
    type: mongoose.Schema.Types.Number,
    required: true,
    unique: true,
    default: 0,
    min: 0,
  },
  
}, {
  // 追加・更新日時を自動で保存
  timestamps: true,
});

export default mongoose.models.TicketNumber || mongoose.model('TicketNumber', TicketManagementSchema);
