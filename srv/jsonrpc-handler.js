import axios from "axios";
import { listEntitySets } from "./tools/list.js";
import { read } from "./tools/read.js";
import { create } from "./tools/create.js";
import { update } from "./tools/update.js";
import { remove } from "./tools/delete.js";
import { query } from "./tools/query.js";

export async function handleJsonRpc(body, context) {
  const { id, method, params } = body;

  try {
    let result;

    switch (method) {
      case "listEntitySets":
        result = await listEntitySets(context);
        break;

      case "read":
        result = await read(context, params);
        break;

      case "create":
        result = await create(context, params);
        break;

      case "update":
        result = await update(context, params);
        break;

      case "remove":
        result = await remove(context, params);
        break;

      case "query":
        result = await query(context, params);
        break;

      default:
        throw new Error(`Unknown MCP method: ${method}`);
    }

    return {
      jsonrpc: "2.0",
      id,
      result
    };
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32001, message: err.message }
    };
  }
}
