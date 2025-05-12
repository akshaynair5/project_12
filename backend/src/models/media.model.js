import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    version: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    url: { type: String, required: true },
    sizeInMB: { type: Number, required: true },
    severity: { type: String, enum: ["patch", "minor", "major"], required: true },
    description: { type: String }
}, { _id: false });

const mediaSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    filename: { type: String, required: true },
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g., "video/mp4"
    createdAt: { type: Date, default: Date.now },
    currentVersion: { type: String, required: true },
    versions: [versionSchema]
}, { timestamps: true });

export const Media = mongoose.model("Media", mediaSchema);
