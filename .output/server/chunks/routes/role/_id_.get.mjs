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
  const mockRole = {
    id,
    roleName: "\u9879\u76EE\u7BA1\u7406\u5458",
    roleCode: "ROLE_001",
    isVirtualManagerRole: false,
    managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
    managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
    createTime: "2025-07-02 12:12:12",
    remark: "-",
    status: true
  };
  return {
    code: 200,
    message: "success",
    data: mockRole
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
