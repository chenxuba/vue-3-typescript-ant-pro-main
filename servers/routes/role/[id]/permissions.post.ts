export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // 模拟保存角色权限
  console.log('保存角色权限:', {
    roleId: id,
    permissions: body.permissions,
  })
  
  return {
    code: 200,
    message: '权限保存成功',
    data: null,
  }
})

