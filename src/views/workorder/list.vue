<template>
  <!-- 工单管理 -->
  <div class="work-order-list">
    <zebra-table :loading="loading" :formData="queryParams" :defaultFormData="queryParams" :option="option" :data="tableData" @on-load="getList" @search-change="searchChange" @addRow="addRowHandle" @editRow="editRowHandle">
    </zebra-table>
  </div>
</template>
<script>
export default {
  name: 'work-order-list',
  components: {},
  data(){
    return {
      tableData: [{}],
      loading: false,
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      option: {
        addBtnText: '添加',
        searchBtnText: '查询',
        emptyBtn: false,
        editBtnText: '修改',
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
        search: true,
        formAlign: 'right',
        column: [
          {
            label: '工单编号',
            prop: 'code',
            search: true,
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: '项目名称',
            prop: 'name',
            search: true
          },
          {
            label: '工单类型',
            prop: 'type',
          },
          {
            label: '工单',
            prop: 'type',
            search: true, // ??????????????????????????????
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '工单状态',
            prop: 'status',
            search: true,
            span: 4,
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '创建人',
            prop: 'creator',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '工单描述',
            prop: 'introduce',
          },
          {
            label: '创建时间',
            prop: 'createtime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false
          },
        ]
      }
    }
  },
  methods: {
    //   获取数据
    getList (page) {
      // 分页参数
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
    },
    /**
     * 搜索回调
     */
    searchChange (form) {
      this.queryParams = form
      this.page.currentPage = 1
      this.getList()
    },
    addRowHandle (form) {
      console.log(form)
    },
    editRowHandle (form) {
      console.log(form)
    },
  }
}
</script>
<style lang="scss">
.work-order-list{
  .search-form{
    .el-col-6:nth-last-of-type(1) {
      .el-form-item__content{
        text-align: left;
      }
    }
  }
}
</style>