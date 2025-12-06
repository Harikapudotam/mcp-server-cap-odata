// import axios from "axios";

// export async function read({ serviceUrl }, { entity, key, query }) {
//   const url =
//     key
//       ? `${serviceUrl}/${entity}(${key})`
//       : `${serviceUrl}/${entity}`;

//   const res = await axios.get(url, { params: query || {} });
//   return res.data;
// }
import axios from "axios";

export async function read({ serviceUrl }, params) {
  const { entity, key, filter, top } = params;

  let url = `${serviceUrl}/${entity}`;
  if (key) url += `(${key.ID})`;
  const query = [];
  if (filter) query.push(`$filter=${encodeURIComponent(filter)}`);
  if (top) query.push(`$top=${top}`);
  if (query.length) url += "?" + query.join("&");

  const res = await axios.get(url, { headers: { "Content-Type": "application/json" } });
  return res.data;
}
