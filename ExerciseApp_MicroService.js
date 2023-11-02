const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { DateTime } = require('luxon');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

const userSchema = new mongoose.Schema({
  username: String,
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  duration: Number,
  date: Date,
});

let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser.save((err, data) => {
    if (err) return console.error(err);
    res.json({ username: data.username, _id: data._id });
  });
});

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.error(err);
    res.json(data);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  User.findById(userId, (err, user) => {
    if (err) return console.error(err);

    let newExercise = new Exercise({
      userId: user._id,
      description: description,
      duration: duration,
      date: date ? new Date(date) : new Date(),
    });

    newExercise.save((err, exercise) => {
      if (err) return console.error(err);
      res.json({
        username: user.username,
        _id: user._id,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      });
    });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  User.findById(userId, (err, user) => {
    if (err) return console.error(err);

    const username = user.username;
    let filter = { userId: user._id };

    if (from || to) {
      filter.date = {};
      if (from) {
        filter.date.$gte = new Date(from);
      }
      if (to) {
        filter.date.$lte = new Date(to);
      }
    }

    Exercise.find(filter).limit(+limit || 0).exec((err, data) => {
      if (err) return console.error(err);
      const count = data.length;
      const log = data.map((item) => {
        return {
          description: item.description,
          duration: item.duration,
          date: item.date.toDateString(),
        };
      });

      res.json({
        username,
        count,
        _id: user._id,
        log,
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
