"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UsersSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    nacimiento: {type: String, required: true},
    addedAt: {type: Date, default: Date.now}
}, {
    versionKey: false,
    collection: "UsersCollection"
});

UsersSchema.pre('save', function(next) {
    if(this.isModified('password') || this.isNew()) this.password = bcrypt.hashSync(this.password, 12);
    next();
});

module.exports = mongoose.model('UsersModel', UsersSchema);