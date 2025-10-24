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
  const mockPersonnel = {
    id,
    userCode: "ceshi123456",
    userName: "\u674E\u6E05\u7167",
    organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
    organizationId: "1-1",
    isNaturalPerson: true,
    phone: "13812345678",
    email: "ceshizhanghao@qq.com",
    status: true
  };
  return {
    code: 200,
    message: "success",
    data: mockPersonnel
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
