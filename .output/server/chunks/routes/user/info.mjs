import { e as eventHandler, g as getHeader } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const info = eventHandler((event) => {
  const token = getHeader(event, "Authorization");
  const username = Buffer.from(token, "base64").toString("utf-8");
  if (!token) {
    return {
      code: 401,
      msg: "\u767B\u5F55\u5931\u6548"
    };
  }
  return {
    code: 200,
    msg: "\u83B7\u53D6\u6210\u529F",
    data: {
      id: 1,
      username,
      nickname: username === "admin" ? "\u7F51\u7EDC\u4E2D\u5FC3\u7BA1\u7406\u5458" : "\u666E\u901A\u7528\u6237",
      avatar: "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
      roles: username === "admin" ? ["ADMIN"] : ["USER"]
    }
  };
});

export { info as default };
//# sourceMappingURL=info.mjs.map
