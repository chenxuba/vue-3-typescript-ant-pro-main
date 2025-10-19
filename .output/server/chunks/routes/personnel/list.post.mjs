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
  const mockPersonnelData = [
    {
      id: "1",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "2",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: false
    },
    {
      id: "3",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "4",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "5",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "13812345678",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "6",
      userCode: "ceshi123456",
      userName: "\u674E\u6E05\u7167",
      organization: "\u5927\u6570\u636E\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-1",
      isNaturalPerson: true,
      phone: "",
      email: "ceshizhanghao@qq.com",
      status: true
    },
    {
      id: "7",
      userCode: "test789012",
      userName: "\u738B\u7EF4",
      organization: "\u9AD8\u6027\u80FD\u8BA1\u7B97\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-2",
      isNaturalPerson: true,
      phone: "13987654321",
      email: "wangwei@qq.com",
      status: true
    },
    {
      id: "8",
      userCode: "test345678",
      userName: "\u675C\u752B",
      organization: "\u7BA1\u7406\u4FE1\u606F\u5316\u6280\u672F\u4E0E\u5E94\u7528\u53D1\u5C55\u90E8",
      organizationId: "1-3",
      isNaturalPerson: false,
      phone: "13765432109",
      email: "dufu@qq.com",
      status: true
    },
    {
      id: "9",
      userCode: "user111222",
      userName: "\u767D\u5C45\u6613",
      organization: "\u5E7F\u5DDE\u4E2D\u5FC3",
      organizationId: "1-3-1",
      isNaturalPerson: true,
      phone: "13654321098",
      email: "baijuyi@qq.com",
      status: false
    },
    {
      id: "10",
      userCode: "admin999888",
      userName: "\u674E\u767D",
      organization: "\u515A\u7FA4\u529E\u516C\u5BA4",
      organizationId: "1-1-1",
      isNaturalPerson: true,
      phone: "13543210987",
      email: "libai@qq.com",
      status: true
    }
  ];
  let filteredData = [...mockPersonnelData];
  if (body.organizationId) {
    filteredData = filteredData.filter((item) => item.organizationId === body.organizationId);
  }
  if (body.userCode) {
    filteredData = filteredData.filter(
      (item) => item.userCode.toLowerCase().includes(body.userCode.toLowerCase())
    );
  }
  if (body.userName) {
    filteredData = filteredData.filter(
      (item) => item.userName.includes(body.userName)
    );
  }
  if (body.organization) {
    filteredData = filteredData.filter(
      (item) => item.organization.includes(body.organization)
    );
  }
  const pageNum = body.pageNum || 1;
  const pageSize = body.pageSize || 10;
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  return {
    code: 200,
    message: "success",
    data: {
      list: paginatedData,
      total: filteredData.length
    }
  };
});

export { list_post as default };
//# sourceMappingURL=list.post.mjs.map
