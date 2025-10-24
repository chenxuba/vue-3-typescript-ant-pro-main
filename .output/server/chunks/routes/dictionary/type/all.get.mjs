import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const all_get = defineEventHandler(async (event) => {
  const mockData = [
    {
      id: 1,
      typeName: "\u7528\u6237\u6027\u522B",
      typeCode: "user_gender",
      description: "\u7528\u6237\u6027\u522B\u5B57\u5178",
      status: 1,
      sort: 1,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 2,
      typeName: "\u7528\u6237\u72B6\u6001",
      typeCode: "user_status",
      description: "\u7528\u6237\u8D26\u53F7\u72B6\u6001",
      status: 1,
      sort: 2,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 3,
      typeName: "\u8BA2\u5355\u72B6\u6001",
      typeCode: "order_status",
      description: "\u8BA2\u5355\u72B6\u6001\u5B57\u5178",
      status: 1,
      sort: 3,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 4,
      typeName: "\u652F\u4ED8\u65B9\u5F0F",
      typeCode: "payment_method",
      description: "\u652F\u4ED8\u65B9\u5F0F\u5B57\u5178",
      status: 1,
      sort: 4,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    },
    {
      id: 5,
      typeName: "\u6570\u636E\u6743\u9650",
      typeCode: "data_permission",
      description: "\u6570\u636E\u6743\u9650\u8303\u56F4",
      status: 1,
      sort: 5,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    }
  ];
  return {
    code: 200,
    message: "success",
    data: mockData.filter((item) => item.status === 1)
  };
});

export { all_get as default };
//# sourceMappingURL=all.get.mjs.map
