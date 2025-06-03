import { User } from "../models/user.model.js";
import { Connection } from "../models/connection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { ConnectionRequest } from "../models/connectionRequest.model.js";
import uploadToCloudinary from "../utils/fileUpload.js";
import deleteFromCloudinary from "../utils/fileDelete.js";

const getUserById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user  = await User.findById(userId).select("-googleId -refreshToken");
    if(!user){
        res.send(new ApiError(400, "User not found", user));
    }

    res.json(new ApiResponse(200, "User found", user));
})

const updateUserById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { fullName, username } = req.body;

    const user = await User.findByIdAndUpdate(userId, { fullName, username }, { new: true });
    if(!user){
        res.send(new ApiError(400, "User not found", user));
    }

    res.json(new ApiResponse(200, "User updated", user));
})

const deleteUserById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findByIdAndDelete(userId);
    if(!user){
        res.send(new ApiError(400, "User not found", user));
    }
    res.json(new ApiResponse(200, "User deleted", user));
})

const getUserConnections = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const connections = await Connection.aggregate([
        {
            $match: {
                $or: [
                    { user1: userId },
                    { user2: userId }
                ]
            }
        },
        {
            $addFields: {
                otherUserId: {
                    $cond: {
                        if: { $eq: ["$user1", userId] },
                        then: "$user2",
                        else: "$user1"
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "otherUserId",
                foreignField: "_id",
                as: "otherUser"
            }
        },
        {
            $unwind: "$otherUser"
        },
        {
            $project: {
                _id: "$otherUser._id",
                fullName: "$otherUser.fullName",
                username: "$otherUser.username",
                profilePicture: "$otherUser.profilePicture"
            }
        }
    ]);

    if (!connections || connections.length === 0) {
        return res.status(404).json(new ApiError(404, "No connections found"));
    }

    return res.status(200).json(new ApiResponse(200, "Connections found", connections));
});


const getUserGroups = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const groups = await Membership.aggregate([
            {
                $match: {
                    user: userId
                }
            },
            {
               $lookup: {
                    from : "groups",
                    localField : "group",
                    foreignField : "_id",
                    as : "group"
                }
            },
            {
                $project : {
                    _id : 1,
                    group : { $arrayElemAt: ["$group", 0] },
                    role : 1
                }
            }
    ])

    if (!groups || groups.length === 0) {
        return res.status(404).json(new ApiError(404, "No groups found"));
    }

    return res.status(200).json(new ApiResponse(200, "Groups found", groups));
})

const getIncomingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const requests = await ConnectionRequest.aggregate([
        {
            $match: {
                to: userId,
                status: "pending"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "from",
                foreignField: "_id",
                as: "fromUser"
            }
        },
        {
            $unwind: "$fromUser"
        },
        {
            $project: {
                _id: 1,
                status: 1,
                from: {
                    _id: "$fromUser._id",
                    fullName: "$fromUser.fullName",
                    username: "$fromUser.username",
                    profilePicture: "$fromUser.profilePicture"
                }
            }
        }
    ]);

    if (!requests || requests.length === 0) {
        return res.status(404).json(new ApiError(404, "No incoming connection requests found"));
    }

    return res.status(200).json(new ApiResponse(200, "Incoming connection requests found", requests));
});


const getOutgoingRequests = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const requests = await ConnectionRequest.aggregate([
        {
            $match: {
                from: userId,
                status: "pending"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "to",
                foreignField: "_id",
                as: "toUser"
            }
        },
        {
            $unwind: "$toUser"
        },
        {
            $project: {
                _id: 1,
                status: 1,
                to: {
                    _id: "$toUser._id",
                    fullName: "$toUser.fullName",
                    username: "$toUser.username",
                    profilePicture: "$toUser.profilePicture"
                }
            }
        }
    ]);

    if (!requests || requests.length === 0) {
        return res.status(404).json(new ApiError(404, "No outgoing connection requests found"));
    }

    return res.status(200).json(new ApiResponse(200, "Outgoing connection requests found", requests));
})

const searchUsers = asyncHandler(async (req, res) => {
    const {query} = req.query;
    const users = await User.find({fullname: {$regex: query, $options: 'i'} },{username: {$regex: query, $options: 'i'}}).select("_id fullname username profilePicture");
    const formattedUsers = users.map(user => ({
        userId: user._id,
        fullname: user.fullname,
        username: user.username

}));
    res.status(200).json({users: formattedUsers});
    

});

const changeProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const avatarLocalPath = req.file.avatar[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400, "No profile picture uploaded");
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const prevAvatar = user.profilePicture;

    user.profilePicture = avatar.url;
    await user.save();

    if(prevAvatar){
        await deleteFromCloudinary(prevAvatar);
    }

    res.status(200).json(new ApiResponse(200, "Profile picture updated successfully", user));
})

export { getUserById, updateUserById, deleteUserById, getUserConnections, getUserGroups, getIncomingRequests, getOutgoingRequests, searchUsers, changeProfilePicture};
