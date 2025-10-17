export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟批量删除角色分配
  console.log('批量删除角色分配:', body.ids)
  
  // 这里可以添加业务逻辑，如从数据库删除
  
  return {
    code: 200,
    message: '批量删除成功',
    data: null,
  }
})

