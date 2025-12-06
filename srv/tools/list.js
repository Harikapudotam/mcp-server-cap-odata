import axios from "axios";
import xml2js from "xml2js";

export async function listEntitySets({ serviceUrl }) {
  const res = await axios.get(`${serviceUrl}/$metadata`);
  const parser = new xml2js.Parser();
  const xml = await parser.parseStringPromise(res.data);

  const schema = xml["edmx:Edmx"]["edmx:DataServices"][0].Schema[0];
  const sets = schema.EntityContainer[0].EntitySet.map(e => e.$.Name);

  return sets;
}
