<template>
  <!-- 规则集管理 -->
  <div class="rule-manage-list">
    <zebra-table :page="page" :loading="loading" :formData="queryParams" :defaultFormData="queryParams" :option="option" :data="tableData" @on-load="getList" @search-change="searchChange" @addRow="addRowHandle" @editRow="editRowHandle">
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="viewHandle(scope.row, scope.index)">查看</zebra-button>
      </template>
    </zebra-table>
    <!-- 详情 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose">
      <infoForm :detailInfo="detailInfo" />
    </el-dialog>
  </div>
</template>
<script>
import {ruleList, getRule} from './api'
import infoForm from './info'
export default {
  name: 'rule-manage-list',
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
            label: '风控规则编号',
            prop: 'ruleNo',
            search: true
          },
          {
            label: '风控规则名称',
            prop: 'name',
            search: true
          },
          {
            label: '项目名称',
            prop: 'projectName', // ??????????????????????????
            search: true
          },
          {
            label: '类型',
            prop: 'type',
          },
          {
            label: '风控规则组状态',
            prop: 'ruleState',
            search: true,
            dicData: [
              {label: '启用', value: true},
              {label: '停用', value: false}
            ]
          },
          {
            label: '创建人',
            prop: 'createBy',
          },
          {
            label: '创建时间',
            prop: 'createTime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
          },
          {
            label: '备注',
            prop: 'note',
          },
        ]
      },
      dialogVisible: false,
      detailInfo: {}
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
      ruleList(temp).then(res => {
        if(res.data.code == 0) {
          this.tableData = res.data.data.records
          this.page.currentPage = res.data.data.current
          this.page.total = res.data.data.total
          console.log(this.page)
        }
      })
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
      console.log(row)
      getRule(row.id).then(res => {
        if(res.data.code == 0) {
          this.detailInfo = res.data.data
          this.dialogVisible = true
        }
      })
    },
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
</style>