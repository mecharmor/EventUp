const db = require('../models/database.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res, next) => {
    bcrypt.hash(req.body.Password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                status: false,
                error: err
            });
        }
        else {
            db.query('INSERT INTO User SET ?', 
            {FirstName: req.body.FirstName, LastName: req.body.LastName, Email: req.body.Email, Password: hash})
            .then(([result, fields]) => {
                const token = jwt.sign(
                    {
                        id: result.insertId,
                        FirstName: req.FirstName,
                        LastName: req.LastName,
                        Email: req.Email,
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '24h'
                    }
                )
                res.status(200).json({
                    status: true,
                    id: result.insertId,
                    message: 'Registered Successfully',
                    token: token
                });
            })
            .catch(err => {
                res.send({
                    status: false,
                    message: 'error',
                    error: err
                });
            })
            }
        });
}

exports.login = (req, res, next) => {
    db.query('SELECT * FROM User WHERE Email = ?', req.body.Email)
    .then(([user, fields]) => {
        //No User Found Check
        if(user == "") {
            res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }
        bcrypt.compare(req.body.Password, user[0].Password, (err, result) => {
            if(result) {
                const token = jwt.sign(
                    {
                        id: user.id,
                        FirstName: user.FirstName,
                        LastName: user.LastName,
                        Email: user.Email,
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: '24h'
                    }
                )
                res.status(200).json({
                    id: user[0].id,
                    status: true,
                    message: 'Successful login',
                    token: token
                });
            }
            else {
                return res.status(401).json({
                    status: false,
                    message: 'Auth failed'
                });
            }
        });
    })
    .catch(err => {
        res.send({
            status: false,
            message: err
        })
    })
} 

exports.RSVP = (req, res, next) => {
    // db.query('SELECT RSVP.*, COUNT(*) FROM RSVP'+
    // 'WHERE RSVP.UserId = ? AND RSVP.EventId = ? '
    // ,[req.body.UserId, req.body.UserId]).then(([count,_]) =>{
    //     if(count > 0){
    //         console.log("gotcha bitch :" + count);
    //     }
    //     console.log("oop :" + count);
        db.query('INSERT INTO RSVP SET ?', 
        { UserId: req.body.UserId, EventId: req.body.EventId })
        .then(([result, fields]) => {
            res.status(200).json({
                status: true,
                message: "RSVP Successful"
            })
        })
        .catch( err => {
            res.status(500).json({
                status: false,
                message: err
            })
        })
    //})
}

exports.revoke = (req, res, next) => {
    db.query('DELETE FROM RSVP WHERE UserId = ? AND EventId = ?', [req.body.UserId, req.body.EventId])
    .then( ([result, fields]) => {
        res.status(200).json({
            status: true,
            message: "RSVP Deletion Successful"
        })
    })
    .catch( err => {
        res.status(500).json({
            status: false,
            message: err
        })
    })
}
exports.getPosts = (req, res, next) => {
    db.query('SELECT Event.*, '+
    'Category.Name AS CategoryName, Location.Name AS LocationName'+
    ' FROM Event JOIN Location ON Event.LocationId = Location.id JOIN Category '+
    'ON Event.CategoryId = Category.id'+
    ' WHERE Event.UserId = ?',[req.body.UserId])
    .then(([result, fields]) => {
        console.log(result);
        res.status(200).json({
            status: true,
            data: result,
            message: "All User Posts for signed in user"
        })
    })
    .catch( err => {
        res.status(500).json({
            status: false,
            message: err
        })
    })
}

exports.getRSVP = (req, res, next) =>{
    db.query('SELECT Event.*, '+
    'Category.Name AS CategoryName ,Location.Name AS LocationName, Location.Longitude, Location.Latitude'+
        ' FROM Event JOIN RSVP ON Event.id = RSVP.EventId'+
        ' JOIN Location ON Event.LocationId = Location.id JOIN Category '+
        'ON Event.CategoryId = Category.id'+
        ' WHERE RSVP.UserId = ?', [req.body.UserId])
        .then(([data,_]) => {
        const response = {
            status: true,
            message: "all RSVP records queried",
            data: data
        }
        res.status(200).json(response);
    })
    .catch( err => {
        res.status(500).json({
            status: false,
            message: err
        })
    })
}

exports.getUsers = (req, res, next) => {
    db.query('SELECT * FROM User')
    .then(([users, fields]) => {
        const response = {
            status: true,
            UserCount: users.length,
            users: users
        }
        res.status(200).json(response);
    })
    .catch( err => {
        res.status(500).json({
            status: false,
            message: err
        })
    })
}