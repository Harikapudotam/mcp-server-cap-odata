
// src/lib/normalizeToJsonRpc.js
import Ajv from "ajv";
import { RPC_SCHEMA } from "./rpcSchema.js";

const ajv = new Ajv({ allErrors: true });
const validateRpc = ajv.compile(RPC_SCHEMA);

/**
 * Normalize any input into canonical JSON-RPC for MCP.
 *
 * Accepted:
 *  - Strict JSON-RPC: { jsonrpc:"2.0", id, method, params }
 *  - Simple JSON:     { method, entity, payload, filters, sort, limit, offset }
 *  - Natural language: string (requires textParser)
 */
export async function normalizeToJsonRpc(input, opts = {}) {
  const {
    autoId = () => Date.now(),
    methodAliases = {
      get: "read",
      read: "read",
      list: "listEntitySets",
      listEntitySets: "listEntitySets",
      create: "create",
      insert: "create",
      add: "create",
      update: "update",
      modify: "update",
      delete: "remove",
      remove: "remove",
      del: "remove",
      query: "query",
      search: "query"
    },
    defaultParams = {
      payload: {},
      filters: { logic: "AND", conditions: [] }, // default to structured filters
      sort: [],
      limit: 0,
      offset: 0
    },
    textParser = null
  } = opts;

  if (typeof input === "string") {
    if (!textParser) throw new Error("Received natural-language text but no textParser provided.");
    const rpc = await textParser(input);
    ensureValid(rpc);
    return rpc;
  }

  if (isJsonRpc(input)) {
    const rpc = {
      jsonrpc: "2.0",
      id: input.id ?? autoId(),
      method: alias(methodAliases, input.method),
      params: normalizeParams(input.params, defaultParams)
    };
    ensureValid(rpc);
    return rpc;
  }

  if (isSimpleJson(input)) {
    const method = alias(methodAliases, input.method);
    const base = {
      jsonrpc: "2.0",
      id: autoId(),
      method
    };

    // Build method-specific params using the same structure your tools expect
    let params;
    switch (method) {
      case "create":
      case "update":
        params = {
          entity: input.entity,
          payload: input.payload ?? defaultParams.payload,
          ...(input.filters ? { filters: toStructuredFilters(input.filters) } : {})
        };
        break;

      case "remove":
        params = {
          entity: input.entity,
          filters: toStructuredFilters(input.filters ?? defaultParams.filters)
        };
        break;

      case "read":
      case "query":
        params = {
          entity: input.entity,
          ...(input.payload ? { payload: input.payload } : {}),
          filters: toStructuredFilters(input.filters ?? defaultParams.filters),
          sort: Array.isArray(input.sort) ? input.sort : defaultParams.sort,
          limit: Number.isFinite(input.limit) ? input.limit : defaultParams.limit,
          offset: Number.isFinite(input.offset) ? input.offset : defaultParams.offset
        };
        break;

      case "listEntitySets":
      default:
        params = {};
        break;
    }

    const rpc = { ...base, params };
    ensureValid(rpc);
    return rpc;
  }

  throw new Error("Unsupported input format: expected JSON-RPC, simple JSON, or natural-language text.");
}

/* ---------------- helpers ---------------- */
function isJsonRpc(obj) {
  return obj && typeof obj === "object" && obj.jsonrpc === "2.0" && "method" in obj && "params" in obj;
}
function isSimpleJson(obj) {
  return obj && typeof obj === "object" && "method" in obj && "entity" in obj;
}
function alias(aliases, m) {
  const s = String(m || "").trim();
  return aliases[s] || s;
}
function normalizeParams(params, defaults) {
  const p = params || {};
  // If filters provided as raw key-values, convert to structured
  const filters = p.filters
    ? toStructuredFilters(p.filters)
    : defaults.filters;

  return {
    entity: p.entity,
    payload: p.payload ?? defaults.payload,
    filters,
    sort: Array.isArray(p.sort) ? p.sort : defaults.sort,
    limit: Number.isFinite(p.limit) ? p.limit : defaults.limit,
    offset: Number.isFinite(p.offset) ? p.offset : defaults.offset
  };
}

/**
 * Converts raw filters into structured { logic, conditions } if needed.
 * If already structured, returns as-is.
 */
function toStructuredFilters(filters) {
  if (!filters || typeof filters !== "object") return { logic: "AND", conditions: [] };
  if (filters.logic && Array.isArray(filters.conditions)) return filters;

  // Convert flat object { field: value } → eq conditions
  const conditions = Object.entries(filters).map(([field, value]) => ({
    field,
    op: Array.isArray(value) ? "in" : "eq",
    value
  }));
  return { logic: "AND", conditions };
}

function ensureValid(rpc) {
  const ok = validateRpc(rpc);
  if (!ok) {
    const msg = (validateRpc.errors || [])
      .map(e => `${e.instancePath} ${e.message}`)
      .join("; ");
    throw new Error(`JSON-RPC validation failed: ${msg}`);
  }
}
