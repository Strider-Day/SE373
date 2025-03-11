const express = require("express");
const router = express.Router();
const employee = require("../models/Employee");
const {isAuthenticated} = require("./auth");

//pages
router.get("/index", isAuthenticated, (req,res)=>{
    res.render("add", {
        title: "Add an employee",
        message: "Employee Info"
    })
});

router.get("/view", isAuthenticated, (req,res)=>{
    res.render("view", {
        title: "View Employees",
        message: "All Employee Info"
    })
});

router.get("/delete", isAuthenticated, (req,res)=>{
    res.render("delete", {
        title: "Deleted Page",
        message: "Employee Deleted"
    })
});

router.get("/edit/:id", isAuthenticated, async (req,res)=>{
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

//crud functions
router.get("/viewemployees", async (req,res)=>{
    try{
        const people = await employee.find();
        res.json(people);
    }catch{
        res.status(500).json({error:"Failed to get employee data"});
    }
});

router.get("/viewemployees/:id", async (req,res)=>{
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

router.post("/add", async (req,res)=>{
    try{
        const newPerson = new employee(req.body);
        const savedPerson = await newPerson.save();
        res.redirect("/view");
        
    }catch(err){
        res.status(400).json({error:"Failed to create employee"});
    }
});

router.post("/update/:id", async (req,res)=>{
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

router.post("/delete/:id", async (req,res)=>{
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

module.exports = router;