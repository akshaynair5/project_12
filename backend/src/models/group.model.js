import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastOrDefaultMessage: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        text: { type: String, default: "" },
        type: { type: String, default: "text" },
        timestamp: { type: Date, default: Date.now }
    },
    lastUpdated: { type: Date, default: Date.now },
    coverImage: { type: String, default: "" },
}, { timestamps: true });


export const Group = mongoose.model("Group", groupSchema);
