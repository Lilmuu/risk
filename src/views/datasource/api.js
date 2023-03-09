import request from '@/router/axios'

// 分页查询
export const accountList = (params) => {
  return request({
      url: `/mgr/risk/secret/page`,
      method: 'get',
      params: params
  })
}

// 保存账号
export const addAccount = (data) => {
  return request({
      url: `/mgr/risk/secret/save`,
      method: 'post',
      data: data
  })
}

// 修改项目名称/项目阶段
export const eidtAccount = (data) => {
  return request({
      url: `/mgr/risk/secret`,
      method: 'put',
      data: data
  })
}

// 删除凭证
export const deleteAccount = (id) => {
  return request({
      url: `/mgr/risk/secret/${id}`,
      method: 'delete'
  })
}

// 启用或禁用
export const enableAccount = (id) => {
  return request({
      url: `/mgr/risk/secret/enable/${id}`,
      method: 'put'
  })
}

// 账号配置信息
export const getAccountInfo = (id) => {
  return request({
      url: `/mgr/risk/secret/configuration/${id}`,
      method: 'get'
  })
}

// 接口信息
export const getApiInfo = (id) => {
  return request({
      url: `/mgr/risk/secret/api/${id}`,
      method: 'get'
  })
}

// 配置接口价格
export const configPrice = (id, data) => {
  return request({
      url: `/mgr/risk/secret/configuration/${id}`,
      method: 'post',
      data: data
  })
}

// 获取数据源
export const getDataSource = () => {
  return request({
      url: `/mgr/risk/api/secret/list`,
      method: 'get'
  })
}
