export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟创建成功
  return {
    code: 200,
    message: '创建成功',
    data: {
      id: Math.floor(Math.random() * 10000),
      ...body,
      createTime: Date.now(),
      updateTime: Date.now(),
    },
  }
})

