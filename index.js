import https from "https";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import { handleJsonRpc } from "./srv/jsonrpc-handler.js";
import { processNLP, toJsonRpc } from "./srv/nlp.js";

// Allow self-signed certificates
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
axios.defaults.httpsAgent = httpsAgent;

const app = express();
const port = process.env.PORT || 5000;

// OData root
let SERVICE_URL =
  "https://org-build-build-ai-subaccount-build-materialrisk-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/MaterialSupplyPredictionService";

if (!SERVICE_URL.endsWith("/")) SERVICE_URL += "/";

// ENTITY LIST for NLP (if needed later)


app.use(express.json({ limit: "4mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✔ MCP handshake
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

// ✔ JSON-RPC endpoint
app.post("/mcp", async (req, res) => {
  try {
    const output = await handleJsonRpc(req.body, { serviceUrl: SERVICE_URL });
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

app.post("/nlp", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Missing 'text' in request body"
            });
        }
       const ENTITIES = [
  "MaterialSupplierMaster",
  "MaterialPredictionResponse",
  "RiskA_BusinessPartnerAddress",
  "A_PurchasingSource",
  "A_SupplierPurchasingOrg",
  "A_Product",
  "A_ProductPlant",
  "A_ProductMLAccount",
  "A_PurchaseOrder",
  "A_MatlStkInAcctMod",
  "A_ProductDescription"
];
        

        const result = await processNLP(text, ENTITIES);

        if (!result.success) {
            return res.status(500).json(result);
        }

        const jsonrpc = toJsonRpc(result.nlp);

        res.json({
            success: true,
            nlp: result.nlp,
            jsonrpc
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Root
app.get("/", (req, res) => {
  res.send("MCP Server is running. Use POST /mcp or POST /nlp.");
});

// Start
app.listen(port, () => {
  console.log(`🚀 MCP server running on port ${port}`);
  console.log(`🔗 OData Service: ${SERVICE_URL}`);
});
