import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const logout = eventHandler(() => {
  return {
    code: 200,
    msg: "success"
  };
});

export { logout as default };
//# sourceMappingURL=logout.mjs.map
