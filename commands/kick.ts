import { Command } from "discord.js-commando";
import { Message } from "discord.js";

export default class KickCommand extends Command {
  constructor(client) {
    super(client, {
      name: "kick",
      aliases: ["k"],
      group: "guild",
      memberName: "kick",
      description: "Kicks a user from the guild",
      guildOnly: true,
      clientPermissions: ["KICK_MEMBERS"],
      userPermissions: ["KICK_MEMBERS"],
      args: [
        {
          key: "user",
          prompt: "Which user do you want to kick?",
          type: "user",
        },
        {
          key: "reason",
          prompt: "What is the reason for kicking this user?",
          type: "string",
        },
      ],
    });
  }

  async run(message: Message, { user, reason }): Promise<Message> {
    const member = message.guild.member(user);

    if (member) {
      member.kick(reason);
      return message.channel.send(
        `${user.tag} has been kicked from the guild.`,
      );
    }

    return message.channel.send("User not found.");
  }
}
