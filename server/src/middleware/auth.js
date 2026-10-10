import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function auth(req,res,next){
  const token=req.headers.authorization?.replace("Bearer ","");
  if(!token)return res.status(401).json({message:"Authentication required"});
  try{const p=jwt.verify(token,env.JWT_SECRET);req.user={id:p.id,role:p.role};next();}
  catch{return res.status(401).json({message:"Invalid or expired token"});}
}
export function requireRole(...roles){return(req,res,next)=>{
  if(!req.user||!roles.includes(req.user.role))return res.status(403).json({message:"Forbidden"});
  next();
};}