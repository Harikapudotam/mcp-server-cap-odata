// import axios from "axios";

// export async function update({ serviceUrl }, { entity, key, data }) {
//   const url = `${serviceUrl}/${entity}(${key})`;
//   const res = await axios.patch(url, data);
//   return res.data;
// }
import axios from "axios";

export async function update({ serviceUrl }, params) {
  const { entity, key, payload } = params;
  const res = await axios.patch(`${serviceUrl}/${entity}(${key.ID})`, payload, {
    headers: { "Content-Type": "application/json" }
  });
  return res.data;
}
