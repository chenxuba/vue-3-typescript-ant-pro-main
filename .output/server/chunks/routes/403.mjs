import { e as eventHandler, s as setResponseStatus } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _403 = eventHandler((event) => {
  setResponseStatus(event, 403);
  return {
    code: 403,
    msg: "\u8BF7\u5148\u767B\u5F55"
  };
});

export { _403 as default };
//# sourceMappingURL=403.mjs.map
