"use strict";

const UsersModel = require('./models/users.model');
const _ = require('lodash');
const config = require('./config');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

function checkAuth (req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
        if(jwtError != void(0) || err != void(0)) return res.render('chat.html', { error: err || jwtError});
        req.user = decryptToken;
        next();
    })(req, res, next);
}

function createToken (body) {
    return jwt.sign(
        body,
        config.jwt.secretOrKey,
        {expiresIn: config.expiresIn}
    );
}

module.exports = app => {
    app.use('/assets', express.static('./client/public'));

    app.get('/', (req, res) => {
        res.render('home.html');
    });

    app.get('/formularios', (req, res) => {
        res.render('formularios.html');
    });

    app.get('/chat', checkAuth, (req, res) => {
        res.render('chat.html', { username: req.user.username });
    });

    app.post('/login', async (req, res) => {
        try {
            let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();
            if(user != void(0) && bcrypt.compareSync(req.body.password, user.password)) {
                const token = createToken({id: user._id, username: user.username});
                res.cookie('token', token, {
                    httpOnly: true
                });

                res.status(200).send({message: "User login success."});
            } else res.status(400).send({message: "User not exist or password not correct"});
        } catch (e) {
            console.error("E, login,", e);
            res.status(500).send({message: "some error"});
        }
    });

    app.post('/register', async (req, res) => {
        try {
            let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();
            let email = await UsersModel.findOne({email: {$regex: _.escapeRegExp(req.body.email), $options: "i"}}).lean().exec();
            let nacimiento = await UsersModel.findOne({nacimiento: {$regex: _.escapeRegExp(req.body.nacimiento), $options: "i"}}).lean().exec();
            if(user != void(0)) return res.status(400).send({message: "Este nombre de usuario ya existe"});
            if(email != void(0)) return res.status(400).send({message: "Este email ya existe"});
            if(nacimiento != void(0)) return res.status(400).send({message: "Digite una fecha de nacimiento"});

            user = await UsersModel.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                nacimiento: req.body.nacimiento
            });

            const token = createToken({id: user._id, username: user.username});

            res.cookie('token', token, {
                httpOnly: true
            });

            res.status(200).send({message: "User created."});

        } catch (e) {
            console.error("E, register,", e);
            res.status(500).send({message: "some error"});
        }
    });

    app.post('/logout', (req, res) => {
        res.clearCookie('token');
        res.status(200).send({message: "Logout success."});
    })
};