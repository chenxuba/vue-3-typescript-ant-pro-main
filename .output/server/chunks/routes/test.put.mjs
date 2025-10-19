import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const test_put = eventHandler(() => {
  return {
    code: 200,
    msg: "put"
  };
});

export { test_put as default };
//# sourceMappingURL=test.put.mjs.map
