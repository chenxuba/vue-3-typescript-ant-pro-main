export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // 模拟更新状态
  return {
    code: 200,
    message: body.status ? '启用成功' : '禁用成功',
    data: {
      id,
      status: body.status,
    },
  }
})

