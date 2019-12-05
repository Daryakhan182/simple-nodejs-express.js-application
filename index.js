const jsonwebtoken = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myfirstmongodb', { useNewUrlParser: true, useUnifiedTopology: true });
const express = require('express');
const app = express();

const Student = mongoose.model('Student', {
  name: String,
  student_id: Number,
  email: String,
  password: String,
  date_added: Date
});

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const Users = mongoose.model('Users', {
  name: String,
  email: String,
  password: String,
  date_added: Date
});

app.post('/signup', async (req, res) => {

  try {
    const body = req.body;

    // there must be a password in body

    // we follow these 2 steps

    const password = body.password;

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    body.password = hash;
    console.log('hash - > ', hash);
    const user = new Users(body);


    const result = await user.save();

    res.send({
      message: 'Student signup successful'
    });

  }

  catch (ex) {
    console.log('ex', ex)

    res.send({
      message: 'Error',
      detail: ex
    }).status(500);
  }

});

app.get('/students', async (req, res) => {

  const allStudents = await Student.find();
  console.log('allStudents', allStudents);

  res.send(allStudents);
});

app.post('/login', async (req, res) => {
  const body = req.body;
  console.log('req.body', body);

  const email = body.email;

  // lets check if email exists
  const result = await Users.findOne({ email: email });
  //const result = await Student.findOne({ "email": email });
  if (!result) // this means result is null
  {
    res.status(401).send({
      Error: 'This user doesnot exists. Please signup first'
    });
  }
  else {
    // email did exist
    // so lets match password

    //if (body.password === result.password) {

    if (bcrypt.compareSync(body.password, result.password)) {

      // great, allow this user access

      console.log('match');
      //using jwt tonkens
      delete result['password'];

      const token = jsonwebtoken.sign({
        data: body,
        role: 'User'
      }, 'supersecretToken', { expiresIn: '7d' });

      console.log('token -> ', token)

      res.send({ message: 'Successfully Logged in', token: token });
    }

    else {

      console.log('password doesnot match');

      res.status(401).send({ message: 'Wrong email or Password' });
    }


  }

});

app.get('/', (req, res) => {
  res.send('Welcome to my Node.js app');
});

app.get('*', (req, res) => {
  res.send('Page Doesnot exists');
});

app.listen(3000, () => {
  console.log('Express application running on localhost:3000');
});


