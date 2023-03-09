<template>
  <!-- 规则集管理 -->
  <div class="policy-list">
    <zebra-table
      pageheadertitle="规则集管理"
      :page="page"
      :loading="loading"
      :formData="queryParams"
      :defaultFormData="queryParams"
      :option="option"
      :data="tableData"
      @on-load="getList"
      @search-change="searchChange"
      @addRow="addRowHandle"
      @editRow="editRowHandle"
    >
      <template slot="menuLeft" scope="scope">
        <zebra-button type="primary " size="mini" @click="handleAdd">新增规则集</zebra-button>
      </template>
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="handleEdit(scope.row, scope.index)">修改</zebra-button>
        <zebra-button type="text" size="mini" @click="handleView(scope.row, scope.index)">查看</zebra-button>
        <zebra-button type="text" size="mini" @click="handleTest(scope.row, scope.index)">测试</zebra-button>
        <zebra-button type="text" size="mini" @click="handleDelete(scope.row, scope.index)">删除</zebra-button>
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
import {getAllList, getStrategyType} from "./api";
import {deleteNode} from "../policy/api";
import infoForm from './info'

export default {
  name: 'policy-group-list',
  components: { infoForm },
  data(){
    return {
      tableData: [],
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
        // search: true,
        formAlign: 'right',
        column: [
          {
            label: '规则编号',
            prop: 'no',
            search: true
          },
          {
            label: '规则集名称',
            prop: 'name',
            search: true
          },
          {
            label: '规则数量',
            prop: 'childrenSize',
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
            prop: 'remark',
          },
        ]
      },
      dialogVisible: false,
      detailInfo: {},
      rowData: {}, // 行数据
    }
  },
  created() {
    // getStrategyType().then(res => {
    //   console.log(res)
    // })
  },
  methods: {
    //   获取数据
    getList (page) {
      // 分页参数
      this.loading = true
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize,
        riskNodeType: 'STRATEGY_GROUP'
      }
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
      getAllList(temp).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          this.tableData = [...data.records]
          this.loading = false
          this.page.total = data.total
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
    handleAdd() {
      this.$router.push({ path: 'policyGroupAdd' })
    },
    handleEdit(row, index) {
      this.$router.push({ path: 'policyGroupAdd', query: row })
    },
    handleDelete(row, index) {
      const ids = []
      ids.push(row.id)
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNode(ids).then(res => {
          if (res.data && res.data.code == 0) {
            this.$message.success('删除成功！')
            this.getList()
          }
        })
      }).catch(() => {
      });
    },
    handleView (row, index) {
      this.$router.push({ path: 'policyGroupSee', query: row })
    },
    handleTest(row, index) {
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
