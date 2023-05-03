const { Client, Events, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  // TODO: replace
  setTimeout(() => {
    client.destroy();
  }, 500);
});

client.login("TOKEN");
