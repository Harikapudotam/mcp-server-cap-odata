import axios from "axios";

export async function create({ serviceUrl }, params) {
  const { entity, payload } = params; // extract payload from JSON-RPC
  const res = await axios.post(`${serviceUrl}/${entity}`, payload, {
    headers: { "Content-Type": "application/json" } // ensure JSON
  });
  return res.data;
}
