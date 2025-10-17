export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟创建角色分配
  console.log('创建角色分配:', body)
  
  // 这里可以添加业务逻辑，如保存到数据库
  
  return {
    code: 200,
    message: '角色分配创建成功',
    data: {
      id: Date.now().toString(),
      ...body,
    },
  }
})

