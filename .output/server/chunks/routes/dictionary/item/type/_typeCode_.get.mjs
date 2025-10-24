import { d as defineEventHandler, g as getRouterParam } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _typeCode__get = defineEventHandler(async (event) => {
  const typeCode = getRouterParam(event, "typeCode");
  const mockDataMap = {
    user_gender: [
      {
        id: 1,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u7537",
        value: "male",
        description: "\u7537\u6027",
        status: 1,
        sort: 1
      },
      {
        id: 2,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u5973",
        value: "female",
        description: "\u5973\u6027",
        status: 1,
        sort: 2
      }
    ],
    user_status: [
      {
        id: 4,
        typeId: 2,
        typeCode: "user_status",
        label: "\u6B63\u5E38",
        value: "active",
        description: "\u8D26\u53F7\u6B63\u5E38",
        status: 1,
        sort: 1
      },
      {
        id: 5,
        typeId: 2,
        typeCode: "user_status",
        label: "\u7981\u7528",
        value: "disabled",
        description: "\u8D26\u53F7\u5DF2\u7981\u7528",
        status: 1,
        sort: 2
      }
    ]
  };
  return {
    code: 200,
    message: "success",
    data: mockDataMap[typeCode || ""] || []
  };
});

export { _typeCode__get as default };
//# sourceMappingURL=_typeCode_.get.mjs.map
