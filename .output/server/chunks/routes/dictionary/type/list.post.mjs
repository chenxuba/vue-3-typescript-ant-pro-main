import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const list_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
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
    },
    {
      id: 6,
      typeName: "\u901A\u77E5\u7C7B\u578B",
      typeCode: "notice_type",
      description: "\u7CFB\u7EDF\u901A\u77E5\u7C7B\u578B",
      status: 0,
      sort: 6,
      createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
      updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
    }
  ];
  let filteredData = [...mockData];
  if (body.typeName) {
    filteredData = filteredData.filter(
      (item) => item.typeName.includes(body.typeName)
    );
  }
  if (body.typeCode) {
    filteredData = filteredData.filter(
      (item) => item.typeCode.includes(body.typeCode)
    );
  }
  if (body.status !== void 0 && body.status !== null) {
    filteredData = filteredData.filter((item) => item.status === body.status);
  }
  if (body.orderbyFiled) {
    const [field, order] = body.orderbyFiled.split(":");
    filteredData.sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }
  const count = filteredData.length;
  const page = body.page || 1;
  const limit = body.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      count,
      page,
      limit
    }
  };
});

export { list_post as default };
//# sourceMappingURL=list.post.mjs.map
