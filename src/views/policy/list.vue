<template>
  <!-- 规则管理 -->
  <div class="policy-list">
    <zebra-table
      pageheadertitle="规则管理"
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
        <zebra-button type="primary " size="mini" @click="handleAdd">新增规则</zebra-button>
      </template>
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="handleEdit(scope.row, scope.index)">修改</zebra-button>
        <zebra-button type="text" size="mini" @click="handleView(scope.row, scope.index)">查看</zebra-button>
        <zebra-button type="text" size="mini" @click="handleDelete(scope.row, scope.index)">删除</zebra-button>
        <zebra-button type="text" size="mini" @click="handleBand(scope.row, scope.index)">变量绑定</zebra-button>
      </template>
    </zebra-table>
  </div>
</template>
<script>
import {getAllList, getStrategyType} from "../policygroup/api";
import {deleteNode} from "./api";

export default {
  name: 'policy-list',
  components: {},
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
            label: '编号',
            prop: 'no',
          },
          {
            label: '规则名称',
            prop: 'name',
            search: true
          },
          {
            label: '规则类型',
            prop: 'strategyType',
            search: true,
            span: 4,
            type: 'select',
            clearable: true,
            dicUrl: '/mgr/risk/manage/strategy/type/list',
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
      detailInfo: {}
    }
  },
  methods: {
    //   获取数据
    getList (page) {
      this.loading = true
      // 分页参数
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize,
        riskNodeType: 'STRATEGY'
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
    // 新增规则
    handleAdd() {
      this.$router.push({ path: 'policyAdd' })
    },
    // 编辑规则
    handleEdit(row, index) {
      this.$router.push({ path: 'policyAdd', query: row })
    },
    // 删除规则
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
    // 变量绑定
    handleBand(row, index) {
      this.$router.push({ path: 'variableBand', query: row })
    },
    // 查看规则
    handleView (row, index) {
      this.$router.push({ path: 'policySee', query: row })
    },
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
</style>
