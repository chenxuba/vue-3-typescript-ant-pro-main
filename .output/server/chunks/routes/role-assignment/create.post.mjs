import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  console.log("\u521B\u5EFA\u89D2\u8272\u5206\u914D:", body);
  return {
    code: 200,
    message: "\u89D2\u8272\u5206\u914D\u521B\u5EFA\u6210\u529F",
    data: {
      id: Date.now().toString(),
      ...body
    }
  };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
