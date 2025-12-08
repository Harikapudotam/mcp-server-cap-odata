// export const RPC_SCHEMA = {
//   type: "object",
//   required: ["jsonrpc", "id", "method", "params"],
//   properties: {
//     jsonrpc: { const: "2.0" },
//     id: { oneOf: [{ type: "integer" }, { type: "string" }] },
//     method: {
//       type: "string",
//       enum: ["listEntitySets", "read", "create", "update", "remove", "query"]
//     },
//     params: {
//       oneOf: [
//         /* ---------- listEntitySets ---------- */
//         {
//           type: "object",
//           properties: {},
//           additionalProperties: true
//         },

//         /* ---------- read ---------- */
//         {
//           type: "object",
//           required: ["entity"],
//           properties: {
//             entity: { type: "string" },
//             payload: { type: "object", additionalProperties: true },
//             filters: {
//               type: "object",
//               properties: {
//                 logic: { type: "string", enum: ["AND", "OR"] },
//                 conditions: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["field", "op", "value"],
//                     properties: {
//                       field: { type: "string" },
//                       op: {
//                         type: "string",
//                         enum: ["eq","ne","lt","lte","gt","gte","in","contains"]
//                       },
//                       value: {
//                         oneOf: [
//                           { type: "string" },
//                           { type: "number" },
//                           { type: "boolean" },
//                           {
//                             type: "array",
//                             items: {
//                               oneOf: [
//                                 { type: "string" },
//                                 { type: "number" },
//                                 { type: "boolean" }
//                               ]
//                             }
//                           }
//                         ]
//                       }
//                     }
//                   }
//                 }
//               },
//               required: ["conditions"],
//               additionalProperties: false
//             },
//             sort: {
//               type: "array",
//               items: {
//                 type: "object",
//                 required: ["field","direction"],
//                 properties: {
//                   field: { type: "string" },
//                   direction: { type: "string", enum: ["asc","desc"] }
//                 }
//               }
//             },
//             limit: { type: "integer", minimum: 0 },
//             offset: { type: "integer", minimum: 0 }
//           },
//           additionalProperties: false
//         },

//         /* ---------- create ---------- */
//         {
//           type: "object",
//           required: ["entity", "payload"],
//           properties: {
//             entity: { type: "string" },
//             payload: { type: "object", additionalProperties: true }
//           },
//           additionalProperties: false
//         },

//         /* ---------- update ---------- */
//         {
//           type: "object",
//           required: ["entity", "payload"],
//           properties: {
//             entity: { type: "string" },
//             payload: { type: "object", additionalProperties: true },
//             filters: {
//               type: "object",
//               properties: {
//                 logic: { type: "string", enum: ["AND", "OR"] },
//                 conditions: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["field", "op", "value"],
//                     properties: {
//                       field: { type: "string" },
//                       op: {
//                         type: "string",
//                         enum: ["eq","ne","lt","lte","gt","gte","in","contains"]
//                       },
//                       value: {
//                         oneOf: [
//                           { type: "string" },
//                           { type: "number" },
//                           { type: "boolean" },
//                           {
//                             type: "array",
//                             items: {
//                               oneOf: [
//                                 { type: "string" },
//                                 { type: "number" },
//                                 { type: "boolean" }
//                               ]
//                             }
//                           }
//                         ]
//                       }
//                     }
//                   }
//                 }
//               },
//               required: ["conditions"],
//               additionalProperties: false
//             }
//           },
//           additionalProperties: false
//         },

//         /* ---------- remove ---------- */
//         {
//           type: "object",
//           required: ["entity", "filters"],
//           properties: {
//             entity: { type: "string" },
//             filters: {
//               type: "object",
//               properties: {
//                 logic: { type: "string", enum: ["AND", "OR"] },
//                 conditions: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["field", "op", "value"],
//                     properties: {
//                       field: { type: "string" },
//                       op: {
//                         type: "string",
//                         enum: ["eq","ne","lt","lte","gt","gte","in","contains"]
//                       },
//                       value: {
//                         oneOf: [
//                           { type: "string" },
//                           { type: "number" },
//                           { type: "boolean" },
//                           {
//                             type: "array",
//                             items: {
//                               oneOf: [
//                                 { type: "string" },
//                                 { type: "number" },
//                                 { type: "boolean" }
//                               ]
//                             }
//                           }
//                         ]
//                       }
//                     }
//                   }
//                 }
//               },
//               required: ["conditions"],
//               additionalProperties: false
//             }
//           },
//           additionalProperties: false
//         },

//         /* ---------- query ---------- */
//         {
//           type: "object",
//           required: ["entity"],
//           properties: {
//             entity: { type: "string" },
//             filters: {
//               type: "object",
//               properties: {
//                 logic: { type: "string", enum: ["AND", "OR"] },
//                 conditions: {
//                   type: "array",
//                   items: {
//                     type: "object",
//                     required: ["field", "op", "value"],
//                     properties: {
//                       field: { type: "string" },
//                       op: {
//                         type: "string",
//                         enum: ["eq","ne","lt","lte","gt","gte","in","contains"]
//                       },
//                       value: {
//                         oneOf: [
//                           { type: "string" },
//                           { type: "number" },
//                           { type: "boolean" },
//                           {
//                             type: "array",
//                             items: {
//                               oneOf: [
//                                 { type: "string" },
//                                 { type: "number" },
//                                 { type: "boolean" }
//                               ]
//                             }
//                           }
//                         ]
//                       }
//                     }
//                   }
//                 }
//               },
//               required: ["conditions"],
//               additionalProperties: false
//             },
//             sort: {
//               type: "array",
//               items: {
//                 type: "object",
//                 required: ["field","direction"],
//                 properties: {
//                   field: { type: "string" },
//                   direction: { type: "string", enum: ["asc","desc"] }
//                 }
//               }
//             },
//             limit: { type: "integer", minimum: 0 },
//             offset: { type: "integer", minimum: 0 }
//           },
//           additionalProperties: false
//         }
//       ]
//     }
//   },
//   additionalProperties: false
// };


// srv/rpcSchema.js
export const RPC_SCHEMA = {
  type: "object",
  required: ["jsonrpc", "id", "method", "params"],
  properties: {
    // use enum instead of 'const'
    jsonrpc: { type: "string", enum: ["2.0"] },
    // Gemini accepts number or string ids; no 'additionalProperties' here
    id: { oneOf: [{ type: "integer" }, { type: "string" }] },

    method: {
      type: "string",
      enum: ["listEntitySets", "read", "create", "update", "remove", "query"]
    },

    // keep params flexible; we’ll validate strictly on the server with AJV
    params: {
      type: "object",
      properties: {
        entity: { type: "string" },

        payload: {
          type: "object"
          // omit 'additionalProperties' here
        },

        filters: {
          type: "object",
          properties: {
            logic: { type: "string", enum: ["AND", "OR"] },
            conditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  op: {
                    type: "string",
                    enum: ["eq", "ne", "lt", "lte", "gt", "gte", "in", "contains"]
                  },
                  value: {
                    oneOf: [
                      { type: "string" },
                      { type: "number" },
                      { type: "boolean" },
                      {
                        type: "array",
                        items: {
                          oneOf: [
                            { type: "string" },
                            { type: "number" },
                            { type: "boolean" }
                          ]
                        }
                      }
                    ]
                  }
                },
                required: ["field", "op", "value"]
              }
            }
          }
        },

        sort: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string" },
              direction: { type: "string", enum: ["asc", "desc"] }
            },
            required: ["field", "direction"]
          }
        },

        limit: { type: "integer", minimum: 0 },
        offset: { type: "integer", minimum: 0 }
      },
      // don’t add 'additionalProperties' here
      // don’t use 'oneOf' here (conditional method-specific requirements)
      required: ["entity"] // base requirement only
    }
  }
  // no 'additionalProperties' at the root either
};
