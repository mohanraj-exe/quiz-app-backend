const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    question: { type: String },
    answer: { type: String },
    options: [{ type: String }]
}, { timestamps: true });

const Quiz = mongoose.model('quiz', QuizSchema);

module.exports = Quiz;

