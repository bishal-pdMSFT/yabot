import * as restify from "restify";
import { createClient } from 'redis';
import { commandApp } from "./internal/initialize";
import { TeamsBot } from "./teamsBot";


export const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();

// This template uses `restify` to serve HTTP responses.
// Create a restify server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\nApp Started, ${server.name} listening to ${server.url}`);
});

// Register an API endpoint with `restify`. Teams sends messages to your application
// through this endpoint.
//
// The Teams Toolkit bot registration configures the bot with `/api/messages` as the
// Bot Framework endpoint. If you customize this route, update the Bot registration
// in `templates/azure/provision/botservice.bicep`.
const teamsBot = new TeamsBot();
server.post("/api/messages", async (req, res) => {
  await commandApp.requestHandler(req, res, async (context) => {
    await teamsBot.run(context);
  });
});
