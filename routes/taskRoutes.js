// Import necessary modules
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/auth');
const { console } = require('inspector');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'), false);
  }
});

// Route to create a new task with an image
router.post('/tasks', verifyToken, upload.single('image'), async (req, res) => {
  const { title, description, location, budget, date } = req.body;
  const userId = req.user.id; // Get user ID from token
  const imagePath = req.file ? req.file.path : null;

  try {
    const task = await Task.create({
      title,
      description,
      location,
      budget,
      date,
      user: userId, // Associate task with the user
      image: imagePath
    });
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Route to get tasks for the logged-in user
router.get('/tasks', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json({ tasks });
    console.log(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.log('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});


// Route to search tasks by title
router.get('/tasks/search', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query parameter is required' });
  
  try {
    const tasks = await Task.find({ title: new RegExp(query, 'i') });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error searching tasks:', error);
    res.status(500).json({ error: 'Error searching tasks' });
  }
});

// Route to mark a task as completed
router.put('/task/:id/complete', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = 'Completed';
    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Route to add a bid to a task
router.post('/task/:id/bid', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.bids = (task.bids || 0) + 1;
    await task.save();
    res.status(200).json({ task });
  } catch (error) {
    console.error('Error adding bid:', error);
    res.status(500).json({ error: 'Failed to add bid' });
  }
});

// Error handler
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

module.exports = router;
