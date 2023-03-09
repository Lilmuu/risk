<template>
<!-- 变量绑定 -->
  <div class="variable-bind-list">
    <zebra-table pageheadertitle="变量绑定" 
      :page="page" 
      :loading="loading" 
      :option="option" 
      :data="tableData"
      @on-load="getList"
      @row-click="rowClick"
    >
      <template slot="menu" slot-scope="scope">
        <zebra-button size="mini" type="text" @click="editHandle(scope.row, scope.index)">编辑</zebra-button>
      </template>
    </zebra-table>
    <el-dialog
      class="no-header-dialog-variable variable-design"
      append-to-body
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose"
    >
      <variableDesign ref="variableDesign" :isFromModel="true" :rowData="currentRow" @close="closeHandle" />
    </el-dialog>
  </div>
</template>
<script>
import variableDesign from '../variablecenter/variable'
import {bindVariableList} from '../variablecenter/api'
export default {
  name: 'variable-bind',
  components: {variableDesign},
  props: {
    rowData: {
      type: Object
    }
  },
  data(){
    return {
      tableData: [],
      loading: false,
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      option: {
        addBtn: false,
        editBtn: false,
        viewBtn: false,
        delBtn:false,
        page: true,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        cancal: false,
        column: [
          {
            label: '规则编号',
            prop: 'id',
          },
          {
            label: '风控规则名称',
            prop: 'name',
          },
          {
            label: '风控规则内容',
            prop: 'remark',
          },
          {
            label: '数据源',
            prop: 'datasource',
            hide: true
          },
          {
            label: '判断结果',
            prop: 'hitResult',
            dicData: [
              {label: '通过', value: true},
              {label: '不通过', value: false}
            ],
            hide: this.rowData.riskType != 'EXPERT_MODEL'
          },
          {
            label: '状态',
            prop: 'bindStatus',
            dicData: [
              {label: '已绑定', value: true},
              {label: '未绑定', value: false}
            ]
          },
        ]
      },
      currentRow: {}, // 当前行
      dialogVisible: false, // 设计弹框
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
      bindVariableList(this.rowData.id, obj).then(res => {
        if(res.data.code == 0) {
          this.tableData = res.data.data.records
          this.page.currentPage = res.data.data.current
          this.page.total = res.data.data.total
        }
      }).catch(e => {
        this.tableData = []
      })
    },
    // 编辑
    editHandle (row, index) {
      this.currentRow = row
      this.dialogVisible = true
    },
    // 选择行
    rowClick (data) {
      let row = data.row
      this.$emit('bind', row)
    },
    // 关闭设计
    handleClose () {
      this.dialogVisible = false
    },
    // 取消
    closeHandle (bool) {
      if(bool) {
        this.getList()
      }
      this.handleClose()
    }
  }
}
</script>
<style lang="scss" scoped>

</style>