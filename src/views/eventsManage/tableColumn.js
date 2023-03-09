export const eventsListOption = {
    addBtn: false,
    searchBtnText: '查询',
    editBtn: false,
    delBtn:false,
    viewBtn: false,
    search: true,
    page: true,
    showOverflow: true,
    align: 'center',
    menuAlign: 'center',
    labelWidth: '90px',
    size: 'mini',
    inline: false,
    formAlign: 'right',
    column: [
        {
            label: '事件名称',
            prop: 'eventName',
            searchSpan:5,
            search: true
        },
        {
            label: '事件编码',
            prop: 'eventCode',
            searchSpan:5,
            search: true
        },
        {
            label: '事件状态',
            prop: 'eventStatus',
            search: true,
            searchSpan:5,
            type: 'select',
            clearable: true,
            dicUrl:'/mgr/risk/event/dict'
        },
        {
            label: '已配置决策流',
            prop: 'strategyNumber',
            slot: true,
        },
        {
            label: '更新时间',
            prop: 'updateTime',
            type:'datePicker',
            datetype: 'daterange',
            search: true,
            searchSpan:5,
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
        },
    ]
}


export const configureListOption = {
    addBtn: false,
    emptyBtn: false,
    editBtn: false,
    delBtn:false,
    viewBtn: false,
    search: false,
    page: true,
    showOverflow: true,
    align: 'center',
    menuAlign: 'center',
    labelWidth: '90px',
    size: 'mini',
    inline: false,
    menu:false,
    column: [
        {
            label: '决策流编号',
            prop: 'no',
        },
        {
            label: '决策流名称',
            prop: 'name',
        },
        {
            label: '决策流状态',
            prop: 'status',
            dicData:[
                {
                  value:0,
                  label:'停用'
                },
                {
                  value:1,
                  label:'启用'
                },
                {
                  value:2,
                  label:'验证中'
                },
            ]
        },
        {
            label: '更新时间',
            prop: 'updateTime',
        },
        {
            label: '备注',
            prop: 'remark',
        },
    ]
}

const noPagination = {
    addBtn: false,
    emptyBtn: false,
    editBtn: false,
    delBtn:false,
    viewBtn: false,
    search: false,
    page: false,
    showOverflow: true,
    align: 'center',
    menuAlign: 'center',
    size: 'mini',
    inline: false,
    column: [
        {
            label: '参数/中文名称',
            prop: 'paramsName',
            slot:true
        },
        {
            label: '字段类型',
            prop: 'fieldType',
            dicUrl:'/mgr/risk/field/dict'
        },
        {
            label: '是否必传',
            prop: 'fieldRequired',
            slot:true
        },
        {
            label: '最大长度',
            prop: 'fieldLength',
        },
        {
            label: '字段描述',
            prop: 'fieldDescribe',
        },
        {
            label: '字段来源',
            prop: 'fieldSource',
            dicData:[
                {
                    value:'1',
                    label:'系统字段'
                },
                {
                    value:'2',
                    label:'自定义字段'
                }
            ]
        },
    ]
}

export const tempListOption = {
    ...noPagination,
    menu:false
}

export const submitListOption = {
    ...noPagination
}

export const returnListOption = {
    ...noPagination,
    menu:false,
    column: [
        {
            label: '参数/中文名称',
            prop: 'paramsName',
            slot:true
        },
        {
            label: '字段类型',
            prop: 'fieldType',
            dicUrl:'/mgr/risk/field/dict'
        },
        {
            label: '字段描述',
            prop: 'fieldDescribe',
        },
    ]
}