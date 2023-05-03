import { Message } from "harmony";
import { OpenAI } from "openai";

const openAI = new OpenAI(Deno.env.get("OPENAI_TOKEN")!);
const textDecoder = new TextDecoder();

function run(command: string[]) {
  const result = new Deno.Command(command[0], {
    args: command.slice(1),
  }).outputSync();

  return result;
}

function setCode(file: string, code: string) {
  let toRun = Deno.readTextFileSync(file);
  toRun = toRun.replace('"TOKEN"', `"${Deno.env.get("BOT_TOKEN")}"`);
  toRun = toRun.replace("// TODO: replace", code);

  return toRun;
}

export async function codegen(msg: Message) {
  const completion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          `The guild is "${msg.guildID}". Generate code in discord.js to "${msg.content}". Do not include any explanation, only include code. Do not use a handler, assume the prompt is referring to the bot itself. Assume that the user has already set up the discord client.`,
      },
    ],
  });

  let code = completion.choices[0].message.content;
  const match = code.match(/```.*?\n(.+)\n```/gs);

  if (match) {
    console.log(match);
    code = match[1];
  }

  let toRun = setCode("./codegen/run14.js", code);
  Deno.writeTextFileSync("temp.js", toRun);

  run(["npm", "install", "discord.js@14"]);

  if (!run(["node", "temp.js"]).success) {
    toRun = setCode("./codegen/run12.js", code);
    Deno.writeTextFileSync("temp.js", toRun);

    run(["npm", "install", "discord.js@12"]);
    if (!run(["node", "temp.js"]).success) {
      return false;
    }
  }

  // Deno.removeSync("temp.js")

  return true;
}
