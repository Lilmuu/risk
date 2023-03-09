import request from '@/router/axios'

// 规则分页查询
export const ruleList = (params) => {
  return request({
      url: `/mgr/risk/rule/page`,
      method: 'get',
      params: params
  })
}

// 根据Id查询单条规则
export const getRule = (ruleId) => {
  return request({
      url: `/mgr/risk/rule/${ruleId}`,
      method: 'get'
  })
}