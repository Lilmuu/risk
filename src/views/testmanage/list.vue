<template>
  <!-- 测试管理 -->
  <div class="test-manage-list">
    <zebra-table pageheadertitle="测试管理" :loading="loading" :formData="queryParams" :defaultFormData="queryParams" :option="option" :data="tableData" @on-load="getList" @search-change="searchChange" @addRow="addRowHandle" @editRow="editRowHandle">
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="testHandle(scope.row, scope.index)">测试</zebra-button>
      </template>
    </zebra-table>
    <!-- 测试 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose">
      <infoForm :rowData="rowData" />
    </el-dialog>
  </div>
</template>
<script>
import infoForm from './info'
import {testList} from './api'
export default {
  name: 'test-manage-list',
  components: {infoForm},
  data(){
    return {
      tableData: [{id: 4}],
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
        viewBtn: true,
        viewBtnText: '详情',
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
            label: '测试编号',
            prop: 'code',
            search: true
          },
          {
            label: '项目名称',
            prop: 'projectname',
            search: true
          },
          {
            label: '风控类型',
            prop: 'riskType',
            type: 'select',
            dicData: [
              {label: '专家模型', value: 'EXPERT_MODEL'},
              {label: '评分表', value: 'EVALUATION_FORM'}
            ]
          },
          {
            label: '测试状态',
            prop: 'status',
            search: true,
          },
          {
            label: '创建时间',
            prop: 'createtime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
          },
          {
            label: '备注',
            prop: 'remark',
          },
        ]
      },
      dialogVisible: false,
      rowData: {}, // 行数据
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
      // testList(temp).then(res => {
      //   if(res.data.code == 0) {
      //     this.tableData = res.data.data.records
      //     this.page.currentPage = res.data.data.current
      //     this.page.total = res.data.data.total
      //   }
      // })
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
    testHandle (row, index) {
      this.rowData = row
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