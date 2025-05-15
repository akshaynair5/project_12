import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    firebaseGroupId: { type: String, required: true },
    name: { type: String, required: true },
    lastOrDefaultMessage: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        type: String,
        timestamp: Date
    },
    lastUpdated: { type: Date, default: Date.now },
    groupPicture: { type: String },
}, { timestamps: true });

export const Group = mongoose.model("Group", groupSchema);
