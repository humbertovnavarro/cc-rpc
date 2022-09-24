import { RawData, WebSocket } from "ws";
import type Server from "../server";
import z, { ZodSchema } from "zod";
import { v4 as uuidv4 } from "uuid";
const RUN_TASK_TIMEOUT = 5000;
const runTaskReceiptSchema = z.object({
  id: z.string(),
  payload: z.any(),
});

interface ClientOpts {
  socket: WebSocket;
  server: Server;
  id: string;
  debug?: boolean;
}

type RunTaskReceipt = typeof runTaskReceiptSchema._type;

export default class Client {
  runTasks: Map<string, (payload: RunTaskReceipt) => unknown> = new Map();
  id: string;
  socket: WebSocket;
  server: Server;
  ack: number;

  constructor(opts: ClientOpts) {
    this.socket = opts.socket;
    this.server = opts.server;
    this.id = opts.id;
    this.ack = Date.now();

    console.log(this.id + ": connected");

    this.socket.on("close", () => {
      console.log(`${this.id} : disconnected`);
      if (!this.id) return;
      this.server.clients.delete(this.id);
    });

    this.socket.on("message", async (data: RawData) => {
      const message = data.toString();
      this.ack = Date.now();
      if (message === "ping") {
        return;
      }
      try {
        const payload = JSON.parse(message);
        const parsedPayload = await runTaskReceiptSchema.parseAsync(payload);
        const runTask = this.runTasks.get(parsedPayload.id);
        if (runTask) {
          runTask(parsedPayload);
        } else {
          console.log("received orphaned packet from client");
        }
      } catch {
        console.error("malformed packet from client");
      }
    });
  }

  async evaluate<T>(lua: string, schema?: ZodSchema): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const taskID = uuidv4();
      const header = `-- ${taskID}`;
      if (!this.socket.OPEN) reject("socket closed");
      this.runTasks.set(taskID, (payload: RunTaskReceipt) => {
        if (schema) resolve(schema.parse(payload.payload));
        else resolve(payload.payload as T);
      });
      this.socket.send(`${header}\n${lua}`);
    });
  }
}
