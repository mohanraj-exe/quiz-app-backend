// const Quiz = require('../models/quiz');
const express = require('express');
const User = require("../models/user");
const Quiz = require("../models/quiz");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const verifyToken = require("../middleware/auth");


// Register a new user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password before saving the user
        const salt = await bcrypt.genSalt(10);
        let hashPassword = await bcrypt.hash(password, salt);

        // Match user password
        // UserSchema.methods.matchPassword = async function (enteredPassword) {
        //     return await bcrypt.compare(enteredPassword, this.password);
        // };

        user = new User({
            username,
            email,
            password: hashPassword
        });

        await user.save();

        // const payload = {
        //   user: {
        //     id: user._id,
        //   },
        // };

        // const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Success", data: user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user._id,
            },
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Success", data: token });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

router.post('/quiz/add', verifyToken, async (req, res) => {
    // console.log("req.body:", req.user);
    // const { id } = req.user;
    // const { quiz_id } = req.params;

    const { question, answer, options } = req.body;
    const quiz = await Quiz.create({ question: question, answer: answer, options: options });
    console.log("quiz:", quiz);

    return res.status(200).send({ message: 'Success', data: quiz });
});

// fetch all quiz
router.get('/quiz', async (req, res) => {

    const quiz = await Quiz.find({}).lean();
    console.log("quiz:", quiz);

    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found or incorrect answer' });
    }

    return res.status(200).json({ message: 'Selected answer is correct!', data: quiz });

});

// answering quiz
router.patch('/quiz/:quiz_id', verifyToken, async (req, res) => {
    const { id } = req.user;
    const { quiz_id } = req.params;
    const { answer } = req.body;

    const quiz = await Quiz.findOne({ _id: quiz_id }).lean();

    if (!quiz) {
        return res.status(404).send({ message: 'Quiz not found!' });
    }

    // Check if this quiz already exists in the user's quiz array
    const user = await User.findById(id);
    const existingQuizIndex = user.quiz.findIndex(q => q._id.equals(quiz_id));
    let updatedQuiz;

    if (existingQuizIndex > -1) {
        // If quiz already exists, update isAnswered status
        user.quiz[existingQuizIndex].isAnswered = true;
        user.quiz[existingQuizIndex].answer = answer;
    } else {
        // If quiz doesn't exist, add it to the user's quiz array
        const newQuiz = {
            _id: quiz_id,
            isAnswered: true,
            answer: answer,
        };
        user.quiz.push(newQuiz);
        updatedQuiz = newQuiz;
    }

    // Save the updated user document
    await user.save();

    return res.status(200).send({ message: 'Success', data: updatedQuiz });

});

// check the answered quiz
router.get('/quiz/:quiz_id', verifyToken, async (req, res) => {
    const { quiz_id } = req.params;
    const { answer } = req.body;

    const quiz = await Quiz.findOne({ _id: quiz_id, answer: answer }).lean();

    if (!quiz) {
        return res.status(404).send({ message: 'Quiz not found or incorrect answer' });
    }

    return res.status(200).send({ message: 'Selected answer is correct!', data: quiz.answer });

});

module.exports = router;
