import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadToCloudinary from "../utils/fileUpload.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = asyncHandler(async (req, res) => {
    const { credential } = req.body; // the ID token from Google
    const avatarLocalPath = req.files?.avatar[0]?.path  

    if (!credential) {
        return res.status(400).json({ message: "No credential provided" });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, sub: googleId, name: fullName } = payload;

    if (!email || !googleId || !fullName) {
        return res.status(400).json({ message: "Invalid Google credentials" });
    }
    let avatar = null;

    if(avatarLocalPath){
        avatar = await uploadToCloudinary(avatarLocalPath);
    }

    // Try to find user
    let user = await User.findOne({ email });

    if (!user) {
        const username = email.split("@")[0]; // You can customize this

        user = await User.create({
            email,
            username,
            fullName,
            profilePicture: avatar?.url || null,
            googleId,
        });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const loggedInUser = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        profilePicture: user.profilePicture,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "Login successful"));
});

const login = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json(new ApiResponse(400, null, "No credential provided"));
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found, please register"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    const loggedInUser = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        profilePicture: user.profilePicture,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "Login successful"));
});


const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(200).json(new ApiResponse(200, null, "User logged out"));
    }

    const user = await User.findOne({ refreshToken });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});


const refresh = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json(new ApiResponse(401, null, "No refresh token found"));
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json(new ApiResponse(403, null, "Invalid refresh token"));
        }

        const newAccessToken = user.generateAccessToken();

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json(new ApiResponse(200, {
            accessToken: newAccessToken,
        }, "Access token refreshed"));
    } catch (error) {
        return res.status(401).json(new ApiResponse(401, null, "Token expired or invalid"));
    }
});


const google = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json(new ApiResponse(400, null, "No credential provided"));
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return res.status(200).json(new ApiResponse(200, payload, "Google token verified"));
});


const session = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Session valid"));
});

export { register, login, logout, refresh, google, session }