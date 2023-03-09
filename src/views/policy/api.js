import request from '@/router/axios'

// 新增规则
export const addStrategy = (params) => {
  return request({
    url: `/mgr/risk/manage/strategy`,
    method: 'post',
    data: params
  })
}

// 修改规则
export const editStrategy = (params) => {
  return request({
    url: `/mgr/risk/manage/strategy`,
    method: 'put',
    data: params
  })
}

// 删除规则
export const deleteNode = (params) => {
  return request({
    url: `/mgr/risk/manage/node`,
    method: 'delete',
    data: params
  })
}

// 变量分页查询
export const variableList = (params) => {
  return request({
    url: `/mgr/risk/variable/page`,
    method: 'get',
    params: params
  })
}

// 规则绑定变量
export const ruleBindVar = (params) => {
  return request({
    url: `/mgr/risk/manage/binding/var/${params.ruleNo}/${params.varNo}`,
    method: 'put',
    data: params
  })
}

// 根据No获取变量
export const variableByNo = (no) => {
  return request({
    url: `/mgr/risk/variable/var/byNo/${no}`,
    method: 'get',
  })
}
// 根据id获取变量
export const variableById = (id) => {
  return request({
    url: `/mgr/risk/variable/var/byId/${id}`,
    method: 'get',
  })
}
