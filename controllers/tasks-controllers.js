const mongoose = require('mongoose');

const Task = require('../models/task');
const User = require('../models/user');
const HttpError = require('../helpers/http-error');

// Create task
const createTask = async (req, res, next) => {
    const { title, description } = req.body;
    const userId = req.user.id;

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        console.log(user)
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
        console.log(err)
        const error = new HttpError('Creating task failed, please try again.', 500);
        return next(error);
    }

    res.status(201).json({ data: { task: createdtask } });
}

// Edit task
const editTask = async (req, res, next) => {
    const { title, description } = req.body;
    const taskId = req.params.tid;
    const userId = req.user.id;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update task', 500);
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
        // Task.updateOne({ _id: taskl._id }, {$set: {
        //     title,
        //     description
        // }})
        await task.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update task', 500);
        return next(error);
    }

    res.status(200).json({ data: { task: task.toObject({ getters: true }), message: 'Success!' } });
}

// Change status
const changeStatus = async (req, res, next) => {
    const STATUSES = ["View", "In Progress", "Done"];
    const { status } = req.body;
    const taskId = req.params.tid;

    console.log(status)

    if (!STATUSES[status]) {
        return res.status(422).json({ message: "Incorrect status, '0 - View', '1 - In Pgogress', '2 - Done'" });
    }

    let existTask;

    try {
        existTask = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError(`Something went wrong, could not edit task. ${err}`, 500);
        return next(error);
    }

    if (!existTask) {
        return res.json({ message: "Task does not exist." });
    }

    existTask.status = STATUSES[status];

    try {
        await existTask.save();
    } catch (err) {
        const error = new HttpError(`Something went wrong, could not edit task ${err}`, 500);
        return next(error);
    }

    res.json({ task: existTask, message: "The status has been changed." });
}

// Delete task
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
        const error = new HttpError(`Something went wrong, could not delete task. \n ${err.message}`, 500);
        return next(error);
    }
    res.status(200).json({ data: { message: 'Deleted task.' } });
}

// Filtering by status, sorting asc/desc
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
            tasks = await Task.find({ status: filter }).sort({ createdAt: sort });
        }
    } catch (err) {
        console.log(err)
        const error = new HttpError(`Could not fetch tasks. ${err}`, 500);
        return next(error);
    }

    res.json({ data: { tasks } });
}

// Assign to user
const assignTo = async (req, res, next) => {
    const { taskId, assignTo } = req.body;
    const userId = req.user.id;

    let task;
    try {
        task = await Task.findById(taskId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update task', 500);
        return next(error);
    }

    if (!task) {
        const error = new HttpError('Forbidden.', 403);
        return next(error);
    }

    if (task.assignTo && task.assignTo.equals(assignTo)) {
        return res.status(200).json({ data: { task: task.toObject({ getters: true }), message: 'Success!' } });
    }

    try {
        const promises = [
            // 2. Update task and user
            Task.updateOne({ _id: task._id }, { $set: { assignTo } }),
            User.updateOne({ _id: assignTo }, { $addToSet: { tasks: task._id } })
        ];

        // 1. Delete task from assigned user
        if (task.assignTo) {
            promises.push(User.updateOne({ _id: task.assignTo }, { $pull: { tasks: task._id } }));
        }

        await Promise.all(promises);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not assign task', 500);
        return next(error);
    }

    res.status(200).json({ data: { task: task.toObject({ getters: true }), message: 'Success!' } });
}

module.exports = {
    createTask,
    editTask,
    changeStatus,
    deleteTask,
    getTasks,
    assignTo
}