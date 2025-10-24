import { d as defineEventHandler, g as getRouterParam } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const permissions_get = defineEventHandler(async (event) => {
  getRouterParam(event, "id");
  const mockPermissions = [
    "/dashboard",
    "/dashboard/analysis",
    "/system-management",
    "/system-management/organization-management",
    "/system-management/personnel-management"
  ];
  return {
    code: 200,
    message: "success",
    data: mockPermissions
  };
});

export { permissions_get as default };
//# sourceMappingURL=permissions.get.mjs.map
