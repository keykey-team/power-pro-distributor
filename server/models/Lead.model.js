// ================================
// models/Lead.model.js
// ================================
import mongoose from "mongoose";
const { Schema } = mongoose;

const LeadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    promoCode: { type: String, trim: true, maxlength: 60, default: "" },
  },
  { timestamps: true }
);

LeadSchema.index({ createdAt: -1 });

export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
