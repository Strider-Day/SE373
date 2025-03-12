//example using socket.io
require("dotenv").config();
const { Socket } = require("dgram");
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const {OpenAI} = require("openai");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const openAI = new OpenAI({
    apiKey: process.env.AI_API_KEY,
});



//Setup static folder
app.use(express.static("public"));
const users = new Set();

//Actual Socket.io application
io.on("connection",(socket)=>{
    console.log("A new user connected to the server.")

    socket.on("chat message", async (msg)=>{
        console.log(`Message from ${socket.id}: ${msg}`);
        console.log("OpenAI API Key:", process.env.AI_API_KEY ? "Loaded" : "Not Found");
        //Broadcast message to all connect clients
        io.emit("chat message", `${socket.username}: ${msg}`);

        if(msg.includes("@bot")){
            const botResponse = await getBotResponse(msg);
            io.emit("chat message", `Bot: ${botResponse}`);
        }
    })

    //Setr the username
    socket.on("set username", (username)=>{
        socket.username = username;
        users.add(username);
        socket.emit("user list", Array.from(users));
    });

    socket.on("disconnect",()=>{
        console.log("User disconnected:", socket.io);
        users.delete(socket.username);
        io.emit("user list", Array.from(users));
    })
});

async function getBotResponse(userMessage){
    try{
        const response = await openAI.chat.completions.create({
            model: "gpt-3.5",
            messages: [{role: "user", content: userMessage}],

        });
        return response.choices[0].message.content.trim();
    } catch (error){
        console.error("Error with Open API:", error.response ? error.response.data : error.message);
        return "I couldn't take action for that request";
    }
}

server.listen(3000, ()=>{
    console.log("Server running on port 3000")
})