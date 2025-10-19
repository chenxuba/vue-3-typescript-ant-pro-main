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
  console.log("\u6279\u91CF\u5220\u9664\u89D2\u8272\u5206\u914D:", body.ids);
  return {
    code: 200,
    message: "\u6279\u91CF\u5220\u9664\u6210\u529F",
    data: null
  };
});

export { batchDelete_post as default };
//# sourceMappingURL=batch-delete.post.mjs.map
