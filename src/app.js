// .env configuration
require('dotenv').config({ path: './.env' });
// import express
let express = require("express");
let app = express();

// use database
require('./models/database.js').connectDatabase()
// passport configuration
const passport = require("passport");
const Oauth2Strategy = require("passport-google-oauth20").Strategy;
const userdb = require("./models/user.schema.js");

// logger
app.use(require('morgan')('tiny'));

// corc integration
const cors = require("cors");
app.use(
    cors({
        origin: ["https://crosstheskylimits.online","http://localhost:5173"],
        credentials: true,
    })
  );

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// session and cookie
const session = require("express-session");
const cookieparser = require("cookie-parser");
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.EXPRESS_SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: "None", // Allow cross-site requests
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            httpOnly: true, // Prevents JavaScript access to cookies
        },
    })
);
app.use(cookieparser());
// express file-upload
const fileupload = require("express-fileupload");
app.use(fileupload());

//************************************
// passport configuration
passport.use(
    new Oauth2Strategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' ? "https://crosstheskylimits.online/auth/google/callback" : "http://localhost:3030/auth/google/callback",
        scope: ["profile", "email"],
      },
      async function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        try {
          let user = await userdb.findOne({ googleId: profile.id });
  
          if (!user) {
            user = new userdb({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: {
                    fileId: "", // Assuming Google profile photos don't provide a fileId
                    url: profile.photos[0].value,
                },
            });
  
            await user.save();
          }
          return cb(null, user);
        } catch (error) {
          return cb(error, null);
        }
      }
    )
  );
  
  // passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser(async (user, done) => {
    done(null, user);
  });
//************************************
    
// index routes
app.use('/api/v1/user/', require('./routes/index.routes.js'))
app.use('/api/v1/roadmap/', require('./routes/roadmap.routes.js'))
app.use('/api/v1/admin/', require('./routes/admin.routes.js'))

// Error handling 
const ErrorHandler = require('./utils/ErrorHandler.js');
const { generatedErrors } = require('./middlewares/error.js');
app.use("*",async(req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generatedErrors)

// server listen 
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`);
});