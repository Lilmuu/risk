<template>
  <!-- 统计管理 -->
  <div class="statistics-manage-list">
    <zebra-table :loading="loading" :formData="queryParams" :defaultFormData="queryParams" :option="option" :data="tableData" @on-load="getList" @search-change="searchChange" @addRow="addRowHandle" @editRow="editRowHandle">
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="viewHandle(scope.row, scope.index)">详情</zebra-button>
      </template>
    </zebra-table>
    <!-- 详情 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose">
      <infoForm />
    </el-dialog>
  </div>
</template>
<script>
import infoForm from './info'
export default {
  name: 'statistics-manage-list',
  components: {infoForm},
  data(){
    return {
      tableData: [{}],
      loading: false,
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
      },
      option: {
        addBtn: false,
        searchBtnText: '查询',
        emptyBtn: false,
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
        search: true,
        formAlign: 'right',
        column: [
          {
            label: '编号',
            prop: 'code'
          },
          {
            label: '项目阶段',
            prop: 'stage'
          },
          {
            label: '项目名称',
            prop: 'projectname',
          },
          {
            label: '接口调用次数',
            prop: 'times',
          },
          {
            label: '通过率',
            prop: 'range',
          },
          {
            label: '费用',
            prop: 'fee',
          },
          {
            label: '更新时间',
            prop: 'updatetime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
          },
          {
            label: '产品编号',
            prop: 'productNo',
            search: true,
            hide: true
          },
          {
            label: '产品名称',
            prop: 'productname',
            search: true,
            hide: true
          },
          {
            label: '产品类型',
            prop: 'productType',
            search: true,
            hide: true
          },
        ]
      },
      dialogVisible: false
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
    viewHandle (row, index) {
      this.dialogVisible = true
    },
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
</style>