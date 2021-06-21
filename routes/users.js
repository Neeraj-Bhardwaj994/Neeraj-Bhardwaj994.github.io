const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

//user model
const User = require('../models/User')

//login
router.get('/login',(req,res) => {
    res.render("login")
})

//Register
router.get('/register',(req,res) => {
    res.render("register")
})

//Register Handle
router.post('/register', (req,res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please fill the required information'})
    }

    // Password match
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'})
    }

    //Password length
    if(password.length < 6){
        errors.push({msg: 'Password is too small, it should be atleast 6 characters'})
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //validation passed
        User.findOne({ email: email })
        .then(user => {
            if(user){
                //user exists
                errors.push({msg: 'Email is already registered'})
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                })

                // Hash password
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err

                    //set password to hash
                    newUser.password = hash
                    // save user
                    newUser.save()
                    .then(user => {
                        req.flash('success_msg', 'You are now registered and can log in')
                       
                        //to redirect the page after register
                        res.redirect('/users/login')
                    })
                    .catch(err = console.log(err))
                }) )

            }
        })
    }
})

//Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out!!');
    res.redirect('/users/login');
  });

module.exports = router