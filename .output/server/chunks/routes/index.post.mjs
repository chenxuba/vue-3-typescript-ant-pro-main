import { e as eventHandler, r as readBody } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const index_post = eventHandler(async (event) => {
  var _a, _b, _c;
  const body = await readBody(event);
  const dataList = [];
  for (let i = 0; i < 10; i++) {
    const item = {
      id: i + 1,
      title: `${(_a = body.title) != null ? _a : "\u6D4B\u8BD5"}_${i}`,
      username: `${(_b = body.username) != null ? _b : "test"}_${i}`,
      password: `${(_c = body.username) != null ? _c : "test"}_pass_${i}`
    };
    dataList.push(item);
  }
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: dataList
  };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
