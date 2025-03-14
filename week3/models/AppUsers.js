
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AppUserSchema = new mongoose.Schema({
    username:{type:String, required:true, unique:true},
    password:{type:String, required:true,},
    email:{type:String, required:true, unique:true}
});

AppUserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("AppUser", AppUserSchema);