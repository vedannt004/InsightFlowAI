import mongoose, { Schema, Document } from "mongoose";

export interface IPrediction extends Document {
  user_id: string;
  month: string;
  predicted_sales: number;
  confidence_score: number;
  model_used: string;
  created_at: Date;
}

const PredictionSchema = new Schema<IPrediction>(
  {
    user_id: { type: String, required: true, index: true },
    month: { type: String, required: true },
    predicted_sales: { type: Number, required: true },
    confidence_score: { type: Number, default: 0 },
    model_used: { type: String, default: "linear_regression" },
  },
  { timestamps: true }
);

export default mongoose.models.Prediction ||
  mongoose.model<IPrediction>("Prediction", PredictionSchema);
