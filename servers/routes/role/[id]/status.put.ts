export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // 模拟更新角色状态
  return {
    code: 200,
    message: '状态更新成功',
    data: {
      id,
      status: body.status,
    },
  }
})

