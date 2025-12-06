// import axios from "axios";

// export async function remove({ serviceUrl }, { entity, key }) {
//   const url = `${serviceUrl}/${entity}(${key})`;
//   const res = await axios.delete(url);
//   return { deleted: true };
// }

import axios from "axios";

export async function remove({ serviceUrl }, params) {
  const { entity, key } = params;
  const res = await axios.delete(`${serviceUrl}/${entity}(${key.ID})`);
  return res.data;
}
