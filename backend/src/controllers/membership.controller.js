import { Membership } from "../models/membership.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMembership = async ({ userId, groupId, role = "member" }) => {
    const existing = await Membership.findOne({ user: userId, group: groupId });
    if (existing) {
        throw new ApiError(409, "User is already a member of this group.");
    }

    const membership = await Membership.create({
        user: userId,
        group: groupId,
        role,
        isRequest: false
    });

    if (!membership) {
        throw new ApiError(500, "Failed to add membership.");
    }

    return membership;
};

const getMembershipsByQuery = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const memberships = await Membership.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $lookup: {
                from: "groups",
                localField: "group",
                foreignField: "_id",
                as: "group"
            }
        },
        {
            $unwind: "$group"
        }
    ])

    if(memberships.length === 0){
        throw new ApiError(400, "No memberships found for this user.");
    }

    res.status(201).json(new ApiResponse(201, memberships, "Memberships retrieved successfully."));
})

const addMembership = asyncHandler(async (req, res) => {
    const { groupId, role, userId } = req.body;

    const newMembership = await createMembership({ userId, groupId, role });

    res.status(201).json(new ApiResponse(201, newMembership, "Membership added successfully."));
});

const updateMembership = asyncHandler(async (req, res) => {
    const role = req.body.role;
    const membershipId = req.params.id;

    if (!role) {
        throw new ApiError(400, "Role is required to update membership.");
    }

    const updatedMembership = await Membership.findByIdAndUpdate(membershipId, { role }, { new: true });
    if (!updatedMembership) {
        throw new ApiError(404, "Membership not found.");
    }
    res.status(200).json(new ApiResponse(200, updatedMembership, "Membership updated successfully."));
})

const deleteMembership = asyncHandler(async (req, res) => {
    const membershipId = req.params.id;
    const deletedMembership = await Membership.findByIdAndDelete(membershipId);
    if (!deletedMembership) {
        throw new ApiError(404, "Membership not found.");
    }
    res.status(200).json(new ApiResponse(200, deletedMembership, "Membership deleted successfully."));
})

export { getMembershipsByQuery, addMembership, updateMembership, deleteMembership, createMembership }