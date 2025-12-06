// import axios from "axios";

// export async function query({ serviceUrl }, { entity, options }) {
//   const res = await axios.get(`${serviceUrl}/${entity}`, {
//     params: options
//   });
//   return res.data;
// }
import axios from "axios";

export async function query({ serviceUrl }, { entity, key, filter, top, skip, orderby, expand }) {
  try {
    let url = `${serviceUrl}/${entity}`;
    if (key) url += `(${key.ID})`;

    const params = {};
    if (filter) params.$filter = filter;
    if (top) params.$top = top;
    if (skip) params.$skip = skip;
    if (orderby) params.$orderby = orderby;
    if (expand) params.$expand = expand;

    const res = await axios.get(url, { params });
    return res.data;
  } catch (err) {
    throw new Error(`Query failed: ${err.message}`);
  }
}
