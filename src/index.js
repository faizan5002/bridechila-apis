// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./firebase');

const app = express();
const port = 9000;

app.use(cors());
app.use(bodyParser.json());

// View all user profiles
app.get('/users', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    if (snapshot.empty) {
      res.status(404).send('No users found');
      return;
    }
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// View a specific user profile by userId
app.get('/users/:id', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const doc = await userRef.get();
    if (!doc.exists) {
      res.status(404).send('User not found');
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Search users by name
app.get('/search', async (req, res) => {
  console.log("init")
  const query = req.body.name || '';
  console.log(query);
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('name', '>=', query).where('name', '<=', query + '\uf8ff').get();
    if (snapshot.empty) {
      res.status(404).send('No users found');
      return;
    }
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Edit a user profile
app.put('/users/:id', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.params.id);
    await userRef.update(req.body);
    res.send('User updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Activate or deactivate a user account
app.patch('/users/:id/status', async (req, res) => {
  const { isActive } = req.body;
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const user = await userRef.get();
    if (!user.exists) {
      res.status(404).send('User not found');
      return;
    }
    await userRef.update({ accDeactivated: !isActive });
    res.send('User status updated');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Get all active user accounts
app.get('/activeAccounts', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('conAccApproved', '==', true).get();
    if (snapshot.empty) {
      res.status(404).send('No active users found');
      return;
    }
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Get all inactive user accounts
app.get('/inactiveAccounts', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('conAccApproved', '==', false).get();
    if (snapshot.empty) {
      res.status(404).send('No inactive users found');
      return;
    }
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Activate a user account
app.patch('/activate/:id', async (req, res) => {
  console.log("Got the hit ");
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const user = await userRef.get();
    if (!user.exists) {
      res.status(404).send('User not found');
      return;
    }
    await userRef.update({ conAccApproved: true });
    res.send('User account activated');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
// Deactivate a user account
app.patch('/deactivate/:id', async (req, res) => {
  console.log("Got the hit buddy")
  try {
    const userRef = db.collection('users').doc(req.params.id);
    const user = await userRef.get();
    if (!user.exists) {
      res.status(404).send('User not found');
      return;
    }
    await userRef.update({ conAccApproved: false });
    res.send('User account deactivated');
  } catch (error) {
    res.status(500).send(error.message);
  }
});
//get all service providers
app.get('/consultants', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'consultant').get();
    if (snapshot.empty) {
      res.status(404).send('No consultants found');
      return;
    }
    const consultants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(consultants);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get('/totalConsultants', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'consultant').get();
    const totalConsultants = snapshot.size;

    res.json({ totalConsultants });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get('/totalActiveusers', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('conAccApproved', '==', true).get();
    const totalActiveUsers = snapshot.size;

    res.json({ totalActiveUsers });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get('/totalInactiveUsers', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('conAccApproved', '==', false).get();
    const totalInactiveUsers = snapshot.size;

    res.json({ totalInactiveUsers });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get('/totalCustomers', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'customer').get();
    const totalCustomers = snapshot.size;

    res.json({ totalCustomers });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
app.get('/usersWithBalance', async (req, res) => {
  try {
    // Step 1: Fetch all documents from the 'wallets' collection
    const balanceSnapshot = await db.collection('wallets').get();
    
    if (balanceSnapshot.empty) {
      return res.status(404).json({ message: 'No balance records found' });
    }

    // Extract user IDs from the balance documents
    const userIds = balanceSnapshot.docs.map(doc => doc.id);

    // Step 2: Fetch user details for these IDs
    const userPromises = userIds.map(userId => db.collection('users').doc(userId).get());
    const userDocs = await Promise.all(userPromises);

    // Create a map of user IDs to available balances
    const balanceMap = balanceSnapshot.docs.reduce((map, doc) => {
      map[doc.id] = doc.data().availableBalance;
      return map;
    }, {});

    // Collect user data
    const users = userDocs
      .filter(doc => doc.exists)
      .map(doc => {
        const userData = doc.data();
        return {
          name: userData.name || 'N/A',
          role: userData.role || 'N/A',
          phoneNumber: userData.phoneNumber || 'N/A',
          availableBalance: balanceMap[doc.id] || 'N/A'
        };
      });

    res.json(users);

  } catch (error) {
    console.error('Error fetching users with balance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(port, () => {
  console.log(`Server running at Port:${port}`);
});
