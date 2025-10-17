export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // 模拟批量删除角色
  return {
    code: 200,
    message: `成功删除 ${body.ids.length} 个角色`,
    data: { ids: body.ids },
  }
})

