import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const test_post = eventHandler(() => {
  return {
    code: 200,
    msg: "post"
  };
});

export { test_post as default };
//# sourceMappingURL=test.post.mjs.map
