<template>
  <PageHeader :title="isEdit ? '编辑规则集' : '新增规则集'" style="padding: 0 30px">
    <div class="policy-box">
      <div style="position: absolute; right: 20px; top: 20px">
        <i class="el-icon-close close-icon" @click="handleCancel"/>
      </div>
      <zebra-form :option="formOption" :formData="formData"></zebra-form>
      <div class="create-rule">
        <div class="title">规则选择</div>
        <div style="height: 1px; width: 100%; background-color: #cccccc; margin: 0 10px 20px"/>
        <el-form :inline="true" :model="queryParams" class="demo-form-inline">
          <el-form-item label="规则名称">
            <el-input size="mini" v-model="queryParams.name" placeholder="请输入规则名称"></el-input>
          </el-form-item>
          <el-form-item label="规则类型">
            <el-select size="mini" v-model="queryParams.strategyType" placeholder="请选择规则类型">
              <el-option v-for="(item, key) in policyTypeList" :key="key" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="getList">查询</el-button>
            <el-button size="mini" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" @select="handleSelect" @select-all="handleSelectionChange">
          <el-table-column :selectable='handleSelectable' type="selection">
          </el-table-column>
          <el-table-column label="规则名称" prop="name">
          </el-table-column>
          <el-table-column prop="remark" label="规则描述" show-overflow-tooltip>
          </el-table-column>
          <el-table-column prop="strategyType" label="规则类型">
          </el-table-column>
          <el-table-column prop="childrenSize" label="规则条数">
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <zebra-button @click="handleDetail(scope.row, scope.index)" type="text" size="mini">详情</zebra-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="padding: 20px 0;text-align: right"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page.currentPage"
          :page-sizes="[10, 20, 50, 100, 200, 500, 1000]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total">
        </el-pagination>
        <div v-if="tableData.length !== 0" class="title">关系设置</div>
        <div v-if="tableData.length !== 0" style="height: 1px; width: 100%; background-color: #cccccc; margin: 0 10px 20px"/>
<!--        <div class="param-list-box" v-if="rowData.riskType == 'EXPERT_MODEL'">-->
        <div class="param-list-box" v-if="tableData.length !== 0">
          <div class="param-list-item" v-for="(item, index) in paramObjList" :key="'paramItem'+index">
            <el-row style="width: 100%;display: flex;align-items: center;margin-bottom:10px;">
              <el-select size="mini" v-model="item.operator" placeholder="请选择" v-if="index > 0" style="width:100%;">
                <el-option
                  v-for="o in operatorList"
                  :key="o.value+'group-'+index"
                  :label="o.label"
                  :value="o.value">
                </el-option>
              </el-select>
              <zebra-button size="mini" @click="delOneGroup(index)" v-if="index > 0" style="margin-left:10px;">删除</zebra-button>
            </el-row>
            <div class="param-list-item-left">
              <div class="param-list-item-right-item">
                <div v-for="(it, ix) in item.list" :key="'items'+ix" class="param-list-item-right-item-div">
                  <el-select size="mini" v-model="it.str" :placeholder="'请选择规则'" v-if="it.type == 'variable'" @change="selectedGroup">
                    <el-option
                      v-for="ig in groupList"
                      :key="ig.value"
                      :disabled="hadSelect.indexOf(ig.value) > -1"
                      :label="ig.label"
                      :value="ig.value">
                    </el-option>
                  </el-select>
                  <el-select size="mini" v-model="it.operator" placeholder="判断符" v-if="it.type == 'operator'">
                    <el-option
                      v-for="ig in operatorList"
                      :key="it.str + ix +ig.value"
                      :label="ig.label"
                      :value="ig.value">
                    </el-option>
                  </el-select>
                  <zebra-button size="mini" @click="delOneItem(item, index, ix)" v-if="it.type == 'operator' || (it.type == 'variable' && ix == item.list.length-1)">删除</zebra-button>
                </div>
              </div>
            </div>
            <el-row class="param-list-item-btn">
              <zebra-button size="mini" @click="addOneItem(item)">添加</zebra-button>
            </el-row>
          </div>
          <div style="padding: 10px 10px 20px">
            <zebra-button size="mini" @click="addOneGroup">添加一组</zebra-button>
            <section class="param-string-section">
              <h4>关系式</h4>
              <div v-html="formatParamString(paramObjList, 'html')"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-button">
      <zebra-button type="primary" size="mini" @click="handleSubmit">提交</zebra-button>
      <zebra-button size="mini" @click="handleCancel">取消</zebra-button>
    </div>
  </PageHeader>
</template>

<script>
import { uniqBy, findIndex } from 'lodash'
import PageHeader from "@/components/page-header/PageHeader";
import { guid } from "@/util/util";
import {getAllList, addStrategyGroup, editStrategyGroup, getStrategyType, getStrategyByNo} from "./api";
export default {
  name: "add",
  components: {PageHeader},
  data() {
    return {
      paramObjList: [],
      operatorList: [
        {label: '且', value: '&'},
        {label: '或', value: '|'}
      ],
      tempList: [],
      hadSelect: [],
      groupList: [],
      actNode: {},
      isEdit: false,
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
        layout: "total, sizes, prev, pager, next, jumper", // 分页工具
      },
      option: {
        editBtn: false,
        searchBtnText: '查询',
        selectable: true,
        search: true,
        delBtn:false,
        viewBtn: false,
        addBtn: false,
        page: true,
        column: [
          {
            label: "规则名称",
            prop: "name",
            slot: true,
          },
          {
            label: "规则描述",
            prop: "remark",
          },
          {
            label: "规则类型",
            prop: "strategyType",
            slot: true,
          },
          {
            label: "规则条数",
            prop: "childrenSize",
          }
        ]
      },
      tableData: [],
      policyTypeList: [],
      selectedList: [],
      formData: {
        name: '',
        remark: ''
      },
      queryParams: {
        name: '',
        type: ''
      },
      formOption: {
        labelWidth: '90px',
        btnHide: true,
        column: [
          {
            label: "规则集名称",
            prop: "name",
            span: 6,
            placeholder: '请输入规则集名称'
          },
          {
            label: "备注",
            // type: 'textarea',
            prop: "remark",
            placeholder: '请输入备注信息',
            span: 12
          },
        ]
      }
    }
  },
  async created() {
    if (JSON.stringify(this.$route.query) !== '{}') {
      const data = JSON.parse(JSON.stringify(this.$route.query))
      this.tempData = JSON.parse(JSON.stringify(this.$route.query))
      this.getStrategyList()
      this.isEdit = true
      Object.keys(this.formData).forEach(item => {
        this.formData[item] = data[item]
      })
      this.superNo = data.no
      if (data.paramObjList) {
        this.paramObjList = JSON.parse(data.paramObjList)
      }
    } else {
    }
    await this.getList()
  },
  mounted() {
    this.$nextTick(() => {
    })
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {
        // const arr = [...newVal]
      },
      deep: true
    },
    tempList: {
      handler(newVal, oldVal) {
        const arr = [...newVal]
        this.groupList = arr.map(item => {
          item.label = item.name
          item.value = item.no
          return item
        })
      },
      deep: true
    }
  },
  methods: {
    // 添加一项条件
    addOneItem (item, operator) {
      if(operator == '(' || operator == ')') {
        item.list.push({
          operator: operator,
          type: 'operator'
        })
      }
      if(operator == 'str') {
        item.list.push({
          str: "",
          type: 'variable'
        })
      }
      if(operator == '&' || operator == '|'){
        item.list.push({
          operator: operator,
          type: 'operator'
        })
      }
      if(!operator) {
        if(item.list.length > 0) {
          item.list.push({
            oprator: '',
            type: 'operator'
          })
          item.list.push({
            str: "",
            type: 'variable'
          })
        }else{
          item.list.push({
            str: "",
            type: 'variable'
          })
        }
      }
    },
    // 删除一项条件
    delOneItem (item, groupIndex, index) {
      if(index == item.list.length - 1) {
        item.list.splice(index-1, 2)
      }else if(item.list[index].type == "operator"){
        item.list.splice(index-1, 2)
      }
      if(item.list.length == 0) {
        this.delOneGroup(groupIndex)
      }
      console.log(this.paramObjList)
      this.selectedGroup()
      this.$forceUpdate()
    },
    // 添加一组
    addOneGroup () {
      let isNull = false
      const ruleArr = [...this.tableData]
      ruleArr.forEach(item => {
        if (item.name === '') {
          isNull = true
        }
      })
      if (isNull) {
        this.$message.warning('规则名称不能为空，请先完善规则数据！')
        return false
      }
      this.paramObjList.push({
        operator: '',
        list: [{str: '', type: 'variable'}]
      })
    },
    // 删除一组
    delOneGroup (index) {
      this.paramObjList.splice(index, 1)
      this.selectedGroup()
    },
    // 已选择
    selectedGroup (val) {
      this.hadSelect = []
      for(let i in this.paramObjList) {
        if(this.paramObjList[i].list && this.paramObjList[i].list.length > 0) {
          for(let j in this.paramObjList[i].list) {
            if(this.paramObjList[i].list[j].str) {
              this.hadSelect.push(this.paramObjList[i].list[j].str)
            }
          }
        }
      }
    },
    // 根据value获取label
    getLabelByValue (val) {
      let str = val
      for(let i in this.groupList) {
        if(this.groupList[i].value == val) {
          str = this.groupList[i].label
        }
      }
      return str
    },
    formatParamString (list, tp) {
      if(list && list.length == 0) {
        return ""
      }
      let str = ""
      let html = ""
      let text = ""
      for(let p in list) {
        str += `${list[p].operator}`
        if(list[p].operator) {
          html += (list[p].operator == '&' ? ' 且 ' : ' 或 ')
          text += (list[p].operator == '&' ? ' 且 ' : ' 或 ')
        }
        if(list[p].list) {
          if(list[p].list.length > 1) {
            str += '('
            html += '('
            text += '('
          }
          for(let l in list[p].list) {
            if(list[p].list[l].type == 'variable') {
              str += `${list[p].list[l].str}`
              html += ('<b>' + this.getLabelByValue(list[p].list[l].str) + '</b>')
              if(tp == 'html') {
                list[p].list[l].text = this.getLabelByValue(list[p].list[l].str)
              }
              text += list[p].list[l].text
            }else{
              str += `${list[p].list[l].operator}`
              html += (list[p].list[l].operator == '&' ? '且' : '或')
              text += (list[p].list[l].operator == '&' ? '且' : '或')
            }
          }
          if(list[p].list.length > 1) {
            str += ')'
            html += ')'
            text += ')'
          }
        }
      }
      if(tp == 'html') {
        return html
      }else if(tp == 'text'){
        return text
      }else{
        return str
      }
    },
    //   获取数据
    getList (page) {
      // 获取规则类型
      getStrategyType().then(res => {
        if (res.data && res.data.code == 0) {
          const arr = []
          res.data.data.forEach(item => {
            const obj = { label: item, value: item }
            arr.push(obj)
          })
          this.policyTypeList = [...arr]
        }
      })
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
          this.page.total = data.total
          const arr = []
          this.tempList.forEach(item => {
            const index = this.tableData.findIndex(function (n) {
              return n.no == item.no
            })
            arr.push(this.tableData[index])
          })
          setTimeout(() => {
            arr.forEach(item => {
              this.$refs.multipleTable.toggleRowSelection(item);
            })
          }, 0)
        }
      })
    },
    // 是否可选
    handleSelectable(row, index) {
      let bool = true
      const arr = [...this.paramObjList]
      arr.forEach(item => {
        item.list.forEach(index => {
          if (index.str === row.no) {
            bool = false
          }
        })
      })
      return bool
    },
    // 获取已选择规则列表
    getStrategyList() {
      const subNoList = this.tempData.subNo.split(',')
      getStrategyByNo(subNoList).then(res => {
        if (res.data && res.data.code == 0) {
          this.groupList = res.data.data.map(item => {
            item.label = item.name
            item.value = item.no
            return item
          })
          this.tempList = [...res.data.data]
        }
      })
    },
    // 重置
    handleReset() {
      this.queryParams = {
        name: '',
        type: ''
      }
    },
    addRowHandle(form) {
      console.log(form)
    },
    editRowHandle() {},
    // 提交
    handleSubmit() {
      const arr = []
      this.tempList.forEach(item => {
        arr.push(item.no)
      })
      if (this.isEdit) {
        const params = {
          children: arr,
          name: this.formData.name,
          remark: this.formData.remark,
          expression: this.formatParamString(this.paramObjList),
          paramObjList: JSON.stringify(this.paramObjList),
          id: this.tempData.id
        }
        editStrategyGroup(params).then(res => {
          if (res.data && res.data.code == 0) {
            this.$message.success('操作成功')
            this.$router.go(-1)
          }
        })
      } else {
        const params = {
          children: arr,
          name: this.formData.name,
          remark: this.formData.remark,
          expression: this.formatParamString(this.paramObjList),
          paramObjList: JSON.stringify(this.paramObjList)
        }
        addStrategyGroup(params).then(res => {
          if (res.data && res.data.code == 0) {
            this.$message.success('操作成功')
            this.$router.go(-1)
          }
        })
      }
    },
    // 取消
    handleCancel() {
      this.$router.go(-1)
    },
    // 查看规则详情
    handleDetail(row, index) {
      this.$router.push({ path: 'policySee', query: row })
    },
    handleSelectionChange(e) {
      this.tableData.forEach(item => {
        if (e.indexOf(item) !== -1) {
          this.tempList.push(item)
        } else {
          this.tempList.forEach((temp, key) => {
            if (temp.no === item.no) {
              this.tempList.splice(key, 1)
            }
          })
        }
      })
      const arr = []
      this.tempList.forEach(item => {
        const index = findIndex(arr, ['id', item.id])
        if (index === -1) {
          arr.push(item)
        }
      })
      this.tempList = [...arr]
    },
    handleSelect(selection, row) {
      let select = false
      select = selection.indexOf(row) !== -1;
      if (select) {
        this.tempList.push(row)
      } else {
        this.tempList.forEach((item, key) => {
          if (item.no === row.no) {
            this.tempList.splice(key, 1)
          }
        })
      }
      const arr = []
      this.tempList.forEach(item => {
        const index = findIndex(arr, ['id', item.id])
        if (index === -1) {
          arr.push(item)
        }
      })
      this.tempList = [...arr]
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.page.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.page.currentPage = val
      this.getList()
      console.log(`当前页: ${val}`);
    }
  },
}
</script>

<style lang="scss" scoped>
.policy-box/deep/{
  .close-icon {
    font-size: 16px;
    cursor: pointer;
  }
  //padding: 0 20px;
  margin-top: 16px;
  .create-rule{
    .title{
      color: #606266;
      font-size: 18px;
      font-weight: bold;
      padding: 10px 20px;
    }
  }
  .el-table .el-table__body-wrapper {
    height: calc(100vh - 360px)!important;
  }
  .param-list-box{
    .param-list-item{
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      padding: 10px;
      .param-list-item-right{
        height: 48px;
        line-height: 48px;
      }
      .param-list-item-left{
        flex: 1;
        .param-list-item-right-item{
          display: flex;
          flex-wrap: wrap;
          .param-list-item-right-item-div{
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            // width: 50%;
            .el-select{
              // flex: 1;
              // min-width: 250px;
            }
            .el-select:nth-of-type(2) {
              margin-right: 0;
            }
          }
        }
        .el-input, .el-select{
          // margin: 0 5px;
          margin-right: 10px;
        }
      }
      .param-list-item-btn{
        width: 100%;
        margin-bottom: 10px;
      }
    }
    .param-list-item:nth-of-type(2n+1) {
      background: #f5f7fa;
    }
  }
  .param-string-section{
    div{
      b{
        display: inline-block;
        font-weight: 500;
        padding: 0 10px;
        background-color: #409EFF;
        text-align: center;
        color: #fff;
        margin: 0 5px;
        border-radius: 5px;
      }
    }
  }
}
.footer-button/deep/{
  //position: fixed;
  background-color: #ffffff;
  bottom: 0;
  padding: 10px 0;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
