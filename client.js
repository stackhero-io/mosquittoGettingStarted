require('dotenv').config()
const mqtt = require('mqtt');

if (!process.env.MOSQUITTO_SERVER) {
  throw Error('You should first fill the .env-example file and rename it to .env');
}

// Connection to MQTT server
const client = mqtt.connect(
  'mqtts://' + process.env.MOSQUITTO_SERVER,
  {
    username: process.env.MOSQUITTO_USERNAME,
    password: process.env.MOSQUITTO_PASSWORD,
    clean: true
  }
);


// This callback will be executed when a message is received on topics you subscribed (see client.subscribe below)
client.on('message', (topic, message) => {
  // message is Buffer
  console.log(`[${topic}]: ${message.toString()}`);
})


// Fired when connection to MQTT is done
client.on('connect', () => {

  // We subscribe to the topic "global"
  client.subscribe('global', (err, granted) => {
    if (err) { throw err; }

    if (granted.find(({ qos }) => qos === 128)) {
      throw Error(`Permission error when subscribing: ${JSON.stringify(granted)}`);
    }
  });


  // We publish to the topic "global"
  client.publish('global', 'Hello everyone!', { qos: 2 }, err => {
    if (err) { throw err; }
  });


  // We publish to as user topic
  client.publish('users/testUser/sensor1', '123', { qos: 2 }, err => {
    if (err) { throw err; }
  });

  // Note: we can publish to a topic without "write" rights. MQTT will ignore the message without informing us.
})
