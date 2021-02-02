const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema ({
    filename: String,
    title: String,
    category: String,
    venue: String,
    eventDate: String,
    date: {
        type: Date,
        default: new Date()
    },
    time: String,
    description: String,
    vip: String,
    regular: String
});

const Event = mongoose.model('Event', UserSchema);

module.exports = Event;