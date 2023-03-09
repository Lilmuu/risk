import request from '@/router/axios'

// 项目分页查询
export const packageList = (params) => {
  return request({
      url: `/mgr/risk/project/page`,
      method: 'get',
      params: params
  })
}

// 添加项目
export const addPackage = (data) => {
  return request({
      url: `/mgr/risk/project`,
      method: 'post',
      data: data
  })
}

// 修改项目(阶段/名称)
export const editPackage = (data) => {
  return request({
      url: `/mgr/risk/project`,
      method: 'put',
      data: data
  })
}

// 根据Id删除项目
export const deletePackage = (id) => {
  return request({
      url: `/mgr/risk/project/${id}`,
      method: 'delete'
  })
}

// 获取风控阶段列表
export const getPhaseList = () => {
  return request({
      url: `/mgr/risk/project/phase/list`,
      method: 'get'
  })
}

// 启用  禁用
export const changeStatus = (id) => {
  return request({
      url: `/mgr/risk/project/enable/${id}`,
      method: 'put'
  })
}

// 风控核心设计左边树
export const packageLeftTree = (id) => {
  return request({
      url: `/mgr/risk/design/tree/${id}`,
      method: 'get'
  })
}

// 左边树添加
export const addTreeItem = (projectId, data, bool) => {
  return request({
      url: `/mgr/risk/design/save/${projectId}/${bool}`,
      method: 'post',
      data: data
  })
}

// 左侧树删除节点
export const deleteTreeItem = (type, id) => {
  return request({
      url: `/mgr/risk/design/delete/${type}/${id}`,
      method: 'delete'
  })
}

// 左侧树排序
export const sortTreeItem = (type, id, sort, idtow, sorttow) => {
  return request({
      url: `/mgr/risk/design/sort/${type}/${id}/${sort}/${idtow}/${sorttow}`,
      method: 'get'
  })
}

// 选择其他项目的风控包模型
export const selectOtherpackage = (projectId, modelId) => {
  return request({
      url: `/mgr/risk/design/model/choose/${projectId}/${modelId}`,
      method: 'get'
  })
}

// 修改节点
export const updateProject = (data) => {
  return request({
      url: `/mgr/risk/design/group`,
      method: 'put',
      data: data
  })
}


// 接口API参数搜索返回
export const searchkeyWord = (obj) => {
  return request({
      url: `/mgr/risk/design/search`,
      method: 'get',
      params: obj
  })
}


// 规则判断约束
export const constraint = () => {
  return request({
      url: `/mgr/risk/design/operator/constraint`,
      method: 'get'
  })
}


// 修改规则
export const editRule = (data) => {
  return request({
      url: `/mgr/risk/design/rule`,
      method: 'post',
      data: data
  })
}

// 其他项目风控模型
export const modelList = () => {
  return request({
      url: `/mgr/risk/design/model/list`,
      method: 'get'
  })
}

// 根据数据源获取用户
export const getAccountList = (secretName) => {
  return request({
      url: `/mgr/risk/api/secret/${secretName}`,
      method: 'get'
  })
}

// 获取判断符
export const getOprator = () => {
  return request({
      url: `/mgr/risk/design/operator`,
      method: 'get'
  })
}




// 删除规则集或者风控集
export const deleteStrategy = (strategyId, data) => {
  return request({
      url: `/mgr/risk/strategy/delete/${strategyId}`,
      method: 'delete',
      params: data
  })
}

// 删除规则
export const deleteRule = (ruleId, data) => {
  return request({
      url: `/mgr/risk/rule/delete/${ruleId}`,
      method: 'delete',
      params: data
  })
}

// 左侧树排序
export const sortFunction = (data) => {
  return request({
      url: `/mgr/risk/strategy/sort`,
      method: 'put',
      params: data
  })
}

