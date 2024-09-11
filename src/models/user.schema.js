let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken')

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32,
        minlength: 2,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    },
    contact: {
        type: String,
        required: [true, "Contact number is required."],
        trim: true,
        maxlength: 10,
        minlength: 10,
        unique: true,
        match: /^[6-9]\d{9}$/,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        // maxlength: 32,
        minlength: 6,
        select: false
    },
    avatar: {
        type: Object,
        default: {
            fileId: "",
            url: "https://imgs.search.brave.com/sHfS5WDNtJlI9C_CT2YL2723HttEALNRtpekulPAD9Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2LzMzLzU0Lzc4/LzM2MF9GXzYzMzU0/Nzg0Ml9BdWdZemV4/VHBNSjl6MVljcFRL/VUJvcUJGMENVQ2sx/MC5qcGc",
        },
    },
    date: {
        type: Date,
        default: Date.now
    },
    bio: {
        type: String,
        default: "student"
    },
    summary: {
        type: String
    },
    city: {
        type: String
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    gender: {
        type: String
    },
    dateofbirth: {
        type: String
    },
    education: [],
    achievements: [],
    socialmedia:
    {
        gmail: {
            type: String
        },
        facebook: {
            type: String
        },
        instagram: {
            type: String
        },
        linkedin: {
            type: String
        },
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        pinterest: {
            type: String
        },
        other: {
            type: String
        }
    }
    ,
    PendingRoadmaps: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pendingroadmap',
        }
    ],
    roadmaps: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UpdatedRoadmap',
        }
    ],
    iplocation: {
        type: Object,
        default: {}
    },
    resetPasswordToken: {
        type: String,
        default: "0",
    },
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
if (!this.isModified('password')) {
    next();
}

const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model('User', userSchema);
