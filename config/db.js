const mongoose = require("mongoose");
const DB = process.env.MONGODB_URI;

module.exports = async () => {
    try {
        await mongoose.connect(DB)
        console.log(`DB Connection Success`)
    }
    catch (err) {
        console.log({ error: err })
    }
}