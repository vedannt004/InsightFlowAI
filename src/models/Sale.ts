import mongoose, { Schema, Document } from "mongoose";

export interface ISale extends Document {
  user_id: string;
  date: Date; // mapped common date
  product_name: string; // mapped categorical identifier
  category: string; // mapped sub-category
  quantity: number; // mapped metric
  price: number; // mapped metric
  revenue: number; // mapped primary metric
  customer_id: string; // mapped actor identifier
  raw_data: any; // The original unaltered row
}

const SaleSchema = new Schema<ISale>(
  {
    user_id: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    product_name: { type: String, required: true },
    category: { type: String, default: "Uncategorized" },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    revenue: { type: Number, required: true },
    customer_id: { type: String, default: "" },
    raw_data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);
