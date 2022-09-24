import { sanitizeString, toLuaObject } from "./lua";
describe("sanitize-string", () => {
  test("does not mutate strings without escapes", () => {
    expect(sanitizeString("foo")).toBe("foo");
  });
  test("escapes new lines", () => {
    expect(sanitizeString("foo\\")).toBe("foo\\\\");
  });
});

describe("to-lua-object", () => {
  test("creates lua object with key string value string", () => {
    const test: Map<string, string> = new Map();
    test.set("foo", "bar");
    test.set("buzz", "bazz");
    const output = toLuaObject(test);
    expect(output).toBe(`{["foo"]="bar",["buzz"]="bazz"}`);
  });
  test("creates lua object with key number value string", () => {
    const test: Map<number, string> = new Map();
    test.set(17, "bar");
    test.set(3.5, "bazz");
    const output = toLuaObject(test);
    expect(output).toBe(`{[17]="bar",[3.5]="bazz"}`);
  });
  test("creates lua object with key number value boolean", () => {
    const test: Map<number, boolean> = new Map();
    test.set(17, true);
    test.set(3.5, false);
    const output = toLuaObject(test);
    expect(output).toBe(`{[17]=true,[3.5]=false}`);
  });
  test("creates lua object with key string value boolean", () => {
    const test: Map<string, boolean> = new Map();
    test.set("foo", true);
    test.set("buzz", false);
    const output = toLuaObject(test);
    expect(output).toBe(`{["foo"]=true,["buzz"]=false}`);
  });
});
