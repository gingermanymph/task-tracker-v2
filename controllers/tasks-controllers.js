const mongoose = require('mongoose');

const Task = require('../models/task');
const User = require('../models/user');
const HttpError = require('../helpers/http-error');

/* Create task */
const createTask = async (req, res, next) => {
    const { title, description } = req.body;
    const userId = req.user.id;

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find a user.', 404);
        return next(error);
    }

    const createdtask = new Task({
        title,
        description,
        status: "View",
        assignTo: user._id,
        owner: user._id,
        createdAt: Date.now()
    });

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdtask.save({ session: sess });
        user.tasks.push(createdtask);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(201).json({ data: { task: createdtask } });
}

/* Edit task */
const editTask = async (req, res, next) => {
    const { title, description } = req.body;
    const taskId = req.params.tid;
    const userId = req.user.id;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!task) {
        const error = new HttpError('Forbidden.', 403);
        return next(error);
    }

    if (task.owner && !task.owner.equals(userId)) {
        const error = new HttpError('Forbidden.', 403);
        return next(error);
    }

    task.title = !!title ? title : task.title;
    task.description = !!description ? description : task.description;

    try {
        await task.save();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(200).json({ data: { task, message: 'Success!' } });
}

/* Change status */
const changeStatus = async (req, res, next) => {
    const STATUSES = ["View", "In Progress", "Done"];
    const { status } = req.body;
    const taskId = req.params.tid;

    if (!STATUSES[status]) {
        return res.status(422).json({ data: { message: "Incorrect status, '0 - View', '1 - In Pgogress', '2 - Done'" } });
    }

    let existTask;

    try {
        existTask = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!existTask) {
        return res.json({ message: "Task does not exist." });
    }

    existTask.status = STATUSES[status];

    try {
        await existTask.save();
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.json({ task: existTask, message: "The status has been changed." });
}

/* Delete task */
const deleteTask = async (req, res, next) => {
    const taskId = req.params.tid;
    const userId = req.user.id;

    let task;

    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete task', 500);
        return next(error);
    }

    if (!task) {
        const error = new HttpError('Could not find task for this id.');
        return next(error);
    }

    if (task.owner && !task.owner.equals(userId)) {
        const error = new HttpError('Forbidden.', 403);
        return next(error);
    }

    try {

        if (task.assignTo || task.owner) {
            await User.updateOne({ _id: task.assignTo || task.owner }, { $pull: { tasks: task._id } });
        }

        await Task.remove({ _id: task._id });

    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.status(200).json({ data: { message: 'Success!' } });
}

/* Get tasks with filtering by status and sorting asc/desc */
const getTasks = async (req, res, next) => {
    const filter = req.query.filter;
    const sort = req.query.sort;

    let tasks;

    try {
        tasks = await Task.find({});

        if (filter) {
            tasks = await Task.find({ status: filter });
        }
        if (sort) {
            tasks = await Task.find({}).sort({ createdAt: sort })
        }
        if (filter && sort) {
            // Need to fix createdAt parameter to owner.createdAt
            tasks = await Task.find({ status: filter }).sort({ createdAt: sort });
        }
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    res.json({ data: { tasks } });
}

/* Assign to user */
const assignTo = async (req, res, next) => {
    const { assignTo } = req.body;
    const taskId = req.params.tid;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }

    if (!task) {
        const error = new HttpError('Forbidden.', 403);
        return next(error);
    }

    if (task.assignTo && task.assignTo.equals(assignTo)) {
        return res.status(200).json({ data: { task, message: 'Success!' } });
    }

    try {
        // Need to fix. Assigning task to valid but unexisted random IDs
        const promises = [
            Task.updateOne({ _id: task._id }, { $set: { assignTo } }),
            User.updateOne({ _id: assignTo }, { $addToSet: { tasks: task._id } }),
        ];
        
        if (task.assignTo) {
            promises.push(User.updateOne({ _id: task.assignTo }, { $pull: { tasks: task._id } }));
        }
        
        await Promise.all(promises);
    } catch (err) {
        const error = new HttpError(err.message, 500);
        return next(error);
    }
    // Need to fix, in response assignTo == owner (is not updated).
    res.status(200).json({ data: { task, message: 'Success!' } });
}

module.exports = {
    createTask,
    editTask,
    changeStatus,
    deleteTask,
    getTasks,
    assignTo
}