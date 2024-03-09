const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String,required:true,unique:true},
    img:{type:String,default:"https://img.freepik.com/free-photo/square-user-profile-front-side_187299-39570.jpg?w=740&t=st=1707227666~exp=1707228266~hmac=45cd34d4ab3001dc94f65beba92d41df38117f19cd07f6e3ae2be2e879a4fa3b"},
    password:{type:String,required:true}
},{
    timestamps:true,
})
userSchema.methods.matchPassword=async function(enteredPass){
    return await bcrypt.compare(enteredPass,this.password)
}


userSchema.pre('save', async function  (next){
    if(!this.isModified){
        next();

    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})
const User = mongoose.model("User",userSchema);
module.exports=User;