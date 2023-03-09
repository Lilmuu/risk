export const eventsListOption = {
  addBtn: false,
  searchBtnText: '查询',
  editBtn: false,
  delBtn: false,
  viewBtn: false,
  search: false,
  page: true,
  showOverflow: true,
  align: 'center',
  menuAlign: 'center',
  menuWidth: '120px',
  labelWidth: '90px',
  size: 'mini',
  inline: false,
  formAlign: 'right',
  column: [{
      label: '主键',
      prop: 'id',
    },
    {
      label: '创建时间',
      prop: 'createTime',
    },
    {
      label: '修改时间',
      prop: 'updateTime',
    },
    {
      label: '路径',
      prop: 'filePathNew',
    },
    {
      label: '文件类型',
      prop: 'fileUploadType',
      dicData:[
        {
            label:'代码文件',
            value:1
        },
        {
            label:'代码片段',
            value:2
        }
      ]
    },
    {
      label: '数据源名称',
      prop: 'shortName',
      dicUrl: '/mgr/risk/api/secret/list',
      dicData: [],
      props: {
        label: 'systemName',
        value: 'shortName'
      }
    },
    {
      label: '接口名称',
      prop: 'apiName',
    },
    {
      label: '函数名',
      prop: 'functionName',
    },
    {
      label: '函数说明',
      prop: 'functionInfo',
    },
    {
      label: '创建人',
      prop: 'createBy',
    },
    {
      label: '修改人',
      prop: 'updateBy',
    },
  ]
}

export const formOption = {
  inline: true,
  formAlign: 'right',
  isSearch: true,
  emptyBtn: true,
  submitBtnText: '查询',
  cancal: false,
  labelWidth: 'auto',
  column: [{
      label: "数据源",
      prop: "systemName",
      formSlot: true,
      span: 6
    },
    {
      label: '接口名称',
      prop: 'apiName',
      formSlot: true,
      span: 6
    },
    {
      label: '函数名',
      prop: 'functionName',
      span: 6
    },
    {
      label: '创建人',
      prop: 'createBy',
      span: 6
    },
    {
      label: '修改人',
      prop: 'updateBy',
      span: 6
    },
  ]
}

const host = window.location.host

export const previewUrl = process.env.NODE_ENV == "development" ? 'http://10.0.0.61:32251/' : host == 'zebra.sit.com' ? 'http://10.0.0.61:32251/' : host == 'dcode-test.cguarantee.com' ? 'http://192.168.190.52:31335/' : 'http://192.168.100.11:30160/'