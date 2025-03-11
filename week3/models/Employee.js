const mongoose = require("mongoose");

const emplSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    department:String,
    startDate:Date,
    //yyyy-mm-dd
    jobTitle:String,
    salary:Number
});

module.exports = mongoose.model("employee", emplSchema, "employee");
