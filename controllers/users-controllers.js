const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../helpers/http-error');

/* Get all users */
const getUsers = async (req, res, next) => {
    // Parameters
    // /api/users                   : page 1, limit 10, next
    // /api/users?page=1            : page 1, limit 10, next
    // /api/users?page=2&limit=5    : page 1, limit  5, next, previous
    // Moved to middleware
    res.json({ data: { users: res.paginatedResult } });
}

/* Get user by id */
const getUserById = async (req, res, next) => {

    const userId = req.params.uid;
    let user;

    try {
        user = await User.findOne({ _id: userId }, '-password');

        if (!user) {
            const error = new HttpError('Fetching users failed, please try again later.', 500);
            return next(error);
        }

    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.json({
        data: { user }
    });
}

/* Signup */
const signup = async (req, res, next) => {
    // ToDo - add parameters validation in the future
    const { firstName, lastName, email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exits already, please login insead.', 422);
        return next(error);
    }

    const createdUser = new User({
        firstName,
        lastName,
        email,
        password,
        tasks: [],
        createdAt: Date.now()
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(201).json({ data: { message: 'Success!' } });
}

/* Login */
const login = async (req, res, next) => {
    // ToDo - add parameters validation in the future
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Cloud not identify user, credentials seem to be wrong.', 401);
        return next(error);
    }

    const token = jwt.sign(
        { id: existingUser._id },
        config.get("jwtSecret"),
        // { expiresIn: '3h' }
        );

    res.status(200).json({ data: { token, message: "Success!" } });
}

/* Edit profile */
const editProfile = async (req, res, next) => {
    // ToDo - add parameters validation in the future
    const { firstName, lastName, password } = req.body;
    const userId = req.user.id;

    let user;

    try {
        user = await User.findById(userId);

        if (!user) {
            const error = new HttpError('Fetching users failed, please try again later.', 500);
            return next(error);
        }

    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    user.firstName = !!firstName ? firstName : user.firstName;
    user.lastName = !!lastName ? lastName : user.lastName;
    user.password = !!password ? password : user.password;

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(200).json({ data: { user: `/api/users/${user._id}`, message: "Success!" } });
}

/* Delete user */
const deleteUser = async (req, res, next) => {
    let user;
    const userId = req.user.id;

    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find a user.');
        return next(error);
    }

    try {
        await user.remove();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(200).json({ data: { message: 'Success!' } });
}

module.exports = {
    getUsers,
    getUserById,
    signup,
    login,
    editProfile,
    deleteUser
}