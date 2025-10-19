import { e as eventHandler, s as setResponseStatus } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _500 = eventHandler((event) => {
  setResponseStatus(event, 500);
  return {
    code: 500,
    msg: "\u670D\u52A1\u5668\u9519\u8BEF"
  };
});

export { _500 as default };
//# sourceMappingURL=500.mjs.map
