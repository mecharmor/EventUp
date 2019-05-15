const express = require('express');
const router = express.Router();

checkAuth = require('../middleware/check-auth.js');
userController = require('../controllers/users.js');

router.put('/register', userController.register);

router.post('/login', userController.login);

router.get('/', checkAuth, userController.getUsers); 

router.get('/:id(\\d+)', checkAuth, userController.getUser); 

router.get('/RSVP/:UserId(\\d+)', userController.getRSVP);

router.post('/checkRSVP', userController.checkRSVP);

router.post('/RSVP', userController.RSVP);

router.delete('/RSVP', userController.revoke);

router.post('/posts', userController.getPosts);

module.exports = router; 