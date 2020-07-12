const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/users-controllers');
const authMiddleware = require('../middleware/auth-middleware');
const pagination = require('../middleware/pagination-middleware');
const User = require('../models/user');

router.get('/', pagination(User), userControllers.getUsers);

router.get('/:uid', userControllers.getUserById);

router.post('/signup', userControllers.signup);

router.post('/login', userControllers.login);

router.patch('/edit', authMiddleware, userControllers.editProfile);

router.delete('/delete', authMiddleware, userControllers.deleteUser);

module.exports = router;