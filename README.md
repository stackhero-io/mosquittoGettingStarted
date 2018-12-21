# Getting started with Mosquitto

You'll find in this repository two applications.

The `client.js` is a MQTT client that will show you how to connect, publish and subscribe to a MQTT server.

The `authenticationServer.js` is an API written with Express that will allow you to handle MQTT users authentication in a simple and powerful way.

You'll get more informations about the API authentication on [Stackhero's documentation](https://www.stackhero.io/documentations/).

## The client

To use the client, you have to fill the file `.env-example` and rename the file `.env`.

Then simply run `npm run client`.


## The authentication server

The authentication server has to be accessible from your Mosquitto instance. It means that you can't run it directly on your computer.

The simplest way to run it is to create a Node.js service on Stackhero and push the example to it.

Here is the detailed procedure to do that in only 5 minutes.

### 1. Clone the app

On your computer, clone this project:

```
git clone https://github.com/stackhero-io/mosquittoGettingStarted.git
cd mosquittoGettingStarted
```

It's a good idea to check the `app.js` file content and change the default passwords, to avoid that someone connects to your Mosquitto server.


### 2. Create a Node.js service

In stackhero, create a Node.js service. You can select LTS or CURRENT version, both will work, but we recommend the LTS one.

Add your SSH public key in configuration and validate the configuration.


### 3. Deploy the app

From your Node.js service, in Stackhero's console, copy the `git remote command` and paste it to the cloned app directory (you'll have to do that only the first time).

Then, deploy the app: `git push -u stackhero`

If you want to change the `app.js` content, you'll have to commit the changes (`git add -A . && git commit -m WIP`) then redeploy your app with `git push -u stackhero`.


### 4. Configure your Mosquitto service

In Stackhero's console, on your Mosquitto's service configuration, enable `API authentication` and copy this configuration:
  - Host: put your Node.js endpoint domain `XXXXXX.stackhero-network.com`
  - Protocol: `HTTPS`
  - Port: `443`
  - User route: `/user`
  - Super user route: `/superUser`
  - ACLs route: `/acls`

Validate the configuration and voila! Your Mosquitto is now using this Node.js API to validate devices authentication and ACLs!

Note that if you defined users in your Mosquitto's service configuration, those users are still authorized too (but without ACLs rules).


You now have a way to handle devices authentication directly with an app.

You can now modify this code to check permissions, for example, in a database, letting you handle tons of devices in a dynamic way!

Enjoy your code!