import { d as defineEventHandler, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const permissions_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  console.log("\u4FDD\u5B58\u89D2\u8272\u6743\u9650:", {
    roleId: id,
    permissions: body.permissions
  });
  return {
    code: 200,
    message: "\u6743\u9650\u4FDD\u5B58\u6210\u529F",
    data: null
  };
});

export { permissions_post as default };
//# sourceMappingURL=permissions.post.mjs.map
