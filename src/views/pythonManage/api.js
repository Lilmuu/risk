import request from '@/router/axios'

const base = '/mgr/risk'

// 数据源列表
export const getSecretList = () => {
  return request({
    url: base + `/api/secret/list`,
    method: 'get',
  })
}

//接口名称列表
export const getSearchList = (params) => {
  return request({
    url: base + `/api/info/search`,
    method: 'get',
    params
  })
}

//表格列表
export const getTableList = (params) => {
  return request({
    url: base + `/script/page`,
    method: 'get',
    params
  })
}

//新增列表
export const saveList = (data) => {
  return request({
    url: base + `/script/save`,
    method: 'post',
    data
  })
}

//删除列表
export const deleteList = (id) => {
  return request({
    url: base + `/script/del/${id}`,
    method: 'delete',
  })
}

//修改列表
export const editList = (data) => {
  return request({
    url: base + `/script/edit`,
    method: 'put',
    data
  })
}

//列表详情
export const detailList = (data) => {
  return request({
    url: base + `/script/detail/${data}`,
    method: 'get',
  })
}

//获取文档地址
export const getDocUrl = () => {
  return request({
    url: base + `/script/doc`,
    method: 'get',
  })
}