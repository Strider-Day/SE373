const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req, res)=>{
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.use((req, res) => {
    res.writeHead(301, {
      'Location': `http://${req.headers['host']}/index.html`
    });
    res.end();
})

app.get("/json",(req, res)=>{
    res.sendFile(path.join(__dirname, "public", "todo.json"));
})

app.listen(PORT, ()=>{
    console.log("Server running on Port 3000");
})
