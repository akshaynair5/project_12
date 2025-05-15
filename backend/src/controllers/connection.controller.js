import { ConnectionRequest } from "../models/connectionRequest.model.js";
import { Connection } from "../models/connection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  ApiError  from "../utils/ApiError.js";
import mongoose from "mongoose";


const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { to } = req.body;
  const from = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(to)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (from.equals(to)) {
    throw new ApiError(400, "You cannot send a connection request to yourself.");
  }

  const existingRequest = await ConnectionRequest.findOne({
    from,
    to,
    status: "pending",
  });

  if (existingRequest) {
    throw new ApiError(409, "Connection request already sent.");
  }

  const existingConnection = await Connection.findOne({
    $or: [
      { user1: from, user2: to },
      { user1: to, user2: from },
    ],
  });

  if (existingConnection) {
    throw new ApiError(409, "You are already connected.");
  }

  const request = await ConnectionRequest.create({ from, to });
  res.status(201).json(new ApiResponse(201, request, "Connection request sent"));
});

// Accept connection request
const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await ConnectionRequest.findById(requestId);
  if (!request || request.status !== "pending") {
    throw new ApiError(404, "Connection request not found or already handled.");
  }

  if (!request.to.equals(userId)) {
    throw new ApiError(403, "You are not authorized to accept this request.");
  }

  request.status = "accepted";
  await request.save();

  await Connection.create({ user1: request.from, user2: request.to });

  res.status(200).json(new ApiResponse(200, request, "Connection request accepted"));
});

// Reject connection request
const rejectConnectionRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await ConnectionRequest.findById(requestId);
  if (!request || request.status !== "pending") {
    throw new ApiError(404, "Connection request not found or already handled.");
  }

  if (!request.to.equals(userId)) {
    throw new ApiError(403, "You are not authorized to reject this request.");
  }

  request.status = "rejected";
  await request.save();

  res.status(200).json(new ApiResponse(200, request, "Connection request rejected"));
});

// Cancel (withdraw) sent request
const cancelConnectionRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await ConnectionRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, "Connection request not found");
  }

  if (!request.from.equals(userId) && !request.to.equals(userId)) {
    throw new ApiError(403, "You are not authorized to cancel this request.");
  }

  await request.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Connection request cancelled"));
});

// Remove connection
const removeConnection = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const userId = req.user._id;

  const connection = await Connection.findById(connectionId);
  if (!connection) {
    throw new ApiError(404, "Connection not found");
  }

  if (!connection.user1.equals(userId) && !connection.user2.equals(userId)) {
    throw new ApiError(403, "You are not authorized to remove this connection.");
  }

  await connection.deleteOne();
  res.status(200).json(new ApiResponse(200, null, "Connection removed"));
});

export {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  removeConnection
};