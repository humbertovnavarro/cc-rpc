export function sanitizeString(arg: string) {
  return arg.replace("\\", "\\\\");
}

export function toLuaObject(
  map: Map<string | number, string | number | boolean>
) {
  let obj = "{";
  let i = 0;
  map.forEach((v, k) => {
    i++;
    if (typeof k === "string") {
      obj += `["${sanitizeString(k)}"]=`;
    } else if (typeof k === "number") {
      obj += `[${k}]=`;
    }
    if (typeof v === "string") {
      obj += `"${sanitizeString(v)}"`;
    } else if (typeof v === "number") {
      obj += v;
    } else if (typeof v === "boolean") {
      obj += `${v ? "true" : "false"}`;
    }
    if (i != map.size) {
      obj += ",";
    }
  });
  obj += "}";
  return obj;
}
