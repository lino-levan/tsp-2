const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  // TODO: replace
  setTimeout(() => {
    client.destroy();
  }, 500);
});

client.login("TOKEN");
