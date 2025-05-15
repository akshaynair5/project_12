import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const register = asyncHandler(async (req, res)=>{
    
})

const login = asyncHandler(async (req, res)=>{
    
})

const logout = asyncHandler(async (req, res)=>{
    
})

const refresh = asyncHandler(async (req, res)=>{
    
})

const google = asyncHandler(async (req, res)=>{
    
})

const session = asyncHandler(async (req, res)=>{
    res.json(new ApiResponse(200, "Success", req.user))
})

export { register, login, logout, refresh, google, session }