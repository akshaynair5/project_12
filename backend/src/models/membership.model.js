import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    isRequest: { type: Boolean, default: false }
}, { timestamps: true });

export const Membership = mongoose.model("Membership", membershipSchema);
