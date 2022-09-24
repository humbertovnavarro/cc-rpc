import Client from "../client";
import z from "zod";
import { sanitizeString, toLuaObject } from "../../utils/lua";
export default class ComputerCraftClient extends Client {
  async print(arg: string): Promise<number> {
    return await this.evaluate<number>(
      `return print("${sanitizeString(arg)}")`,
      z.number()
    );
  }
  term() {
    const clear = async () => {
      return await this.evaluate(`term.clear()`);
    };
    return {
      clear,
    };
  }
  os() {
    const computerID = async () => {
      return await this.evaluate<number>(`return os.computerID()`, z.number());
    };
    const time = async () => {
      return await this.evaluate<number>(`return os.time()`, z.number());
    };
    return {
      computerID,
      time,
    };
  }
  http() {
    const get = async (url: string, headers?: Map<string, string>) => {
      return await this.evaluate<string>(
        `return http.get(${sanitizeString(url)}${
          headers ? `,${toLuaObject(headers)}` : ""
        }).readAll()`
      );
    };
    return {
      get,
    };
  }
}
