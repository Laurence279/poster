     require('dotenv').config();
    const express = require('express');
    const mongoose = require('mongoose');
    const session = require('express-session');
    const passport =  require ('passport');
    const passportLocMon = require('passport-local-mongoose');
    // const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const findOrCreate = require('mongoose-findorcreate');
    const ejs = require('ejs');
    // const encrypt = require('mongoose-encryption');
    const port = 3000;




    const app = express();

    app.use(express.static('public'));
    app.set('view engine', 'ejs');
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(session({
        secret: "Secret Message.",
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    mongoose.connect("mongodb://localhost:27017/riftDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });

  //  mongoose.set("useCreateIndex", true);

    const userSchema = new mongoose.Schema({
        username: String,
        email: String,
        password: String
    });

    userSchema.plugin(passportLocMon);
    userSchema.plugin(findOrCreate);

    // userSchema.plugin (encrypt, {secret:process.env.secret, encryptedFields: ['password'] }); // Encrypts the "encryptedFields" with the secret string in the Schema. Encrypts when save() is called and decrypts when find() is called. (Level 2 Encryption with key and environment variable)

    const User = new mongoose.model('User', userSchema);

    passport.use(User.createStrategy());

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    // passport.use(new GoogleStrategy({
    //     clientID:     process.env.CLIENT_ID,
    //     clientSecret: process.env.CLIENT_SECRET,
    //     callbackURL: "http://localhost:3000/auth/google/secrets",
    //     userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    //     passReqToCallback   : true
    //   },
    //   function(request, accessToken, refreshToken, profile, done) {

    //     User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //       return done(err, user);
    //     });
    //   }
    // ));


    app.get("/", function (req, res) {
        res.render("home");
    })

    app.get("/auth/google",
        passport.authenticate("google",{scope: ["profile"] })
    );

    app.get( '/auth/google/secrets',
    passport.authenticate( 'google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
    }));

    app.get("/login", function (req, res) {
        res.render("login");
    })

    app.get("/register", function (req, res) {
        res.render("register");
    })

    app.post("/login", function (req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, function(err){
            if(err) {
                console.log(err);
            }
            else {
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                });
            }
        });
    });

    app.get("/submit",function(req,res){
        if (req.isAuthenticated()){
            res.render("submit");
        }
        else {
            res.redirect("/login");
        }
    })

    app.get("/logout",function(req,res){
        req.logout();
        res.redirect("/");
    });


    app.post("/register",function(req,res){
        User.register({username: req.body.username}, req.body.password, function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }
            else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        })
    });

    app.post("/submit",function(req,res){
        const submittedSecret = req.body.secret;
        User.findById(req.user.id, function(err, foundUser){
            if(err){
                console.log(err);
            }
            else{
                if (foundUser) {
                    foundUser.secret = submittedSecret;
                    foundUser.save(function(){
                        res.redirect("/secrets");
                    });
                }
            }
        })
    })

    app.get("/secrets",function(req,res) {
        User.find({"secret": {$ne:null}},function(err, foundUsers){
            if(err){
                console.log(err);
            }
            else{
                if(foundUsers)
                    {
                        res.render("secrets",{usersWithSecrets: foundUsers});
                    }   
                }});
    });



    app.listen(port, () => {
        console.log(`Server started on port ${port}`)});