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
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "2",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "3",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "4",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    },
    {
      id: "5",
      userCode: "user001",
      userName: "\u5F20\u4E09",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u7CFB\u7EDF\u7BA1\u7406\u5458", "\u9879\u76EE\u534F\u8C03\u5458"],
      roleIds: ["2", "4"]
    },
    {
      id: "6",
      userCode: "user002",
      userName: "\u738B\u82B3",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u90E8\u95E8\u7BA1\u7406\u5458"],
      roleIds: ["3"]
    },
    {
      id: "7",
      userCode: "user003",
      userName: "\u8D75\u4E3D",
      organization: "\u8BA1\u7B97\u673A\u7F51\u7EDC\u4FE1\u606F\u4E2D\u5FC3",
      roles: ["\u5BA1\u6838\u5458", "\u5B66\u5458"],
      roleIds: ["5", "1"]
    },
    {
      id: "8",
      userCode: "user004",
      userName: "\u5B59\u6885",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B9E\u8BAD\u9879\u76EE\u7BA1\u7406\u5458"],
      roleIds: ["1"]
    },
    {
      id: "9",
      userCode: "user005",
      userName: "\u5468\u5F3A",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u90E8\u95E8\u7BA1\u7406\u5458", "\u5BA1\u6838\u5458"],
      roleIds: ["3", "5"]
    },
    {
      id: "10",
      userCode: "user006",
      userName: "\u5434\u9759",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    }
  ];
  const additionalData = [];
  for (let i = 11; i <= 123; i++) {
    additionalData.push({
      id: String(i),
      userCode: `ceshi123456`,
      userName: "\u674E\u6E05\u7167",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      roles: ["\u5B66\u5458"],
      roleIds: ["1"]
    });
  }
  const allData = [...mockData, ...additionalData];
  let filteredData = [...allData];
  if (body.userName) {
    filteredData = filteredData.filter(
      (item) => item.userName.includes(body.userName)
    );
  }
  if (body.roleName) {
    filteredData = filteredData.filter(
      (item) => item.roles.some((role) => role.includes(body.roleName))
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
