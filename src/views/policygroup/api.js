import request from '@/router/axios'

// 规则/规则集/规则分页查询
export const getAllList = (params) => {
  return request({
      url: `/mgr/risk/manage/all/list`,
      method: 'get',
      params: params
  })
}

// 获取规则类型
export const getStrategyType = (params) => {
  return request({
    url: `/mgr/risk/manage/strategy/type/list`,
    method: 'get',
    params: params
  })
}

// 根据规则集id 查询单条规则集
export const getStrategy = (strategyId) => {
  return request({
      url: `/mgr/risk/strategy/query/${strategyId}`,
      method: 'get'
  })
}

// 新增规则集
export const addStrategyGroup = (params) => {
  return request({
    url: `/mgr/risk/manage/strategy/group`,
    method: 'post',
    data: params
  })
}

// 修改规则集
export const editStrategyGroup = (params) => {
  return request({
    url: `/mgr/risk/manage/strategy/group`,
    method: 'put',
    data: params
  })
}

// 获取规则集已绑定的规则
export const getStrategyByNo = (params) => {
  return request({
    url: `/mgr/risk/manage/get/by/no`,
    method: 'post',
    data: params
  })
}


// 获取规则集的请求参数
export const ruleList = (no) => {
  return request({
    url: `/mgr/risk/test/parameter/${no}`,
    method: 'get'
  })
}

// 执行风控包校验数据(单条数据测试)
export const singleTest = (no, data) => {
  return request({
    url: `/mgr/risk/test/single/${no}`,
    method: 'post',
    data: data
  })
}
