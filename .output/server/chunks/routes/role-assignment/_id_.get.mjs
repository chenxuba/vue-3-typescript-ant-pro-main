import { d as defineEventHandler, g as getRouterParam } from '../../nitro/nitro.mjs';
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
    id,
    userCode: "ceshi123456",
    userName: "\u674E\u6E05\u7167",
    organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
    roles: ["\u5B66\u5458"],
    roleIds: ["1"]
  };
  return {
    code: 200,
    message: "success",
    data: mockData
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
