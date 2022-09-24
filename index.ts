import Server from "./interfaces/server";
import Client from "./interfaces/client";
import { z } from "zod";
const server = new Server({
  tokenSecret: "test",
  port: 8080,
});
async function main() {
  await server.login();
  server.onConnection = async (client: Client) => {
    setInterval(async () => {
      try {
        let now = Date.now();
        await client.evaluate("return {hello = 1}", z.any());
        console.log(`finished in ${Date.now() - now}ms`);
      } catch (error) {
        console.error(error);
      }
    }, 3000);
  };
}
main();
