import request from '@/router/axios'

// 变量分页查询
export const variableList = (params) => {
  return request({
      url: `/mgr/risk/variable/page`,
      method: 'get',
      params: params
  })
}

// 其他变量
export const otherVariableList = (params) => {
  return request({
      url: `/mgr/risk/variable/other/list`,
      method: 'get',
      params: params
  })
}

// 添加变量
export const addVariable = (data) => {
  return request({
      url: `/mgr/risk/variable`,
      method: 'post',
      data: data
  })
}

// 修改变量
export const editVariable = (data) => {
  return request({
      url: `/mgr/risk/variable`,
      method: 'put',
      data: data
  })
}

// 删除变量
export const delVariable = (params) => {
  return request({
      url: `/mgr/risk/variable`,
      method: 'delete',
      params: params
  })
}

// 绑定变量
export const bindVariable = (data) => {
  return request({
      url: `/mgr/risk/variable/bind`,
      method: 'put',
      data: data
  })
}

// 变量测试
export const testVariable = (data) => {
  return request({
      url: `/mgr/risk/variable/test`,
      method: 'post',
      data: data
  })
}

// 获取变量测试入参
export const getTestParams = (params) => {
  return request({
      url: `/mgr/risk/variable/test/params`,
      method: 'post',
      data: params
  })
}

// 获取函数列表
export const queryFunctionList = () => {
  return request({
      url: `/mgr/risk/variable/func/list`,
      method: 'get'
  })
}

// 规则绑定列表
export const bindVariableList = (id, params) => {
  return request({
      url: `/mgr/risk/variable/rule/${id}`,
      method: 'get',
      params: params
  })
}

// 获取接口出参
export const apiResParams = (params)=>{
  return request({
    url:'/mgr/risk/api/resParams',
    method:'get',
    params:params
  })
}

// 获取文档地址
export const getDocUrl = ()=>{
  return request({
    url:'/mgr/risk/variable/get/func/help/doc',
    method:'get',
  })
}

// 变量导出
export const exportVariable = (params)=>{
  return request({
    url:'/mgr/risk/variable/export',
    method:'get',
    params: params
  })
}

// 变量导入
export const importVariable = (params)=>{
  return request({
    url:'/mgr/risk/variable/import',
    method:'get',
    params: params
  })
}

// 事件中心入参列表
export const getEventsParamsList = (data)=>{
  return request({
    url:`/mgr/risk/event/field/${data}`,
    method:'get',
  })
}

// 事件中心事件名称
export const getEventsNamesList = ()=>{
  return request({
    url:`/mgr/risk/event/list`,
    method:'get',
  })
}

// python脚本列表
export const getPythonList = (data)=>{
  return request({
    url:`/mgr/risk/script/python`,
    method:'post',
    data
  })
}