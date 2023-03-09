<template>
  <PageHeader :title="'变量绑定'" style="padding: 0 30px">
    <div class="band-box">
      <zebra-table
        :loading="loading"
        :option="option"
        :data="tableData"
        :page="page"
        @on-load="getList"
      >
        <template slot="bindStatus" slot-scope="scope">
          <span>{{ scope.row.bindStatus ? '已绑定' : '未绑定' }}</span>
        </template>
        <template slot="menu" slot-scope="scope">
          <zebra-button type="text" size="mini" @click="handleBand(scope.row, scope.index)">绑定</zebra-button>
        </template>
      </zebra-table>
<!--      <zebra-button style="position: fixed;top: 20px;right: 20px" size="mini" @click="handleBack">返回</zebra-button>-->
      <div style="position: absolute; right: 20px; top: 20px">
        <i class="el-icon-close close-icon" @click="handleBack"/>
      </div>
    </div>
    <el-dialog
      title="选择变量"
      width="70%"
      top="5vh"
      :visible.sync="dialogVisible"
      :before-close="handleClose">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="变量名称">
          <el-input size="mini" v-model="queryParams.name" placeholder="请输入变量名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="mini" type="primary" @click="getVariableList">查询</el-button>
          <el-button size="mini" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div v-if="variableNo">
        <el-row :gutter="16">
          <el-col :span="8">
            <span>当前绑定变量：{{ variableData.name }}</span>
          </el-col>
          <el-col :span="16">
            <span style="margin-right: 24px">变量说明：{{ variableData.remark }}</span>
            <el-button size="mini" type="text" @click="handleDetail(variableData)" >详情</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table
        ref="variableTable"
        v-loading="variableLoading"
        :data="variableTable"
        @select="handleSelect"
        height="40vh"
        style="width: 100%">
        <el-table-column type="selection">
        </el-table-column>
        <el-table-column
          property="name"
          label="变量名称">
        </el-table-column>
        <el-table-column
          property="remark"
          label="变量说明"
          show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <zebra-button @click="handleDetail(scope.row, scope.index)" type="text" size="mini">详情</zebra-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        style="padding-top: 20px;text-align: right"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      class="no-header-dialog-variable variable-design"
      append-to-body
      v-if="designVisible"
      :visible.sync="designVisible"
      fullscreen
      :before-close="closeHandle"
    >
      <variableDesign ref="variableDesign" :rowData="rowData" @close="closeHandle" />
    </el-dialog>
  </PageHeader>
</template>

<script>
import PageHeader from "@/components/page-header/PageHeader";
import {getAllList} from "../policygroup/api";
import {ruleBindVar, variableByNo, variableList} from './api'
import VariableDesign from "../variablecenter/variable";
export default {
  name: "band",
  components: {VariableDesign, PageHeader},
  data() {
    return {
      dialogVisible: false,
      designVisible: false,
      queryParams: {
      },
      rowData: {},
      variableNo: '',
      variableData: {},
      loading: false,
      total: 0, // 总页数
      currentPage: 1, // 当前页数
      pageSize: 10, // 每页显示多少条
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
        layout: "total, sizes, prev, pager, next, jumper", // 分页工具
      },
      option: {
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        addBtn: false,
        page: true,
        column: [
          {
            label: "规则编号",
            prop: "no",
          },
          {
            label: "规则名称",
            prop: "name",
          },
          {
            label: "规则描述",
            prop: "description",
          },
          {
            label: "绑定状态",
            prop: "bindStatus",
            slot: true,
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
        ]
      },
      tableData: [],
      variableTable: [],
      variableLoading: false,
      currentRow: {},
      selectedRow: {},
      tempData: {},
      ruleNo: ''
    }
  },
  created() {
    if (JSON.stringify(this.$route.query) !== '{}') {
      const data = JSON.parse(JSON.stringify(this.$route.query))
      this.tempData = JSON.parse(JSON.stringify(this.$route.query))
      this.superNo = data.no
    } else {
    }
  },
  methods: {
    // 变量详情弹框关闭取消
    closeHandle () {
      this.getVariableList()
      this.designVisible = false
    },
    // 查看变量详情
    handleDetail(row, index) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.designVisible = true
    },
    // 关闭弹窗
    handleClose() {
      this.currentPage = 1
      this.pageSize = 10
      this.dialogVisible = false
    },
    // 确认
    handleConfirm() {
      if (!this.selectedRow.no) {
        this.$message.warning('请选择需要绑定的变量！')
        return false
      }
      const params = {
        ruleNo: this.ruleNo,
        varNo: this.selectedRow.no
      }
      ruleBindVar(params).then(res => {
        if (res.data && res.data.code == 0) {
          this.$message.success('绑定成功！')
          this.queryParams = {}
          this.getList()
        }
      })
      this.dialogVisible = false
    },
    // 变量绑定
    handleBand(row, index) {
      // if (row.bindStatus) {
      //   this.variableNo = row.variableNo
      // }
      this.variableNo = row.bindStatus ? row.variableNo : undefined
      this.ruleNo = row.no
      this.dialogVisible = true
      this.getVariableByNo()
      this.getVariableList()
    },
    // 根据no获取变量
    getVariableByNo() {
      if (this.variableNo) {
        variableByNo(this.variableNo).then(res => {
          if(res.data && res.data.code == 0) {
            this.variableData = JSON.parse(JSON.stringify(res.data.data))
            this.$forceUpdate()
          }
        }).catch(e => {
        })
      }
    },
    // 变量列表查询
    getVariableList() {
      this.variableLoading = true
      // 分页参数
      let obj = {
        current: this.currentPage,
        size: this.pageSize
      }
      variableList(Object.assign(obj, this.queryParams)).then(res => {
        if(res.data && res.data.code == 0) {
          this.variableTable = res.data.data.records
          this.variableTable.forEach(item => {
            if (item.no === this.variableNo) {
              setTimeout(() => {
                this.$refs.variableTable.toggleRowSelection(item);
              }, 0)
            }
          })
          this.total = res.data.data.total
          this.variableLoading = false
        }
      }).catch(e => {
        this.variableTable = []
      })
    },
    // 变量列表重置
    handleReset() {
      this.queryParams = {}
    },
    // 获取数据
    getList (page) {
      this.loading = true
      // 分页参数
      let obj = {
        current: this.page.currentPage,
        // size: this.page.pageSize,
        superNo: this.superNo,
        riskNodeType: 'RULE'
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
    handleSelect(val, row) {
      this.selectedRow = row
      this.$refs.variableTable.clearSelection() //用于多选表格，清空用户的选择
      this.variableTable.forEach(item => {
        if (item.no == row.no) {
          this.$refs.variableTable.toggleRowSelection(row , true)
        }
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageSize = val
      this.getVariableList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getVariableList()
      console.log(`当前页: ${val}`);
    },
    handleBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.band-box/deep/ {
  .close-icon {
    font-size: 16px;
    cursor: pointer;
  }
  .el-table .el-table__body-wrapper {
    height: calc(100vh - 200px)!important;
  }
}
/deep/.el-dialog__body{
  padding: 10px 20px;
  .el-table__header  .el-checkbox{  //找到表头那一行，然后把里面的复选框隐藏掉
    display:none !important
  }
}
</style>
