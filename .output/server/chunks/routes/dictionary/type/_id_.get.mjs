import { d as defineEventHandler, g as getRouterParam } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    id: Number(id),
    typeName: "\u7528\u6237\u6027\u522B",
    typeCode: "user_gender",
    description: "\u7528\u6237\u6027\u522B\u5B57\u5178",
    status: 1,
    sort: 1,
    createTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime(),
    updateTime: (/* @__PURE__ */ new Date("2024-01-01 10:00:00")).getTime()
  };
  return {
    code: 200,
    message: "success",
    data: mockData
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
