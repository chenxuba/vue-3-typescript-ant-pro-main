export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // 模拟更新成功
  return {
    code: 200,
    message: '更新成功',
    data: {
      id: Number(id),
      ...body,
      updateTime: Date.now(),
    },
  }
})

