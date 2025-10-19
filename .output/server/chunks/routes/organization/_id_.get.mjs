import { d as defineEventHandler, a as getRouterParam } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const _id__get = defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const mockData = {
    "1": {
      id: "1",
      name: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      code: "241711",
      parentId: null,
      parentName: "\u4E2D\u56FD\u79D1\u5B66\u9662",
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false
    },
    "1-1": {
      id: "1-1",
      name: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      code: "241711001",
      parentId: "1",
      parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      isActive: true,
      order: 1,
      isIndependentTraining: false,
      isVirtual: false
    }
  };
  return mockData[id || "1"] || mockData["1"];
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
