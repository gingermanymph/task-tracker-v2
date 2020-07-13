const express = require('express');
const router = express.Router();

const tasksControllers = require('../controllers/tasks-controllers');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/', tasksControllers.getTasks);

router.post('/create', authMiddleware, tasksControllers.createTask);

router.patch('/:tid/edit', authMiddleware, tasksControllers.editTask);

router.patch('/:tid/changeStatus', authMiddleware, tasksControllers.changeStatus);

router.patch('/:tid/assignTo', authMiddleware, tasksControllers.assignTo);

router.delete('/:tid/delete', authMiddleware, tasksControllers.deleteTask);

module.exports = router;