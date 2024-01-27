const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set up initial data
db.defaults({ users: [] }).write();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Endpoint to handle saving/editing user data
app.post('/saveUser', (req, res) => {
  const { user, balance} = req.body;

  const existingUser = db.get('users').find({ user }).value();

  if (existingUser) {
    db.get('users').find({ user }).assign({ balance }).write();
    res.status(200).json({ resultCode: 1, message: 'User balance updated successfully!' });
    console.log(req.body)
  } else {
    db.get('users').push({ user, balance }).write();
    res.status(200).json({ resultCode: 1, message: 'New user added!' });
  }
});

// Endpoint to check user balance
app.get('/getUserBalance/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const user = db.get('users').find({ user: userId }).value();

  if (user) {
    res.status(200).json({ resultCode: 1, user: user.user, balance: user.balance });
  } else {
    res.status(200).json({ resultCode: 0, error: 'UserId not found' });
  }
});

// Endpoint to edit user balance
app.put('/editUserBalance/:userId', (req, res) => {
  const userId = req.params.userId;
  const { newBalance } = req.body;

  const user = db.get('users').find({ user: userId }).value();

  if (user) {
    db.get('users').find({ user: userId }).assign({ balance: newBalance }).write();
    res.status(200).json({ resultCode: 1, message: 'User balance updated successfully!' });
  } else {
    res.status(200).json({ resultCode: 0, error: 'User not found' });
  }
});

// Endpoint to deduct from user balance
app.put('/deductUserBalance/:userId', (req, res) => {
  const userId = req.params.userId;
  const { amountToDeduct } = req.body;

  const user = db.get('users').find({ user: userId }).value();

  if (user) {
    const currentBalance = parseFloat(user.balance);
    const amount = parseFloat(amountToDeduct);

    if (!isNaN(currentBalance) && !isNaN(amount)) {
      const newBalance = (currentBalance - amount).toFixed(2);

      if (newBalance >= 0) {
        db.get('users').find({ user: userId }).assign({ balance: newBalance.toString() }).write();
        res.status(200).json({ resultCode: 1, message: 'Deducted ' + amountToDeduct + ' from user balance', NewBalance: newBalance });
      } else {
        res.status(200).json({ resultCode: 0, error: 'Insufficient balance' });
      }
    } else {
      res.status(200).json({ resultCode: 0, error: 'Invalid amount' });
    }
  } else {
    res.status(200).json({ resultCode: 0, error: 'User not found' });
  }
});

// Endpoint to add to user balance
app.put('/addUserBalance/:userId', (req, res) => {
  const userId = req.params.userId;
  const { amountToAdd } = req.body;

  const user = db.get('users').find({ user: userId }).value();

  if (user) {
    const currentBalance = parseFloat(user.balance);
    const amount = parseFloat(amountToAdd);

    if (!isNaN(currentBalance) && !isNaN(amount)) {
      const newBalance = (currentBalance + amount).toFixed(2);
      db.get('users').find({ user: userId }).assign({ balance: newBalance.toString() }).write();
      res.status(200).json({ resultCode: 1, message: 'Added ' + amountToAdd + ' to user balance',  NewBalance:  newBalance});
    } else {
      res.status(200).json({ resultCode: 0, error: 'Invalid amount' });
    }
  } else {
    res.status(200).json({ resultCode: 0, error: 'User not found' });
  }
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
