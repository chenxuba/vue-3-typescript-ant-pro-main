import { d as defineEventHandler, g as getRouterParam } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__delete = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  return {
    code: 200,
    message: "\u5220\u9664\u6210\u529F",
    data: {
      id: Number(id)
    }
  };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
