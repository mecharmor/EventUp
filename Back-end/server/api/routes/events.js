const express = require('express');
const router = express.Router();

const multer = require('multer');

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString(); const date = now.replace(/:/g, '-'); cb(null, date + file.originalname);
    } 
})
const upload = multer({ storage: storage });

checkAuth = require('../middleware/check-auth.js');
eventController = require('../controllers/events.js');

router.get('/', checkAuth, eventController.getAllEvents);

router.post('/', checkAuth, upload.single('Image'), eventController.postEvent);

router.delete('/:id', checkAuth, eventController.deleteEvent);

router.get('/:id', checkAuth, eventController.getEvent);

module.exports = router; 