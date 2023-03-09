import request from '@/router/axios'

const base = '/mgr/risk'

// 事件管理列表
export const getEventsList = (params) => {
  return request({
    url: base + `/event/page`,
    method: 'get',
    params
  })
}

//事件状态集合
export const eventStatusData = () => {
  return request({
    url: base + `/event/dict`,
    method: 'get',
  })
}

// 删除
export const deleteTable = (data) => {
  return request({
    url: base + `/event/del/${data.id}`,
    method: 'delete',
  })
}

// 发布
export const releaseTable = (data) => {
  return request({
    url: base + `/event/deploy/${data.id}`,
    method: 'post',
    data
  })
}

// 下线
export const offline = (data) => {
  return request({
    url: base + `/event/offline/${data.id}`,
    method: 'post',
    data
  })
}

// 查看
export const tableDetail = (params) => {
  return request({
    url: base + `/event/detail`,
    method: 'get',
    params
  })
}

// 新增列表初始表格数据
export const getInitFieldList = () => {
  return request({
    url: base + `/field/lists`,
    method: 'get',
  })
}

// 新增列表初始表格数据
export const remoteSearch = (params) => {
  return request({
    url: base + `/field/search`,
    method: 'get',
    params
  })
}

// 字段类型下拉列表
export const dictListData = () => {
  return request({
    url: base + `/field/dict`,
    method: 'get',
  })
}

// 历史事件列表
export const historyRadioList = () => {
  return request({
    url: base + `/field/list`,
    method: 'get',
  })
}

// 历史事件表格数据
export const historyTableDetail = (params) => {
  return request({
    url: base + `/field/detail`,
    method: 'get',
    params
  })
}

// 提交并发布/暂存
export const submitOrTemp = (data) => {
  return request({
    url: base + `/event/temp/publish`,
    method: 'post',
    data
  })
}

// 检查是否重复
export const checkRepeat = (params) => {
  return request({
    url: base + `/field/check`,
    method: 'get',
    params
  })
}

// 事件导出
export const eventsExport = (params) => {
  return request({
    url: base + `/event/export/${params.id}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 决策流列表
export const strategyList = (data) => {
  return request({
    url: base + `/event/strategy/flow/page`,
    method: 'post',
    data
  })
}

// 返回参数
export const returnValue = () => {
  return request({
    url: base + `/event/returnValue`,
    method: 'get',
  })
}