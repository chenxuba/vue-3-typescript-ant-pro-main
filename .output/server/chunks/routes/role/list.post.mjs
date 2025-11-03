import { d as defineEventHandler, r as readBody } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const list_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const mockData = [
    {
      id: "1",
      roleName: "\u9879\u76EE\u7BA1\u7406\u5458",
      roleCode: "ROLE_001",
      isVirtualManagerRole: false,
      managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
      managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      createTime: "2025-07-02 12:12:12",
      remark: "-",
      status: true
    },
    {
      id: "2",
      roleName: "\u7CFB\u7EDF\u7BA1\u7406\u5458",
      roleCode: "ROLE_002",
      isVirtualManagerRole: false,
      managementScopeType: "\u6240\u6709\u5355\u4F4D",
      managementScope: "\u5168\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u7CFB\u7EDF\u6700\u9AD8\u6743\u9650\u7BA1\u7406\u5458",
      status: true
    },
    {
      id: "3",
      roleName: "\u90E8\u95E8\u7BA1\u7406\u5458",
      roleCode: "ROLE_003",
      isVirtualManagerRole: false,
      managementScopeType: "\u672C\u5355\u4F4D",
      managementScope: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u8D1F\u8D23\u90E8\u95E8\u65E5\u5E38\u7BA1\u7406",
      status: true
    },
    {
      id: "4",
      roleName: "\u9879\u76EE\u534F\u8C03\u5458",
      roleCode: "ROLE_004",
      isVirtualManagerRole: true,
      managementScopeType: "\u672C\u5355\u4F4D\u53CA\u4E0B\u5C5E\u5355\u4F4D",
      managementScope: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      createTime: "2025-07-02 12:12:12",
      remark: "\u534F\u8C03\u9879\u76EE\u76F8\u5173\u4E8B\u52A1",
      status: false
    },
    {
      id: "5",
      roleName: "\u5BA1\u6838\u5458",
      roleCode: "ROLE_005",
      isVirtualManagerRole: false,
      managementScopeType: "\u6307\u5B9A\u5355\u4F4D",
      managementScope: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      createTime: "2025-07-02 12:12:12",
      remark: "\u8D1F\u8D23\u5BA1\u6838\u6D41\u7A0B",
      status: true
    }
  ];
  let filteredData = [...mockData];
  if (body.roleName) {
    filteredData = filteredData.filter(
      (item) => item.roleName.includes(body.roleName)
    );
  }
  const total = filteredData.length;
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 10;
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  return {
    code: 200,
    message: "success",
    data: {
      list: filteredData.slice(start, end),
      total
    }
  };
});

export { list_post as default };
//# sourceMappingURL=list.post.mjs.map
