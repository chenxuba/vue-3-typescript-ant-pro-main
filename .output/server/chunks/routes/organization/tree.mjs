import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const tree = defineEventHandler(() => {
  return [
    {
      id: "1",
      name: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      code: "241711",
      parentId: null,
      parentName: "\u4E2D\u56FD\u79D1\u5B66\u9662",
      isActive: true,
      order: 0,
      isIndependentTraining: true,
      isVirtual: false,
      children: [
        {
          id: "1-1",
          name: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711001",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 1,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: "1-1-1",
              name: "\u515A\u7FA4\u529E\u516C\u5BA4",
              code: "241711001001",
              parentId: "1-1",
              parentName: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false
            }
          ]
        },
        {
          id: "1-2",
          name: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711002",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 2,
          isIndependentTraining: false,
          isVirtual: false
        },
        {
          id: "1-3",
          name: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
          code: "241711003",
          parentId: "1",
          parentName: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
          isActive: true,
          order: 3,
          isIndependentTraining: false,
          isVirtual: false,
          children: [
            {
              id: "1-3-1",
              name: "\u5E7F\u5DDE\u4E2D\u5FC3",
              code: "241711003001",
              parentId: "1-3",
              parentName: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 1,
              isIndependentTraining: false,
              isVirtual: false
            },
            {
              id: "1-3-2",
              name: "\u57FA\u5730\u529E\u516C\u5BA4",
              code: "241711003002",
              parentId: "1-3",
              parentName: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
              isActive: true,
              order: 2,
              isIndependentTraining: false,
              isVirtual: false
            }
          ]
        }
      ]
    }
  ];
});

export { tree as default };
//# sourceMappingURL=tree.mjs.map
