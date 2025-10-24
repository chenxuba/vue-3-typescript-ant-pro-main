import { d as defineEventHandler, g as getRouterParam, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__put = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return {
    code: 200,
    message: "\u66F4\u65B0\u6210\u529F",
    data: {
      id,
      ...body
    }
  };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
