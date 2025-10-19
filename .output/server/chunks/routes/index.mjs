import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const index = eventHandler(() => {
  return { nitro: "Hello Antdv Pro" };
});

export { index as default };
//# sourceMappingURL=index.mjs.map
