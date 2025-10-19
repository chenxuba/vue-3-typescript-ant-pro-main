import { e as eventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const create_post = eventHandler(async (event) => {
  const body = await readBody(event);
  console.log(body);
  return {
    code: 200,
    msg: "\u521B\u5EFA\u6210\u529F"
  };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
