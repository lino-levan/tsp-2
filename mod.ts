import "std/dotenv/load.ts";
import { Client, Intents, Message } from "harmony";
import { OpenAI } from "openai";

import { codegen } from "./codegen/codegen.ts";

const openAI = new OpenAI(Deno.env.get("OPENAI_TOKEN")!);
const client = new Client();

async function isCommand(msg: Message) {
  const completion = (await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          `Answer with only yes or no. Is the following text a request:\n${msg.content}`,
      },
    ],
    maxTokens: 10,
  })).choices[0].message.content.toLowerCase();

  console.log(completion);

  return completion.includes("yes");
}

client.on("messageCreate", async (msg) => {
  if (msg.author.id === "1101212547291566260") return;

  const relevant = msg.mentions.users.has("1101212547291566260");

  if (!relevant) return;

  await msg.addReaction("👍");

  if (await isCommand(msg)) {
    if (await codegen(msg)) {
      const completion = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              `Respond to the following messages as if you were in a discord server. Write a short message about how you successfully were able to execute the following command`,
          },
          {
            role: "user",
            content: msg.content,
          },
        ],
      });

      await msg.channel.send(completion.choices[0].message);
    } else {
      const completion = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              `Respond to the following messages as if you were in a discord server. Write a short message about how you were not successfully able to execute the following command`,
          },
          {
            role: "user",
            content: `<@${msg.author.id}>: ${msg.content}`,
          },
        ],
      });

      await msg.channel.send(completion.choices[0].message);
    }
    return;
  }

  await msg.channel.triggerTyping();

  const messages = (await msg.channel.fetchMessages({ limit: 10 })).array();

  const completion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          `Respond to the following messages as if you were in a discord server. You will speak in uwu speak. You go by the name of '${
            msg.guild
              ? (await msg.guild?.me()).displayName
              : "The Secret Police 2"
          }'.`,
      },
      {
        role: "system",
        content:
          `You are in the <#${msg.channelID}> channel in this discord server. "${
            msg.guild
              ? `The name of the discord server is ${msg.guild.name}.`
              : `You are dming the user <@${msg.author.id}>.`
          }".`,
      },
      {
        role: "user",
        content: msg.content,
      },
      ...messages.map((message) => ({
        role: msg.author.id === client.user?.id ? "assistant" : "user",
        content: message.content,
      })).reverse(),
    ],
    maxTokens: 200,
  });

  await msg.channel.send(completion.choices[0].message);
});

client.connect(Deno.env.get("BOT_TOKEN"), Intents.None);
