<template>
  <div>
    <div class="ef-node-form">
      <div class="ef-node-form-header">结束模块</div>
      <div class="ef-node-form-body">
        <el-form :model="rowData" size="mini" ref="dataForm" label-width="120px">
          <el-form-item label="决策类型">
            <span>{{ rightData[0].data.coverType }}</span>
          </el-form-item>
          <el-form-item v-for="(item, key) in rightData" :key="key" :label="item.name + '：'">
            <span :title="getResult(item)">{{ textOverFlowHide(getResult(item)) }}</span>
            <span
              style="margin-left: 10px;color: #4A8FF0;cursor: pointer"
              v-if="item.type === 'STRATEGY' && getResult(item) === '不通过'"
              @click="handleDetail(item)"
            >查看明细
            </span>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 规则集不通过明细 -->
    <el-dialog
      v-if="detailVisible"
      title="规则集明细"
      append-to-body
      :visible.sync="detailVisible"
      :before-close="handleDetailClose">
      <el-table :data="detailData" height="400px">
        <el-table-column prop="nodeName" label="名称" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip></el-table-column>
        <el-table-column prop="result" label="结果" show-overflow-tooltip></el-table-column>
      </el-table>
    </el-dialog>
  </div>

</template>

<script>
// import { cloneDeep } from 'lodash'

export default {
  components: {},
  props: {
    rowData: {
      type: Object
    },
    isSee: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      detailVisible: false,
      detailData: [],
      rightData: []
    }
  },
  watch: {
  },
  created() {
    const arr = JSON.parse(JSON.stringify(this.rowData)).nodeList
    // this.rightData = arr
    this.rightData = arr.filter(item => item.type !== 'START' && item.type !== 'END')
    arr.forEach(item => {
      if (item.type === 'START') {
        console.log(item)
        this.rightData.unshift(item)
      }
      if (item.type === 'END') {
        this.rightData.push(item)
      }
    })
  },
  methods: {
    // 查看规则集不通过明细
    handleDetail(obj) {
      console.log(obj)
      this.detailData = [...obj.data.passLogs] || []
      this.detailVisible = true
    },
    // 关闭明细弹窗
    handleDetailClose () {
      this.detailVisible = false
    },
    // 文本超出隐藏
    textOverFlowHide(str) {
      return str.length > 14 ? str.substr(0, 14) + '...' : str
    },
    // 获取执行结果
    getResult(row) {
      if (row.executeStatus) {
        if (row.ifExecutedWithoutError && typeof row.result === 'boolean') {
          return row.result ? '通过' : '不通过'
        } else if (row.ifExecutedWithoutError) {
          return String(row.result)
        } else {
          return String(row.nodeLogs.error)
        }
      } else {
        return '未执行'
      }
    },
    // 获取类型名
    getTypeName(type) {
      console.log(type)
      switch (type) {
        case 'START':
          return '开始'
        case 'STRATEGY':
          return '规则集'
        case 'JUDGE':
          return '判断'
        case 'VARIABLE':
          return '额度计算'
        case 'END':
          return '结束'
        default: return '';
      }
    },
  }
}
</script>

<style lang="scss">
.ef-node-form{
  .el-form-item__content{
    margin-left: 10px!important;
  }
}
.el-dialog__body{
  padding: 10px;
}
.el-input.is-disabled .el-input__inner{
  color: #606266;
}
.el-radio__input.is-disabled+span.el-radio__label{
  color: #606266;
}
</style>
