import db from "../config/firebase.config.js";
import { Group } from "../models/group.model.js";
import { Membership } from "../models/membership.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createMembership } from "./membership.controller.js";

const createGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const coverImageLocalPath = req.files.coverImage[0].path || "";
    const memberIds = req.body.memberIds;

    if (!name || !description) {
        throw new ApiError("Name and description are required fields", 400);
    }
    let coverImage = null;
    if(coverImage){
        coverImage = await uploadToCloudinary(coverImageLocalPath);
    }

    const groupDoc = await Group.create({
        name,
        description,
        coverImage: coverImage?.url
    })

    if(!groupDoc){
        throw new ApiError("Failed to create group", 500);
    }

    const groupId = groupDoc._id.toString();

    await db.collection("groups").doc(groupId).set({
        _id: groupId,
    })

    for (const memberId of memberIds) {
        try{
            await createMembership({
                userId: memberId,
                groupId: groupId,
                role: "member"
            });
        }
        catch (error) {
            console.error(`Failed to add member ${memberId} to group ${groupId}:`, error);
            throw new ApiError(`Failed to add member ${memberId} to group`, 500);
        }
    }
    
    res.status(201).json(new ApiResponse(201, groupDoc, "Group created successfully."));
})

const getGroupById = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user._id;

    if (!groupId) {
        throw new ApiError("Group ID is required", 400);
    }

    const groupDoc = await Group.findById(groupId);
    if (!groupDoc) {
        throw new ApiError("Group not found", 404);
    }

    const groupDataSnap = await db.collection("groups").doc(groupId).get();
    if (!groupDataSnap.exists) {
        throw new ApiError("Group data not found in Firebase", 404);
    }

    const messagesSnap = await db
        .collection("groups")
        .doc(groupId)
        .collection("messages")
        .where("senderUid", "==", userId.toString()) // get messages sent by user
        .get();

    const messages = [];

    for (const messageDoc of messagesSnap.docs) {
        const messageData = messageDoc.data();
        const deliveryStatusSnap = await db
            .collection("groups")
            .doc(groupId)
            .collection("messages")
            .doc(messageDoc.id)
            .collection("deliveryStatus")
            .get();

        const deliveryStatuses = deliveryStatusSnap.docs.map(ds => ds.data());

        messages.push({
            id: messageDoc.id,
            ...messageData,
            deliveryStatus: deliveryStatuses
        });
    }

    res.status(200).json(
        new ApiResponse(200, {
            group: groupDoc,
            groupData: groupDataSnap.data(),
            messages: messages
        }, "Group retrieved successfully.")
    )
    
})

const updateGroupById = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    const { name, description } = req.body;

    if (!name && !description) {
        throw new ApiError("Name and description are required fields", 400);
    }

    const groupDoc = await Group.findByIdAndUpdate(groupId, {
        name,
        description,
    }, { new: true });

    if (!groupDoc) {
        throw new ApiError("Group not found", 404);
    }

    res.status(200).json(new ApiResponse(200, groupDoc, "Group updated successfully."));
})

const updateGroupCover = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    const coverImageLocalPath = req.files.coverImage[0].path || "";
    if (!groupId) {
        throw new ApiError("Group ID is required", 400);
    }

    const groupDoc = await Group.find({ _id: groupId })
    if (!groupDoc) {
        throw new ApiError("Group not found", 404);
    }

    const currentCoverImage = groupDoc.coverImage;
    const coverImage = await uploadToCloudinary(coverImageLocalPath);


    if (!coverImage) {
        throw new ApiError("Failed to upload cover image", 500);
    }

    groupDoc.coverImage = coverImage.url;
    await groupDoc.save();

    if (currentCoverImage) {
        await deleteFromCloudinary(currentCoverImage);
    }

    res.status(200).json(new ApiResponse(200, groupDoc, "Group cover updated successfully."));
})

const deleteGroupById = asyncHandler(async (req, res) => {
    const groupId = req.params.id;

    if (!groupId) {
        throw new ApiError("Group ID is required", 400);
    }

    const memberships = await Membership.find({ group: groupId });

    for (const membership of memberships) {
        await membership.remove();
    }

    const groupDoc = await Group.findByIdAndDelete(groupId);

    if(groupDoc.coverImage) {
        await deleteFromCloudinary(groupDoc.coverImage);
    }

    if (!groupDoc) {
        throw new ApiError("Group not found", 404);
    }

    res.status(200).json(new ApiResponse(200, groupDoc, "Group deleted successfully."));
})

const listGroupsByMemberId = asyncHandler(async (req, res) => {

})

const listGroupMembers = asyncHandler(async (req, res) => {
    const groupId = req.params.id;

    if (!groupId) {
        throw new ApiError("Group ID is required", 400);
    }

    const memberships = await Membership.aggregate([
        {
            $match: {
                group: groupId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $project: {
                _id: 1,
                user: {
                    _id: "$user._id",
                    fullName: "$user.name",
                    email: "$user.email",
                    username: "$user.username",
                    profilePicture: "$user.profilePicture"
                },
                role: 1,
            }
        }
    ])

    if (memberships.length === 0) {
        throw new ApiError("No members found for this group", 404);
    }

    res.status(200).json(new ApiResponse(200, memberships, "Group members retrieved successfully."));
})

export { createGroup, getGroupById, updateGroupById, deleteGroupById, listGroupsByMemberId, listGroupMembers, updateGroupCover };