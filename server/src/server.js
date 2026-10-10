import {createServer} from "http";import {Server} from "socket.io";import {app} from "./app.js";import {connectDB} from "./config/db.js";import {env} from "./config/env.js";
const httpServer=createServer(app);const io=new Server(httpServer,{cors:{origin:env.CLIENT_URL}});
io.on("connection",socket=>{console.log(`⚡ Socket connected: ${socket.id}`);socket.on("join-campaign",id=>socket.join(`campaign:${id}`));socket.on("disconnect",()=>console.log(`Socket disconnected: ${socket.id}`));});
async function startServer(){try{await connectDB();httpServer.listen(env.PORT,()=>console.log(`🚀 API running on http://localhost:${env.PORT}`));}catch(error){console.error("❌ Server startup failed:",error.message);process.exit(1);}}
startServer();