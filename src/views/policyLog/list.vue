<template>
  <!-- 调用日志管理 -->
  <div class="policy-list">
    <zebra-table
      pageheadertitle="调用日志"
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
      <template slot="headerTop">
        <div class="table-query">
          <el-form size="mini" :inline="true" :model="queryParams" class="demo-form-inline">
            <el-form-item label="编号">
              <el-input v-model="queryParams.no" placeholder="编号"></el-input>
            </el-form-item>
            <el-form-item label="测试数据">
              <el-input v-model="queryParams.parameters" placeholder="测试数据"></el-input>
            </el-form-item>
            <el-form-item label="日志类型">
              <el-select v-model="queryParams.logType" placeholder="日志类型">
                <el-option label="规则集" value="STRATEGY_GROUP"></el-option>
                <el-option label="决策流" value="STRATEGY_FLOW"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="调用方">
              <el-input v-model="queryParams.applicationName" placeholder="调用方"></el-input>
            </el-form-item>
            <el-form-item label="事件名称">
              <el-input v-model="queryParams.eventName" placeholder="事件名称"></el-input>
            </el-form-item>
            <el-form-item label="决策流状态">
              <el-select v-model="queryParams.status" placeholder="决策流状态">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="getList('','reset')">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </template>
      <template slot="result" slot-scope="scope">
        {{ scope.row.result === 'true' ? '通过' : scope.row.result === 'false' ? '不通过' : scope.row.result }}
      </template>
      <template slot="logType" slot-scope="scope">
        {{ getLogType(scope.row.logType) }}
      </template>
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="viewDetail(scope.row, scope.index)">明细</zebra-button>
      </template>
    </zebra-table>
    <el-dialog
      v-if="viewVisible"
      append-to-body
      :visible.sync="viewVisible"
      fullscreen
      class="view-test-detail"
      :before-close="viewClose">
      <!--      <viewDetail :modelData="rowData" :rowData="testRow" />-->
      <detail :rowData="testRow" />
    </el-dialog>
    <el-dialog
      v-if="viewGroupVisible"
      title="规则集明细"
      append-to-body
      :visible.sync="viewGroupVisible"
      :before-close="viewClose">
      <el-table :data="detailData" height="400px">
        <el-table-column prop="nodeName" label="名称" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip></el-table-column>
        <el-table-column prop="result" label="结果" show-overflow-tooltip></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import {getAllList, getStrategyType} from "../policygroup/api";
import {getLog, getLogList} from "../testmanage/api";
import Detail from "../policyproject/detail";

const statusOptions = [
  {
    label:'停用',
    value:0
  },
  {
    label:'启用',
    value:1
  },
  {
    label:'验证中',
    value:2
  },
]
export default {
  name: 'policy-list',
  components: {Detail},
  data(){
    return {
      statusOptions,
      viewVisible: false, // 明细弹框
      viewGroupVisible: false,
      testRow: {}, // 测试结果行数据
      tableData: [],
      detailData: [],
      loading: false,
      queryParams: {
        applicationName: '',
        logType: '',
        no: '',
        parameters:'',
        eventName:'',
        status:''
      }, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
      },
      option: {
        addBtn: false,
        editBtn: false,
        viewBtn: false,
        search: true,
        delBtn: false,
        align: 'center',
        menuAlign: 'center',
        page: true,
        showOverflow: true,
        cancal: false,
        column: [
          {
            label: '测试结果编号',
            prop: 'no'
          },
          {
            label: '测试数据',
            prop: 'parameters'
          },
          {
            label: '测试结果',
            prop: 'result',
            slot: true
            // dicData: [
            //   {label: '通过', value: true},
            //   {label: '不通过', value: false}
            // ],
            // hide: this.rowData.riskType == 'EVALUATION_FORM'
          },
          {
            label: '日志类型',
            prop: 'logType',
            slot: true,
          },
          {
            label: '事件名称',
            prop: 'eventName',
          },
          {
            label: '项目名称',
            prop: 'projectName',
          },
          {
            label: '决策流版本',
            prop: 'projectVersion',
          },
          {
            label: '调用方名称',
            prop: 'applicationName',
          },
          {
            label: '操作人',
            prop: 'createBy',
          },
          // {
          //   label: '错误信息',
          //   prop: 'errorMsg',
          //   slot: true
          // },
          {
            label: '开始时间',
            prop: 'createTime'
          },
          {
            label: '结束时间',
            prop: 'finishTime'
          },
          {
            label: '消耗时间/ms',
            prop: 'consumingTime'
          },
          {
            label: '决策流状态',
            prop: 'status',
            dicData:statusOptions
          },
        ]
      },
      dialogVisible: false,
      detailInfo: {}
    }
  },
  methods: {
    // 获取日志类型
    getLogType(type) {
      if (type === 'STRATEGY_FLOW') {
        return '决策流'
      }
      if (type === 'STRATEGY_GROUP') {
        return '规则集'
      }
    },
    // 关闭明细
    viewClose () {
      this.viewVisible = false
      this.viewGroupVisible = false
    },
    // 查看明细
    viewDetail (row) {
      if (row.logType === 'STRATEGY_FLOW') {
        const tempData = JSON.parse(row.modelJson)
        const data = JSON.parse(JSON.stringify(tempData))
        const arr = []
        data.lineList.forEach(item => {
          const obj = {
            id: item.id,
            from: item.fromNo,
            to: item.toNo,
            data: JSON.parse(item.data),
            label: JSON.parse(item.data).label,
            // paintStyle: {stroke: 'red'}
          }
          if (item.executeStatus) {
            obj.paintStyle = { stroke: '#34e221' }
          }
          arr.push(obj)
        })
        data.lineList = [...arr]
        data.nodeList.forEach(item => {
          item.data = JSON.parse(item.data)
          console.log(item.data)
          item.viewOnly = true
          item.state = item.executeStatus ? 'success' : 'error'
          if (item.executeStatus && !item.ifExecutedWithoutError) {
            item.state = 'warning'
          }
        })
        this.testRow = data
        this.viewVisible = true
      } else {
        this.detailData = [...JSON.parse(row.reason)]
        this.viewGroupVisible = true
      }
    },
    //   获取数据
    handleReset() {
      this.queryParams = {
        applicationName: '',
        logType: '',
        no: ''
      }
    },
    getList (page,reset) {
      this.loading = true
      // 分页参数
      reset && (this.page.currentPage = 1)
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize,
      }
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
      getLogList(temp).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          this.tableData = [...data.records]
          this.loading = false
          this.page.total = data.total
        } else {
          this.loading = false
        }
      }).catch(err => {
        this.loading = false
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
  }
}
</script>
<style lang="scss" scoped>
.policy-list/deep/ {
  .table-query{
    padding: 20px 40px 0;
  }
}
</style>
