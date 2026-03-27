import mongoose, { Schema, Document } from "mongoose";

export interface IInsight extends Document {
  userId: string;
  businessName: string;
  industry: string;
  insightType: "recommendations" | "health-score";
  insights: any[];
  dataContext: Record<string, any>;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: String, required: true, index: true },
    businessName: { type: String, required: true },
    industry: { type: String, required: true, index: true },
    insightType: {
      type: String,
      enum: ["recommendations", "health-score"],
      required: true,
    },
    // The actual recommendation objects or health score breakdown (stored as mixed array)
    insights: { type: Schema.Types.Mixed, default: [] },
    // Summary metrics snapshot at time of generation
    dataContext: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index to efficiently fetch recent insights per industry
InsightSchema.index({ industry: 1, createdAt: -1 });

export default mongoose.models.Insight ||
  mongoose.model<IInsight>("Insight", InsightSchema);
