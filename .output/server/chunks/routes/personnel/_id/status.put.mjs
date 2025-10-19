import { d as defineEventHandler, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const status_put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: body.status ? "\u542F\u7528\u6210\u529F" : "\u7981\u7528\u6210\u529F",
    data: {
      id,
      status: body.status
    }
  };
});

export { status_put as default };
//# sourceMappingURL=status.put.mjs.map
