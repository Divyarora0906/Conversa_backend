const mongoose = require("mongoose");

const connectDB = async() => {
    try{
       const conn = await mongoose.connect(process.env.MONGO_URL,{
       })
       console.log(`Connected ${conn.connection.host}`)
    }
    catch(err){
    console.log(`Error MongoConnetion ${err}`)
    process.exit();
    }
}
module.exports = connectDB;