
import request from '@/router/axios'

// 测试管理列表分页查询
export const testList = (params) => {
  return request({
      url: `/mgr/risk/package/page`,
      method: 'get',
      params: params
  })
}

// 获取风控包下配置的规则列表
export const ruleList = (projectId) => {
  return request({
      url: `/mgr/risk/test/parameter/${projectId}`,
      method: 'get'
  })
}

// 执行风控包校验数据(单条数据测试)
export const singleTest = (projectNo, data) => {
  return request({
      url: `/mgr/risk/test/single/${projectNo}`,
      method: 'post',
      data: data
  })
}

// 生成风控包对应的Excel模板
export const getTemplate = (packageId) => {
  return request({
      url: `/mgr/risk/package/excel/template/${packageId}`,
      method: 'get'
  })
}

// 获取测试结果
export const getResult = (no, params) => {
  return request({
      url: `/mgr/risk/test/page/${no}`,
      method: 'get',
      params: params
  })
}

// 测试日志
export const getLog = (projectNo, params) => {
  return request({
      url: `/mgr/risk/log/page/${projectNo}`,
      method: 'get',
      params: params
  })
}

// 日志列表
export const getLogList = (params) => {
  return request({
      url: `/mgr/risk/test/page/logs`,
      method: 'get',
      params: params
  })
}
