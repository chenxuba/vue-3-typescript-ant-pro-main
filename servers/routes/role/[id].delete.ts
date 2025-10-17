export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  // 模拟删除角色
  return {
    code: 200,
    message: '删除成功',
    data: { id },
  }
})

