import mongoose from    "mongoose";

import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
        lowercase:true,
        maxLength:[50,"Name cannot be more than 50 characters"],

    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please fill a valid email address"],
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password must be at least 8 characters"],
        select:false, 
    },
    role:{
        type:String,
        enum:{
            values:["student","instructor","admin"],
            message:"Role must be either student, instructor, or admin",
        },
        default:"student",

    },
    avatar:{
        type:String,
        default:"default-avatar.png",

    },
    bio:{
        type:String,
        maxLength:[500,"Bio cannot be more than 500 characters"],

    },
    enrolledCourses:[{
        courses:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        },
        enrolledAt:{
            type:Date,
            default:Date.now,
        },
    }],
    createdCourses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    lastActive:{
        type:Date,
        default:Date.now,
    }

        
},{ 
    timestamps:true
})

//hashing password before saving user
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);

    next();
})

//compare password for login
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}
userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
}

export default User = mongoose.model("User", userSchema);