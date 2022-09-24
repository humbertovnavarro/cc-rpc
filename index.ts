import Server from "./interfaces/server";
import { z } from "zod";
import ComputerCraftClient from "./interfaces/computer-craft-client";
const server = new Server({
  tokenSecret: "test",
  port: 8080,
});
async function main() {
  await server.login();
  server.onConnection = async (client: ComputerCraftClient) => {
    setInterval(async () => {
      try {
        console.log(await client.os().computerID());
        console.log(await client.os().time());
      } catch (error) {
        console.error(error);
      }
    }, 1000);
  };
}
main();
