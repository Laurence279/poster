require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passportLocMon = require('passport-local-mongoose');
const session = require('cookie-session');
const findOrCreate = require('mongoose-findorcreate')
const ejs = require('ejs');
const https = require("https");
const path = require('path');
const Arena = require('./arena');
const arena = require(__dirname + '/arena');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const { hasUncaughtExceptionCaptureCallback } = require('process');
const saltRounds = 10;
const crypto = require('crypto')


// async..await is not allowed in global scope, must use a wrapper
async function sendResetMail(userEmail, link) {
    // Generate test SMTP service account from ethereal.email






    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
           ciphers:'SSLv3'
        },
        auth: {
            user: 'riftworld@outlook.com',
            pass: process.env.OUT
        }
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Rift World" riftworld@outlook.com',
        to: userEmail,
        subject: 'Reset Password',
        text: `Hello! It seems you have forgotten your password. No matter, just follow the link below to reset it: ${link}`,
        html: `<p>Hello! It seems you have forgotten your password. No matter, just follow the link below to reset it.</p><a href=${link}>Reset Password</a>`
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  }
  



const app = express();





app.use(express.urlencoded({
    extended: true
}));
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: "Secret Message.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(`mongodb+srv://Laur:${process.env.P}@cluster0.lsmiq.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const RiftUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    resetPasswordToken: String,
    profile: {
        signedUp: String,
        posts: Number,
        lastOnline: String,
        description: String,
        favColour: String,
        favFruit: String,
        arenaWins: Number,
        arenaLosses: Number
    },
    messages: [{
        sender: String,
        content: String
    }]

});

const RiftArenaPlayerSchema = new mongoose.Schema({
    name: String
})

const RiftArenaMatchSchema = new mongoose.Schema({
    date: Date,
    match: [{
        round: String,
        combatantA: String,
        combatantB: String,
        winner: String,
        log: Array
    }]
})

const RiftPostSchema = new mongoose.Schema({
    poster: String,
    content: String
})



RiftUserSchema.plugin(passportLocMon);
RiftUserSchema.plugin(findOrCreate);

const RiftUser = new mongoose.model('RiftUser', RiftUserSchema);
const RiftPost = new mongoose.model('RiftPost', RiftPostSchema);
const RiftArenaPlayer = new mongoose.model('RiftArenaPlayer', RiftArenaPlayerSchema);
const RiftArenaMatch = new mongoose.model('RiftArenaMatch', RiftArenaMatchSchema);

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

app.get("/", function (req, res) {
    res.render("home.ejs");
})

app.get("/login", function (req, res) {
    res.render("login.ejs");
})

app.get("/register", function (req, res) {
    res.render("register.ejs");
})

app.post("/profile", function (req, res) {
    RiftUser.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.profile.description = req.body.desc;
                foundUser.profile.favColour = req.body.colour;
                foundUser.profile.favFruit = req.body.fruit;
                console.log(foundUser);
                foundUser.save();
                res.redirect("profile");
            }
        }
    })
})

app.get('/arenaTime', function (req, res) {

    const currentServerTime = new Date();
    console.log("Current server time is "+ currentServerTime);
    console.log("Next Match is scheduled for " + dateOfNextMatch);
    res.send({dateOfNextMatch: dateOfNextMatch, currentServerTime: currentServerTime});
})

let matches = [];
let dateOfNextMatch;


function simulateArena(_callback) {
    const players = [];
    RiftArenaPlayer.find({}, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            results.forEach(function (player) {
                players.push(player.name);
            });
            const newArena = new Arena();
            matches = newArena.initArena(players);
            newArena.simulateBattles(matches);
            _callback(matches);
        }
    })
}


// ARENA TESTING
// simulateArena(function(matches){
//     console.log(matches);
// });


app.get('/arena', function (req, res) {

    if (req.isAuthenticated()) {
        RiftUser.find({
            "_id": req.user.id
        }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                RiftArenaMatch.find({},
                    function (err, results) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(results);
                            const x = results.length - 1;
                            const matchID = results[x]._id;
                            console.log(matchID);
                            const retrievedDate = results[x].date;
                            const now = new Date();
                            console.log("Setting matches to render")


                            if (now > retrievedDate) {
                                console.log("The previous match deadline has passed.");
                                console.log(results[x].match.length);
                                if (results[x].match.length == 0) {
                                    simulateArena(function(matches){
                                        //Get Arena Results and Save to DB
                                        //________________________________
                                        RiftArenaMatch.updateOne({_id: matchID}, {
                                            $set: {
                                                match: matches
                                            }
                                        },function (err, res) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log(res);
                                                console.log("Done!");
                                            }

                                            //Update Arena Winner Profile Wins
                                            const finalArenaRound = matches.filter((match) => match.round === "Result");
                                            const arenaWinner = finalArenaRound[0].combatantA;    
                                            if(arenaWinner !== "Bot"){
                                            console.log(arenaWinner);          
                                            RiftUser.updateOne({username: arenaWinner},{
                                                $inc: {
                                                    'profile.arenaWins' : +1
                                                }
                                            },{upsert:true,new:true},function(err,res){
                                                if(err){
                                                    console.log(err);
                                                }
                                            })
                                        }

                                            //Update Arena Losers Profile Losses

                                            const arenaLosers = matches.filter(function (match) {
                                                if (!match.winner || match.combatantA === "Bot" || match.combatantB === "Bot") {
                                                  return null;
                                                } else {
                                                  return match;
                                                }
                                              }).map(function (match) {
                                                return match.winner !== match.combatantA
                                                  ? match.combatantA
                                                  : match.combatantB;
                                              });

                                              arenaLosers.forEach(function(loser){
                                                  RiftUser.updateOne({username: loser},{
                                                      $inc: {
                                                          'profile.arenaLosses' : +1
                                                      }
                                                  },{upsert:true, new: true},function(err,res){
                                                      if(err){
                                                          console.log(err)
                                                      }
                                                  })
                                              })



                                            //Setting New Date Below This Line
                                            //________________________________

                                            let newDate = new Date();
                                            if (newDate.getUTCHours() > 15)
                                            {
                                                newDate.setUTCDate(newDate.getUTCDate() + 1);
                                            }

                                            newDate.setUTCHours(16, 0, 0, 0);
                                            console.log(newDate);
                                            const newArenaMatch = RiftArenaMatch({
                                                date: newDate
                                            });
                                            newArenaMatch.save();
                                            dateOfNextMatch = newArenaMatch.date;


                                            //Clear Arena Player List
                                            //_______________________
                                            RiftArenaPlayer.deleteMany({},function(err,results){
                                                    if(err){
                                                        console.log(err);
                                                    }
                                                    else{
                                                        console.log(results.deletedCount +" players removed from list.");
                                                    }
                                            })


    
                                        });
                                    });
                                }
                                else{
                                    matches = results[x].match;
                                }
                            } else {
                                console.log("The previous match deadline has not yet passed.");
                                matches = results[x-1].match;
                                dateOfNextMatch = retrievedDate;
                            }

                            //Get Participants Who Have Entered This Arena
                            RiftArenaPlayer.find({}, function (err, results) {
                                if (err) {
                                    console.log(err);
                                } else {


                                    function getRiftUsers(){
                                        return Promise.all(results.map(function (player) {
                                            return RiftUser.findOne({
                                                username: player.name
                                            }).then(function(result){
                                                return Promise.resolve(result);
                                                }, function(error){
                                                    return Promise.reject(error);
                                                });
                                        }))
                                    }

                                    getRiftUsers().then(result => {
                                        const players = result;
                                        console.log(typeof (players));

                                        res.render("arena.ejs", {
                                        arenaPlayerList: players,
                                        arenaMatchList: matches
                                })});
                            
                                        


                                           

                                }
                            })
                        }
                    })

            }
        })
    } else {
        res.redirect("/login");
    }
});


app.post("/arena", function (req, res) {

    const user = {
        'name': req.user.username
    };
    console.log(user);
    RiftArenaPlayer.findOne(user, function (err, result) {
        if (err) {
            console.log(err);
        } else if (!result) {
            const newArenaPlayer = new RiftArenaPlayer({
                name: req.user.username
            });
            newArenaPlayer.save();
        }
    })
    res.redirect("/arena")
})

app.get('/usercheck', function (req, res) {
    console.log(req.query.username);
    RiftUser.findOne({
        username: req.query.username
    }, function (err, user) {
        if (err) {
            console.log(err);
        }
        var message;
        if (user) {
            console.log(user)
            message = "user exists";
            console.log(message)
        } else {
            message = "User doesn't exist.";
            console.log(message)
        }
        res.json({
            message: message
        });
    });
});

app.post("/messages", function (req, res) {

    if (req.body.username.length == 0 || req.body.message.length == 0) {
        res.redirect("/messages");
        return;
    } else {


        var test = {
            sender: req.user.username,
            content: req.body.message
        };
        console.log(test);
        RiftUser.find({
            "username": req.body.username
        }, function (err, foundUsername) {
            if (foundUsername.length === 0) {

                res.redirect("/messages");
                return;
            }
            if (err) {
                console.log(err);
            } else {
                foundUsername[0].messages.push(test);
                foundUsername[0].save();
                res.redirect("/messages");
            }
        });
    }


});


app.get("/messages", function (req, res) {
    if (req.isAuthenticated()) {
        RiftUser.find({
            "_id": req.user.id,
            "messages": {
                $ne: null
            }
        }, function (err, foundMessages) {
            if (err) {
                console.log(err);
            } else {
                res.render("messages.ejs", {
                    messages: foundMessages[0].messages
                });
            }

        })
    } else {
        res.redirect("/login");
    }

});

app.get("/profile/:profileName", function (req, res) {


    const profile = req.params.profileName;
    console.log(profile);
    var userCheck = false;
    RiftUser.find({
        "username": profile
    }, function (err, foundProfile) {
        if (err) {
            console.log(err);
        } else {
            if (req.user == null) {
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
        }
    })
});

app.get("/reset", function (req,res){
    res.render("reset.ejs");
});

var test;

app.post("/reset",function (req,res){
    const email = req.body.email;
    RiftUser.findOne({email:email},function(err,result){
        if(err || result == null){
           return (res.send("No user found with that email."));
        }
        else{
            const token = crypto.randomBytes(32).toString('hex')
            bcrypt.hash(token, saltRounds).then(function(hash) {
                
                RiftUser.updateOne({email:email},{
                    $set: {
                        'resetPasswordToken' : hash,
                    }
                },{upsert:true, new: true},function(err,res){
                    if(err){
                        console.log(err)
                    }
                })
                
                let link = "https://riftworld.herokuapp.com/reset-request/" + email + "/" + token;
                sendResetMail(email,link).catch(console.error);
                res.send("Reset Email sent!");
            });
        }
    })


})

app.route("/reset-request/:email/:token").get(function(req,res){

    RiftUser.findOne({email: req.params.email},function(err, result){
        if(err){
            console.log(err);
        }
        else{
            bcrypt.compare(req.params.token, result.resetPasswordToken).then(function(result) {
                result ? res.render("reset-authorise.ejs", {email: req.params.email, token: req.params.token}) : res.send("Invalid token. Please contact riftworld123@outlook.com for more help.");
        })
    }})
}).post(function(req,res){
    RiftUser.findOne({email: req.params.email},function(err, user){
        if(err){
            console.log(err);
        }
        else{
    bcrypt.compare(req.params.token, user.resetPasswordToken).then(function(result) {
        if(result){
            user.resetPasswordToken = "";
            user.setPassword(req.body.pw,function(){
                user.save();
            });
            res.send("Passsword changed successfully!");
        } else{
            res.send("Invalid token. Please contact riftworld123@outlook.com for more help.");
        }
    })

    }
})})


app.post("/register", function (req, res) {

    const date = new Date();
    
    const ddMmYyyy = date.toLocaleDateString('en-GB', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    RiftUser.register({


        username: req.body.username,
        email: req.body.email,
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
    } else {
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

let port = process.env.PORT || 3000;
server = app.listen(port, () => {
    let {address, family, port} = server.address();
    console.log("server started at https://" + address + ":" + port);
});










