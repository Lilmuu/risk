import request from '@/router/axios'

// 决策流分页查询
export const getProjectList = (params) => {
  return request({
    url: `/mgr/risk/project/page`,
    method: 'get',
    params: params
  })
}

// 新增决策流
export const addProject = (params) => {
  return request({
    url: `/mgr/risk/project`,
    method: 'post',
    data: params
  })
}

// 修改决策流
export const editProject = (params) => {
  return request({
    url: `/mgr/risk/project`,
    method: 'put',
    data: params
  })
}
// 发布到最新版
export const releaseProject = (params) => {
  return request({
    url: `/mgr/risk/project/release`,
    method: 'post',
    data: params
  })
}

// 根据id获取决策流
export const getProjectById = (id) => {
  return request({
    url: `/mgr/risk/project/${id}`,
    method: 'get',
    data: id
  })
}

// 决策流启用/停用
export const enableProject = (id,status) => {
  return request({
    url: `/mgr/risk/project/enable/${id}/${status}`,
    method: 'put',
    data: id
  })
}

// 删除决策流
export const deleteProject = (id) => {
  return request({
    url: `/mgr/risk/project/${id}`,
    method: 'delete',
    data: id
  })
}

// 获取决策流的请求参数
export const flowRuleList = (no) => {
  return request({
    url: `/mgr/risk/test/parameter/flow/${no}`,
    method: 'get'
  })
}

// 执行风控包校验数据(单条数据测试)
export const singleFlowTest = (no, data) => {
  return request({
    url: `/mgr/risk/test/single/flow/${no}`,
    headers: {
      isTest: true
    },
    method: 'post',
    data: data
  })
}

// 根据编号获取变量
export const getVariableByNo = (no) => {
  return request({
    url: `/mgr/risk/variable/var/byNo/${no}`,
    method: 'get',
    data: no
  })
}

// 决策流版本列表
export const getVersionList = (params) => {
  return request({
    url: `/mgr/risk/project/get/allVersion/byNo/${params}`,
    method: 'get',
    // params: params
  })
}

// 决策流版本选择
export const chooseVersion = (params) => {
  return request({
    url: `/mgr/risk/project/choose/default/version/${params}`,
    method: 'get',
    // params: params
  })
}

// 关联事件列表
export const eventData = () => {
  return request({
    url: `/mgr/risk/field/list`,
    method: 'get',
  })
}


// 更新决策流时判断该事件下是否有启用的
export const getBtnType = (params) => {
  return request({
    url: `/mgr/risk/project/checkEnable/${params}`,
    method: 'get',
  })
}

// 事件绑定的决策流启用停用
export const eventEnable = (id,status) => {
  return request({
    url: `/mgr/risk/project/event/enable/${id}/${status}`,
    method: 'put',
    data: id
  })
}