const express = require("express");
const router = express.Router();
const passport = require("passport");
const AppUsers = require("../models/AppUsers");



router.get("/register", (req,res)=>{
    res.render("register")
});

router.post("/register", async (req,res)=>{
    const {username, password, password2, email} = req.body;
    let errors = []

    if(!username || !password || !password2 || !email){
        errors.push({msg: "Missing field."})
    }

    if(password !== password2){
        errors.push({msg: "Passwords not matching."})
    }

    if(password.length < 6){
        errors.push({msg: "Passwords must be at least 6 characters."})
    }

    if(errors.length > 0){
        return res.render("register", {errors, username, password, password2, email});
    }

    const userExists = await AppUsers.findOne({email});

    if(userExists){
        req.flash("error_msg", "Email already exists.");
        return res.redirect("/register");
    }

    const newAppUser = new AppUsers({username, password, email});
    await newAppUser.save();

    req.flash("success_msg", "You are registered")
    res.render("login");
})

router.get("/login", (req, res) => {
    res.render("login");
});


router.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user });
});


router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
});


router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success_msg", "You Logged out");
        res.render("login");
    });
});


// router.post("/add", isAuthenticated, async (req, res) => {
//     try {
//         const newPerson = new employee(req.body);
//         await newPerson.save();
//         res.redirect("/view");
//     } catch (err) {
//         res.status(400).json({ error: "Failed to create employee" });
//     }
// });




function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();

    req.flash("error_msg", "Please login to see this page");
    res.redirect("login");
}

module.exports = {router, isAuthenticated};