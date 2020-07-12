const express = require('express');
const router = express.Router();

const tasksControllers = require('../controllers/tasks-controllers');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/', tasksControllers.getTasks);

router.post('/create', authMiddleware, tasksControllers.createTask);

router.patch('/edit/:tid', authMiddleware, tasksControllers.editTask);

router.patch('/changeStatus/:tid', authMiddleware, tasksControllers.changeStatus);

router.patch('/assignTo', authMiddleware, tasksControllers.assignTo);

router.delete('/delete/:tid', authMiddleware, tasksControllers.deleteTask);

module.exports = router;