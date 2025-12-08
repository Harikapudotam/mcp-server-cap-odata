// import https from "https";
// import express from "express";
// import axios from "axios";
// import dotenv from "dotenv";
// dotenv.config();

// import { handleJsonRpc } from "./srv/jsonrpc-handler.js";
// import { normalizeToJsonRpc } from "./srv/normalizeToJsonRpc.js";
// import { RPC_SCHEMA } from "./srv/rpcSchema.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// // Allow self-signed certificates
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });
// axios.defaults.httpsAgent = httpsAgent;
// const app = express();
// const port = process.env.PORT || 5000;

// // OData root
// let SERVICE_URL =
//   "https://org-build-build-ai-subaccount-build-materialrisk-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/MaterialSupplyPredictionService";

// if (!SERVICE_URL.endsWith("/")) SERVICE_URL += "/";

// // ENTITY LIST for NLP (if needed later)


// app.use(express.json({ limit: "4mb" }));

// // CORS
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

// // ✔ MCP handshake
// app.get("/mcp", (req, res) => {
//   res.json({
//     mcpVersion: "1.0",
//     name: "cap-odata-mcp",
//     version: "1.0.0",
//     description: "MCP server for CAP OData with CRUD + NLP",
//     tools: [
//       { name: "listEntitySets", description: "Returns all entity sets" },
//       { name: "read", description: "READ entity/collection" },
//       { name: "create", description: "CREATE new record" },
//       { name: "update", description: "UPDATE record" },
//       { name: "remove", description: "DELETE record" },
//       { name: "query", description: "NLP → JSON-RPC" }
//     ]
//   });
// });

// // ✔ JSON-RPC endpoint
// app.post("/mcp", async (req, res) => {
//   try {
//     const output = await handleJsonRpc(req.body, { serviceUrl: SERVICE_URL });
//     res.json(output);
//   } catch (e) {
//     console.error("❌ ERROR /mcp:", e);
//     res.json({
//       jsonrpc: "2.0",
//       id: req.body?.id || null,
//       error: { code: -32000, message: e.message }
//     });
//   }
// });

// app.post("/nlp", async (req, res) => {
//     try {
//         const { text } = req.body;

//         if (!text) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing 'text' in request body"
//             });
//         }
//        const ENTITIES = [
//   "MaterialSupplierMaster",
//   "MaterialPredictionResponse",
//   "RiskA_BusinessPartnerAddress",
//   "A_PurchasingSource",
//   "A_SupplierPurchasingOrg",
//   "A_Product",
//   "A_ProductPlant",
//   "A_ProductMLAccount",
//   "A_PurchaseOrder",
//   "A_MatlStkInAcctMod",
//   "A_ProductDescription"
// ];
        

//         const result = await processNLP(text, ENTITIES);

//         if (!result.success) {
//             return res.status(500).json(result);
//         }

//         const jsonrpc = toJsonRpc(result.nlp);

//         res.json({
//             success: true,
//             nlp: result.nlp,
//             jsonrpc
//         });

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             error: err.message
//         });
//     }
// });

// // Root
// app.get("/", (req, res) => {
//   res.send("MCP Server is running. Use POST /mcp or POST /nlp.");
// });

// // Start
// app.listen(port, () => {
//   console.log(`🚀 MCP server running on port ${port}`);
//   console.log(`🔗 OData Service: ${SERVICE_URL}`);
// });


import https from "https";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { handleJsonRpc } from "./srv/jsonrpc-handler.js";
import { normalizeToJsonRpc } from "./srv/normalizeToJsonRpc.js";
import { RPC_SCHEMA } from "./srv/rpcSchema.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ---------------- Gemini setup (Structured Outputs) ---------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// If you use Gemini 1.5 via JS SDK, uncomment apiVersion: 'v1beta'
const apiOptions = { /* apiVersion: "v1beta" */ };

/**
 * Natural-language → strict JSON-RPC via Gemini Structured Outputs.
 * Conforms to RPC_SCHEMA and forces pure JSON (no prose).
 */
async function geminiTextParser(text) {
  const model = genAI.getGenerativeModel({ model: MODEL }, { apiVersion: "v1beta" });

  
const instruction = `
You are a translator. Convert the user's natural-language request into EXACT JSON-RPC 2.0 for our MCP server.

Rules:
- Output ONLY JSON, no prose.
- Must include: jsonrpc "2.0", id (integer), method (one of: listEntitySets, read, create, update, remove, query).
- params: { entity, payload?, filters?, sort?, limit?, offset? }.
- For reads/queries/removes/updates, use filters.logic + filters.conditions with ops: eq, ne, lt, lte, gt, gte, in, contains.
- For create/update, put fields into params.payload.
`.trim();


  const generationConfig = {
    responseMimeType: "application/json", // ensures the response is pure JSON
    responseSchema: RPC_SCHEMA,           // Structured Outputs: enforce schema
    temperature: 0.2
  };

  const contents = [
    { role: "user", parts: [{ text: instruction }] },
    { role: "user", parts: [{ text }] }
  ];

  const result = await model.generateContent({ contents, generationConfig });
  const response = await result.response;

  const rpc = JSON.parse(response.text());
  // Guard: ensure envelope
  rpc.jsonrpc ??= "2.0";
  rpc.id ??= Date.now();
  return rpc;
}

/* ---------------- HTTPS agent / server setup ---------------- */
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.defaults.httpsAgent = httpsAgent;

const app = express();
const port = process.env.PORT || 5000;

/* ---------------- OData root ---------------- */
// let SERVICE_URL =
//   "https://org-build-build-ai-subaccount-build-materialrisk-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/MaterialSupplyPredictionService";
let SERVICE_URL =
  "https://services.odata.org/V4/Northwind/Northwind.svc";

if (!SERVICE_URL.endsWith("/")) SERVICE_URL += "/";

/* ---------------- Middleware ---------------- */
app.use(express.json({ limit: "4mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

/* ---------------- MCP handshake ---------------- */
app.get("/mcp", (req, res) => {
  res.json({
    mcpVersion: "1.0",
    name: "cap-odata-mcp",
    version: "1.0.0",
    description: "MCP server for CAP OData with CRUD + NLP",
    tools: [
      { name: "listEntitySets", description: "Returns all entity sets" },
      { name: "read", description: "READ entity/collection" },
      { name: "create", description: "CREATE new record" },
      { name: "update", description: "UPDATE record" },
      { name: "remove", description: "DELETE record" },
      { name: "query", description: "NLP → JSON-RPC" }
    ]
  });
});

/* ---------------- JSON-RPC endpoint ----------------
   Accept ANY format:
   - strict JSON-RPC
   - simple JSON { method, entity, payload, filters, sort, limit, offset }
   - natural language via { "text": "..." } or raw string
---------------------------------------------------- */
app.post("/mcp", async (req, res) => {
  try {
    const raw =
      req.body && typeof req.body === "object" && "text" in req.body
        ? req.body.text
        : req.body;

    // Normalize input and wire Gemini for NL text
    const normalized = await normalizeToJsonRpc(raw, { textParser: geminiTextParser });

    const output = await handleJsonRpc(normalized, { serviceUrl: SERVICE_URL });
    res.json(output);
  } catch (e) {
    console.error("❌ ERROR /mcp:", e);
    res.json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: { code: -32000, message: e.message }
    });
  }
});

/* ---------------- NLP endpoint (Optional helper) ----------------
   Converts free-text to JSON-RPC and also returns a simple JSON view.
------------------------------------------------------------------ */
app.post("/nlp", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Missing 'text' in request body"
      });
    }

    // Use Gemini to produce strict JSON-RPC per schema
    const jsonrpc = await geminiTextParser(text);

    // Also provide a simple method/entity/payload/filters view
    const simple = toSimpleFromRpc(jsonrpc);

    res.json({
      success: true,
      nlp: simple,
      jsonrpc
    });
  } catch (err) {
    console.error("❌ ERROR /nlp:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------------- Root ---------------- */
app.get("/", (req, res) => {
  res.send("MCP Server is running. Use POST /mcp or POST /nlp.");
});

/* ---------------- Start ---------------- */
app.listen(port, () => {
  console.log(`🚀 MCP server running on port ${port}`);
  console.log(`🔗 OData Service: ${SERVICE_URL}`);
});

/* ---------------- Helper: JSON-RPC → simple view ---------------- */
function toSimpleFromRpc(rpc) {
  const { method, params = {} } = rpc || {};
  const {
    entity,
    payload = {},
    filters = {},
    sort = [],
    limit = 0,
    offset = 0
  } = params;

  return { method, entity, payload, filters, sort, limit, offset };
}
