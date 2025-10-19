import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const test_delete = eventHandler(() => {
  return {
    code: 200,
    msg: "delete"
  };
});

export { test_delete as default };
//# sourceMappingURL=test.delete.mjs.map
