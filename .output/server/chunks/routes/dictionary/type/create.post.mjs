import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
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
  return {
    code: 200,
    message: "\u521B\u5EFA\u6210\u529F",
    data: {
      id: Math.floor(Math.random() * 1e4),
      ...body,
      createTime: Date.now(),
      updateTime: Date.now()
    }
  };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
