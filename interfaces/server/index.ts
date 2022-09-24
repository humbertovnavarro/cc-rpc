import { WebSocketServer, WebSocket as BaseWebSocket, RawData } from "ws";
import Client from "../client";
import jwt from "jsonwebtoken";
import ComputerCraftClient from "../computer-craft-client";

interface ServerOptions {
  port: number;
  tokenSecret: string;
  callback?: () => void;
}
const MAX_AUTH_TRIES = 5;

export default class Server {
  tokenSecret: string;
  clients: Map<string, ComputerCraftClient> = new Map();
  port: number;
  wss?: WebSocketServer;
  onConnection?: (client: ComputerCraftClient) => unknown;
  callback?: () => void;
  constructor(opts: ServerOptions) {
    this.tokenSecret = opts.tokenSecret;
    this.port = opts.port;
  }
  async login() {
    return new Promise((resolve) => {
      this.wss = new WebSocketServer(
        {
          port: this.port,
        },
        () => {
          resolve(undefined);
          this.callback?.();
        }
      );
      this.wss.on("connection", (socket, request) => {
        const authHeader = request.headers["authorization"];
        if (!authHeader) {
          socket.send("unauthorized");
          socket.close();
          return;
        }
        try {
          const jwtString = authHeader.slice(authHeader.indexOf(" ") + 1);
          const token = jwt.verify(
            jwtString,
            this.tokenSecret
          ) as jwt.JwtPayload;
          const id = token.sub || "anonymous";
          const client = new ComputerCraftClient({
            server: this,
            socket,
            debug: true,
            id,
          });
          if (this.clients.has(id)) {
            this.clients.get(id)?.socket.close();
          }
          this.clients.set(id, client);
          this.onConnection?.(client);
        } catch {
          socket.send("unauthorized");
          socket.close();
          return;
        }
      });
    });
  }
}
