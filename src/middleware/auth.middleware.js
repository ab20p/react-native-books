import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

const protectRoute = async (req,res,next)=>{
    try {
        const token = req.header("Authorization").replace("Bearer ","")
        if(!token) return res.status(401).json({message:"Access Denied."})

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password")    ;

        if(!user) return res.status(401).json({message:"Invalid Token."})

         req.user = user;
         next();   
    } catch (error) {
        console.log("Auth error",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export default protectRoute