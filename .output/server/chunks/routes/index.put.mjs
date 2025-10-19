import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const index_put = eventHandler(async (_event) => {
  return {
    code: 200,
    msg: "\u7F16\u8F91\u6210\u529F"
  };
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
