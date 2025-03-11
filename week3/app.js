const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");
const { allowedNodeEnviornmentflags } = require("process");


const app = express();
const PORT = 3000;

const hbs = exphbs.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        eq: (a,b) => a === b
    }
});



app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));

const mongURI = "mongodb://localhost:27017/EMPL"
mongoose.connect(mongURI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB Connection Error"));
db.once("open", ()=>{
    console.log("connected to db");
});

const emplSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    department:String,
    startDate:Date,
    //yyyy-mm-dd
    jobTitle:String,
    salary:Number
});

const employee = mongoose.model("employee", emplSchema, "employee");

app.get("/viewemployees", async (req,res)=>{
    try{
        const people = await employee.find();
        res.json(people);
    }catch{
        res.status(500).json({error:"Failed to get employee data"});
    }
});

app.get("/viewemployees/:id", async (req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const person = await employee.findById(req.params.id);
        if(!person){
            return res.status(404).json({error:"Person not found"});
        }
        res.json(person);
    }catch(err){
        res.status(500).json({error:"Failed to get employee data"});
    }
});

app.post("/add", async (req,res)=>{
    try{
        const newPerson = new employee(req.body);
        const savedPerson = await newPerson.save();
        res.redirect("/view");
        
    }catch(err){
        res.status(400).json({error:"Failed to create employee"});
    }
});

app.post("/update/:id", async (req,res)=>{
    console.log("Update request received for ID:", req.params.id);
    console.log("Request body:", req.body);
    try {
        const updatedEmployee = await employee.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });

        if (!updatedEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        res.redirect("/view");
    } catch(err){
        res.status(400).json({error:"Failed to update"});
    };
});

app.post("/delete/:id", async (req,res)=>{
    try{
        const employeeId  = req.params.id;
        if (!employeeId) {
            return res.status(400).json({ error: "ID is required" });
        }
        const deletedEmployee = await employee.findByIdAndDelete(employeeId);
        if (!deletedEmployee) {
            return res.status(404).json({ error: "Person not found" });
        }

        res.redirect("/delete");
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Failed to delete employee"});
    };
});


app.get("/hbsindex", (req,res)=>{
    res.render("home", {
        title: "Employee Info",
        message: "Employee Info"
    })
});

app.get("/index", (req,res)=>{
    res.render("add", {
        title: "Add an employee",
        message: "Employee Info"
    })
});

app.get("/view", (req,res)=>{
    res.render("view", {
        title: "View Employees",
        message: "All Employee Info"
    })
});

app.get("/delete", (req,res)=>{
    res.render("delete", {
        title: "Deleted Page",
        message: "Employee Deleted"
    })
});

app.get("/edit/:id", async (req,res)=>{
    //create variable for user
    const searchedEmployee = await employee.findById(req.params.id)

    if (!searchedEmployee) {
        return res.status(404).send("Employee not found");
    }
    

    console.log(searchedEmployee.firstName)
    res.render("edit", {
        title: "Edit Employee",
        message: "Employee info",
        searchedEmployee
    })


});




app.get("/", (req, res)=>{
    
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, ()=>{
    console.log("Server running on Port 3000");
});