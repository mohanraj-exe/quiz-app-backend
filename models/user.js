const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    quiz: [{
        _id: mongoose.Types.ObjectId,
        isAnswered: { type: Boolean, required: false },
        answer: { type: String, required: true }
    }]
}, { timestamps: true }
);

const User = mongoose.model('user', UserSchema);

module.exports = User;
