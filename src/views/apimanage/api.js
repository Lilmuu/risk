import request from '@/router/axios'

// 接口分页查询
export const apiList = (params) => {
  return request({
      url: `/mgr/risk/api/info/search`,
      method: 'get',
      params: params
  })
}

// 查询接口的详情，入参，出参列表
export const apiDetail = (params) => {
  return request({
      url: `/mgr/risk/api/details`,
      method: 'get',
      params: params
  })
}

// 测试某个接口
export const testData = (apiName, id, data) => {
  return request({
      url: `/mgr/risk/api/api/test/${id}`,
      method: 'post',
      data: data,
      headers:{
        apiName: encodeURI(apiName)
      },
  })
}
