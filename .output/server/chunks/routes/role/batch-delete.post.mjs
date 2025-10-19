import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const batchDelete_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    code: 200,
    message: `\u6210\u529F\u5220\u9664 ${body.ids.length} \u4E2A\u89D2\u8272`,
    data: { ids: body.ids }
  };
});

export { batchDelete_post as default };
//# sourceMappingURL=batch-delete.post.mjs.map
