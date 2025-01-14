const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE)
.then(()=>console.log("database connect successfully"))
.catch((err)=>console.log(err))