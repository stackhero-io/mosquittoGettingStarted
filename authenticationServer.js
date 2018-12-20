const express = require('express');
const bodyParser = require('body-parser');
const mqttWildcard = require('mqtt-wildcard');
const app = express();
app.use(bodyParser());
const port = 8080;

const users = [
  {
    login: 'testUser',
    password: 'testPassword',
    isSuper: false,
    acls: [
      {
        topic: 'users/testUser/#',
        permissions: [ 'read', 'write', 'subscribe' ] // Can be "read", "write" or "subscribe"
      },
      {
        topic: 'global',
        permissions: [ 'write', 'read', 'subscribe' ]
      }
    ]
  },
  {
    login: 'testUser2',
    password: 'testPassword2',
    isSuper: false,
    acls: [
      {
        topic: 'users/testUser2/#',
        permissions: [ 'read', 'write', 'subscribe' ] // Can be "read", "write" or "subscribe"
      },
      {
        topic: 'global',
        permissions: [ 'write', 'read', 'subscribe' ]
      }
    ]
  }
];


// Define POST route "/user"
// This route will be used to check the user login and password
app.post(
  '/user',
  (req, res) => {
    // Mosquitto sends us the username and the password
    const { username, password } = req.body;

    // We try to find the user
    const userFound = users.find(user => user.login === username && user.password === password);

    // We send a 200 if the authentication succeed or 401 else
    if (userFound) {
      return res.status(200).send();
    }
    else {
      console.warn(`⛔️ User ${username} doesn't exist or password is incorrect`);
      return res.status(401).send();
    }
  }
);


// Define POST route "/superUser"
// This route will be used to check if the user is a super user or not
app.post(
  '/superUser',
  (req, res) => {
    // Mosquitto sends us the username
    const { username } = req.body;

    // We try to find the user and check if he's a super user
    const userFound = users.find(user => user.login === username);

    // We send a 200 if he is a super user or 401 else
    if (userFound && userFound.isSuper) {
      return res.status(200).send();
    }
    else {
      return res.status(401).send();
    }
  }
);


// Define POST route "/acls"
// This route will be used to check the topic ACL
app.post(
  '/acls',
  (req, res) => {
    const { username, topic, clientId, acc } = req.body;

    // "acc" represents the type of access required by the client to this topic
    // - 1: read
    // - 2: write
    // - 3: read and write
    // - 4: subscribe

    const accToPermissions = {
      1: [ 'read' ],
      2: [ 'write' ],
      3: [ 'read', 'write' ],
      4: [ 'subscribe' ]
    }

    const allowed = users.find(user => {
      if (user.login !== username) {
        return false;
      }

      const aclValidated = user.acls.find(
        acl => mqttWildcard(topic, acl.topic) !== null
        && accToPermissions[acc].every(v => acl.permissions.includes(v))
      );
      return aclValidated;
    });

    if (allowed) {
      return res.status(200).send();
    }
    else {
      console.warn(`⛔️ Error when checking ACL for user ${username} on topic ${topic} with permission "${acc}"`);
      return res.status(401).send();
    }
  }
);



// Start Express server
const server = app.listen(port);

// You'll see this log directly on your Stackhero's console
console.log('🎉 The app has just start!');

// Handle termination signal
// When you'll push your code to Stackhero, we'll send a termination signal (SIGTERM).
// The goal is to let you close cleanly connections from Express, connections to databases etc...
process.on('SIGTERM', () => {
  // You'll see this log directly on your Stackhero's console
  console.info('😯 SIGTERM signal received.');

  // Close the server and all connections
  server.close(
    err => {
      if (err) {
        // You'll see this log directly on your Stackhero's console
        console.error(err);
        process.exit(1);
      }
      else {
        // You'll see this log directly on your Stackhero's console
        console.log('👋 Exit the app with status code 0');
        process.exit(0);
      }
    }
  );
});
