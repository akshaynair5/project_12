import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
