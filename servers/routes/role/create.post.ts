export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟创建角色
  return {
    code: 200,
    message: '创建成功',
    data: {
      id: Date.now().toString(),
      ...body,
      createTime: new Date().toISOString(),
      status: body.status !== undefined ? body.status : true,
    },
  }
})

