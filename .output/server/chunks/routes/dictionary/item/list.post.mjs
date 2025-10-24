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
  const mockDataMap = {
    1: [
      // 用户性别
      {
        id: 1,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u7537",
        value: "male",
        description: "\u7537\u6027",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 2,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u5973",
        value: "female",
        description: "\u5973\u6027",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 3,
        typeId: 1,
        typeCode: "user_gender",
        label: "\u4FDD\u5BC6",
        value: "secret",
        description: "\u4FDD\u5BC6",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    2: [
      // 用户状态
      {
        id: 4,
        typeId: 2,
        typeCode: "user_status",
        label: "\u6B63\u5E38",
        value: "active",
        description: "\u8D26\u53F7\u6B63\u5E38",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 5,
        typeId: 2,
        typeCode: "user_status",
        label: "\u7981\u7528",
        value: "disabled",
        description: "\u8D26\u53F7\u5DF2\u7981\u7528",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 6,
        typeId: 2,
        typeCode: "user_status",
        label: "\u9501\u5B9A",
        value: "locked",
        description: "\u8D26\u53F7\u5DF2\u9501\u5B9A",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    3: [
      // 订单状态
      {
        id: 7,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5F85\u652F\u4ED8",
        value: "pending",
        description: "\u7B49\u5F85\u652F\u4ED8",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 8,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u652F\u4ED8",
        value: "paid",
        description: "\u5DF2\u5B8C\u6210\u652F\u4ED8",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 9,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u53D1\u8D27",
        value: "shipped",
        description: "\u5DF2\u53D1\u8D27",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 10,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u5B8C\u6210",
        value: "completed",
        description: "\u8BA2\u5355\u5DF2\u5B8C\u6210",
        status: 1,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 11,
        typeId: 3,
        typeCode: "order_status",
        label: "\u5DF2\u53D6\u6D88",
        value: "cancelled",
        description: "\u8BA2\u5355\u5DF2\u53D6\u6D88",
        status: 1,
        sort: 5,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    4: [
      // 支付方式
      {
        id: 12,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u5FAE\u4FE1\u652F\u4ED8",
        value: "wechat",
        description: "\u4F7F\u7528\u5FAE\u4FE1\u652F\u4ED8",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 13,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u652F\u4ED8\u5B9D",
        value: "alipay",
        description: "\u4F7F\u7528\u652F\u4ED8\u5B9D",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 14,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u94F6\u884C\u5361",
        value: "bank_card",
        description: "\u4F7F\u7528\u94F6\u884C\u5361\u652F\u4ED8",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 15,
        typeId: 4,
        typeCode: "payment_method",
        label: "\u73B0\u91D1",
        value: "cash",
        description: "\u73B0\u91D1\u652F\u4ED8",
        status: 0,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ],
    5: [
      // 数据权限
      {
        id: 16,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u5168\u90E8\u6570\u636E",
        value: "all",
        description: "\u53EF\u4EE5\u8BBF\u95EE\u6240\u6709\u6570\u636E",
        status: 1,
        sort: 1,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 17,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
        value: "org_and_sub",
        description: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D\u6570\u636E",
        status: 1,
        sort: 2,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 18,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u4EC5\u672C\u5355\u4F4D",
        value: "org_only",
        description: "\u4EC5\u672C\u5355\u4F4D\u6570\u636E",
        status: 1,
        sort: 3,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      },
      {
        id: 19,
        typeId: 5,
        typeCode: "data_permission",
        label: "\u4EC5\u672C\u4EBA",
        value: "self_only",
        description: "\u4EC5\u672C\u4EBA\u6570\u636E",
        status: 1,
        sort: 4,
        createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
        updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
      }
    ]
  };
  let filteredData = mockDataMap[body.typeId] || [];
  if (body.label) {
    filteredData = filteredData.filter(
      (item) => item.label.includes(body.label)
    );
  }
  if (body.value) {
    filteredData = filteredData.filter(
      (item) => item.value.includes(body.value)
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
