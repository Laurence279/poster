require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocMon = require('passport-local-mongoose');
const session = require('cookie-session');
const findOrCreate = require('mongoose-findorcreate')
const ejs = require('ejs');
const https = require ("https");
const path = require('path');

const port = 8000;
const app = express();





app.use(express.urlencoded({
    extended: true
}));
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname+ '/public'));
console.log(path.join(__dirname, 'public'));
app.set('view engine','ejs');
app.use(session({
    secret: "Secret Message.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

console.log( `mongodb+srv://Laur:${process.env.P}@cluster0.lsmiq.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`);
mongoose.connect(`mongodb+srv://Laur:${process.env.P}@cluster0.lsmiq.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const RiftUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    profile: {
        signedUp: String,
        posts: Number,
        lastOnline: String,
        description: String,
        favColour: String,
        favFruit: String
    },
    messages: [{
        sender: String,
        content: String    
    }]

});

const RiftPostSchema = new mongoose.Schema({
    poster: String,
    content: String
})

RiftUserSchema.plugin(passportLocMon);
RiftUserSchema.plugin(findOrCreate);

const RiftUser = new mongoose.model('RiftUser', RiftUserSchema);
const RiftPost = new mongoose.model('RiftPost', RiftPostSchema);

passport.use(RiftUser.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    RiftUser.findById(id, function (err, user) {
        done(err, user);
    });
});

// const testUser = new RiftUser({username: "Test", email: "Test@Test.Test", password: "Test123"});
// testUser.save();


app.get('/favicon.ico' , function(req , res){

});


app.get("/", function (req, res) {
    res.render("home.ejs");
})

app.get("/login", function (req, res) {
    res.render("login.ejs");
})

app.get("/register", function (req, res) {
    res.render("register.ejs");
})

app.post("/profile",function(req,res){
    RiftUser.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.profile.description = req.body.desc;
                foundUser.profile.favColour = req.body.colour;
                foundUser.profile.favFruit= req.body.fruit;
                console.log(foundUser);
                foundUser.save();
                res.redirect("profile");
            }
        }
    })
})

app.get('/usercheck', function(req, res) {
    console.log(req.query.username);
    RiftUser.findOne({username: req.query.username}, function(err, user){
        if(err) {
          console.log(err);
        }
        var message;
        if(user) {
          console.log(user)
            message = "user exists";
            console.log(message)
        } else {
            message= "User doesn't exist.";
            console.log(message)
        }
        res.json({message: message});
    });
});

app.post("/messages",function(req,res){

if(req.body.username.length == 0 || req.body.message.length == 0)
{
    res.redirect("/messages");
    return;
}
else{


    var test = { sender: req.user.username, content: req.body.message};
    console.log(test);
    RiftUser.find({"username": req.body.username},function(err,foundUsername){
        if(foundUsername.length===0)
        {

            res.redirect("/messages");
            return;
        }
        if(err)
        {
            console.log(err);
        }
        else{
            foundUsername[0].messages.push(test);
            foundUsername[0].save();
            res.redirect("/messages");
        }
});
}


});


app.get("/messages",function(req,res){
    if (req.isAuthenticated()){
        RiftUser.find({"_id": req.user.id, "messages": {$ne: null}},function(err,foundMessages){
            if(err)
            {
                console.log(err);
            }
            else{
                res.render("messages.ejs",{messages:foundMessages[0].messages});
            }
    
        })
    }
    else{
        res.redirect("/login");
    }

});

app.get("/profile/:profileName", function (req, res) {

    const profile = req.params.profileName;
    var userCheck = false;
    RiftUser.find({
        "username": profile
    }, function (err, foundProfile) {
        if (err) {
            console.log(err);
        } else {
            if(req.user == null)
            {
                res.render("profile.ejs", {
                    userProfile: foundProfile,
                    userValidation: userCheck
                });
                return;
            }
            RiftUser.findById(req.user.id, function (err, foundUser) {

                if (err) {
                    console.log(err);

                } else {
                    console.log("Found User");
                    console.log(foundProfile[0].id);
                    console.log(req.user.id);
                    if (foundProfile[0].id === foundUser.id) { //Is the current user accessing its own profile?
                        console.log("User ID match");
                        userCheck = true;
                    };

                    console.log(userCheck);
                    res.render("profile.ejs", {
                        userProfile: foundProfile,
                        userValidation: userCheck
                    });
                }
            });
        }
    })
});

app.get("/profile", function (req, res) {
    if (req.isAuthenticated()) {
        RiftUser.find({
            "_id": req.user.id
        }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                res.render("profile.ejs", {
                    userProfile: foundUser,
                    userValidation: true
                });
            }
        })

    } else {
        res.redirect("/login");
    }
});

app.post("/login", function (req, res) {

            const date = new Date();

            const ddMmYyyy = date.toLocaleDateString('en-GB', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });

            const user = new RiftUser({
                username: req.body.username,
                password: req.body.password
            });

            req.login(user, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            passport.authenticate("local")(req, res, function () {


                                RiftUser.findById(req.user.id, function (err, foundUser) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if (foundUser) {
                                            foundUser.profile.lastOnline = ddMmYyyy;
                                            foundUser.save();
                                            res.redirect("/secrets");
                                        }
                                    }
                                });
                            })
                        }})});

                        app.post("/register", function (req, res) {

                            const date = new Date();

                            const ddMmYyyy = date.toLocaleDateString('en-GB', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric'
                            });

                            RiftUser.register({


                                username: req.body.username,
                                profile: {
                                    signedUp: ddMmYyyy,
                                    posts: 0,
                                    lastOnline: ddMmYyyy,
                                    description: "Write a little bit about yourself.",
                                    favColour: "Put your favourite colour here.",
                                    favFruit: "Put your favourite fruit here."
                                }
                            }, req.body.password, function (err, user) {
                                if (err) {
                                    console.log(err);
                                    res.redirect("/register");
                                } else {
                                    passport.authenticate("local")(req, res, function () {
                                        res.redirect("/secrets");
                                    });
                                }
                            })
                        });

                        app.get("/secrets", function (req, res) {
                            if (req.isAuthenticated()) {
                                RiftPost.find({
                                    "content": {
                                        $ne: null
                                    }
                                }, function (err, foundPosts) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        if (foundPosts) {
                                            res.render("secrets.ejs", {
                                                posts: foundPosts
                                            });
                                        }
                                    }
                                });
                            }
                            else{
                                res.redirect("/");
                            }

                        });

                        app.get("/logout", function (req, res) {
                            req.logout();
                            res.redirect("/");
                        });

                        app.post("/submit", function (req, res) {
                            const newPost = new RiftPost({
                                content: req.body.post
                            });
                            RiftUser.findById(req.user.id, function (err, foundUser) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (foundUser) {
                                        foundUser.profile.posts++;
                                        newPost.poster = req.user.username;
                                        foundUser.save();
                                        newPost.save(function () {
                                            res.redirect("/secrets");
                                        });
                                    }
                                }
                            })
                        })

                        app.get("/submit", function (req, res) {

                            if (req.isAuthenticated()) {

                                res.render("submit.ejs");
                            } else {
                                res.redirect("/login");
                            }
                        })


                        app.listen(port, () => {
                            console.log(`Server started on port ${port}`)
                        });