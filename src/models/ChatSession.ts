import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IChatSession extends Document {
  userId: string;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New Chat" },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

// Most recent sessions first
ChatSessionSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
