export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟获取角色权限
  const mockPermissions = [
    '/dashboard',
    '/dashboard/analysis',
    '/system-management',
    '/system-management/organization-management',
    '/system-management/personnel-management',
  ]
  
  return {
    code: 200,
    message: 'success',
    data: mockPermissions,
  }
})

