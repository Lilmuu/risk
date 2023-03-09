<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">设置</div>
            <div class="ef-node-form-body">
                <el-form :model="node" ref="dataForm" label-width="80px" v-show="type === 'node'">
                    <el-form-item v-show="node.type" label="模块类型">
                        <el-input v-model="node.typeName" :disabled="true"></el-input>
                    </el-form-item>
                    <el-form-item v-show="node.type !== 'STRATEGY'" label="模块名称">
                        <el-input v-model="node.name" :disabled="isSee"></el-input>
                    </el-form-item>
                    <el-form-item v-if="node.type === 'STRATEGY'" label="模块名称">
                      <el-select v-model="node.name" :disabled="isSee" @change="handleSelectStrategy" filterable placeholder="请选择">
                        <el-option
                          v-for="item in groupList"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  <el-form-item v-show="node.remark !== undefined" label="规则描述">
                    <el-input v-model="node.remark" :disabled="isSee" type="textarea" :rows="2"></el-input>
                  </el-form-item>
                  <el-form-item v-if="node.type === 'START'" label="">
                    <el-radio-group v-model="coverType" @change="coverTypeChange" :disabled="isSee" class="risk-radio-item">
                      <el-radio :label="0">
                        <span>漏斗型决策</span>
                        <section>该决策方式会按照规则顺序进行判断，一旦输出结果，则不会继续进行后续的规则判断以节约资源</section>
                      </el-radio>
                      <el-radio :label="1">
                        <span>覆盖型决策</span>
                        <section>该决策方式会完整的进行所有的决策集判断，最后统计决策集输出的结果。数目从而得出最终的决策结果（决策结果数目可自由配置）</section>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item v-if="node.type === 'JUDGE' || node.type === 'VARIABLE'" label="变量名称">
                    {{ node.data.binding === '' ? '未绑定' : node.data.name }}
                  </el-form-item>
                    <el-form-item v-show="!isSee">
                      <el-button v-if="node.type === 'JUDGE' || node.type === 'VARIABLE'" type="primary" size="mini" @click="handleBand">绑定变量</el-button>
                      <el-button v-if="node.type !== 'START' && node.type !== 'END'" type="primary" size="mini" @click="handleTest(node.type)">单元测试</el-button>
                    </el-form-item>
                </el-form>

                <el-form :model="line" ref="dataForm" label-width="80px" v-show="type === 'line'">
                    <el-form-item label="值">
                        <el-input v-model="line.label" :disabled="isSee"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <!--            <div class="el-node-form-tag"></div>-->
        </div>
      <!-- 变量列表 -->
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
        <div v-if="variableNo !== ''">
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
          height="40vh"
          @select="handleSelect"
          style="width: 100%;">
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
      <!-- 变量详情 -->
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
      <!-- 变量测试 -->
      <el-dialog
        title="测试"
        append-to-body
        v-if="testVisible"
        :visible.sync="testVisible"
        :before-close="testClose">
        <zebra-form
          v-loading="testLoading"
          v-if="testOption.column && testOption.column.length > 0"
          :option="testOption"
          :formData="testForm"
          @submit="excuteHandle"
          @cancalClick="testClose"
        >
        </zebra-form>
        <zebra-button v-else size="mini" type="primary" @click="excuteHandle">测试</zebra-button>
        <div>
          <h4>测试结果</h4>
          <section v-html="returnResultJson"></section>
        </div>
      </el-dialog>
      <!-- 规则集测试 -->
      <el-dialog
        v-if="infoVisible"
        :visible.sync="infoVisible"
        fullscreen
        :before-close="handleInfoClose">
        <infoForm :rowData="infoData" />
      </el-dialog>
    </div>

</template>

<script>
    // import { cloneDeep } from 'lodash'

    import {findIndex} from "lodash";
    import infoForm from '../../policygroup/info'
    import VariableDesign from "../../variablecenter/variable";
    import {variableByNo, variableList} from "../../policy/api";
    import {getVariableByNo} from "../api";
    import {getTestParams, testVariable} from "../../variablecenter/api";
    import {getAllList} from "../../policygroup/api";
    import node from "./node";

    export default {
      components: {VariableDesign, infoForm},
      props: {
        groupList: {
          type: Array,
          default() {
            return []
          }
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
              nodeName: '',
              rowData: {},
              coverType: 1,
              variableNo: '',
              variableData: {},
              variableTable: [],
              variableLoading: false,
              total: 0, // 总页数
              currentPage: 1, // 当前页数
              pageSize: 10, // 每页显示多少条
              dialogVisible: false,
              designVisible: false,
              queryParams: {
              },
              visible: true,
              // node 或 line
              type: 'node',
              node: {
                name: ''
              },
              line: {},
              data: {},
              stateList: [{
                  state: 'success',
                  label: '成功'
              }, {
                  state: 'warning',
                  label: '警告'
              }, {
                  state: 'error',
                  label: '错误'
              }, {
                  state: 'running',
                  label: '运行中'
              }],
              // 规则集测试
              infoVisible: false,
              infoData: {},
              // 变量测试
              testLoading: false,
              expression: '',
              returnResultJson: '',
              testForm: {},
              testVisible: false,
              testOption: {
                submitBtnText: '确定',
                emptyBtn: false,
                formAlign: 'top',
                labelWidth: '100px',
                column: []
              },
            }
        },
      watch: {
        node: {
          handler(newVal, oldVal) {
            this.data.nodeList.filter((node) => {
              if (node.id === newVal.id) {
                node.name = newVal.name
                node.typeName = this.getTypeName(newVal.type)
                node.ico = newVal.ico
                node.state = newVal.state
                node.data = newVal.data
                node.remark = newVal.remark
                this.$emit('repaintEverything')
              }
            })
          },
          deep: true
        },
        line: {
          handler(newVal, oldVal) {
            this.$emit('setLineLabel', newVal.from, newVal.to, newVal.label)
          },
          deep: true
        }
      },
      methods: {
        coverTypeChange(e) {
          this.$emit('getCoverType', e)
        },
        getTypeName(type) {
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
        getCoverType () {
          return this.coverType === 1
        },
        setCoverType(val) {
          console.log(val)
          this.coverType = val ? 1 : 0
        },
        // 变量详情弹框关闭取消
        closeHandle () {
          this.designVisible = false
        },
        // 查看变量详情
        handleDetail(row, index) {
          this.rowData = JSON.parse(JSON.stringify(row))
          this.designVisible = true
        },
        // 变量列表重置
        handleReset() {
          this.queryParams = {}
        },
        // 根据No获取变量
        getVariableByNo() {
          if (this.variableNo !== '') {
            variableByNo(this.variableNo).then(res => {
              if(res.data && res.data.code == 0) {
                this.variableData = JSON.parse(JSON.stringify(res.data.data))
                this.$forceUpdate()
              }
            }).catch(e => {
            })
          }
        },
        // 获取变量列表
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
        // 关闭弹窗
        handleClose() {
          this.dialogVisible = false
        },
        // 确认
        handleConfirm() {
          if (!this.selectedRow.no) {
            this.$message.warning('请选择需要绑定的变量！')
            return false
          }
          this.node.data.binding = this.selectedRow.no
          this.node.data.name = this.selectedRow.name
          this.dialogVisible = false
        },
        /**
         * 表单修改，这里可以根据传入的ID进行业务信息获取
         * @param data
         * @param id
         */
        nodeInit(data, id) {
          this.coverType = data.coverType ? 1 : 0
          this.type = 'node'
          this.data = data
          data.nodeList.filter((node) => {
              if (node.id === id) {
                  // this.node = cloneDeep(node)
                  this.node = JSON.parse(JSON.stringify(node))
                if (this.node.data && this.node.data.binding === '') {
                  this.nodeName = ''
                } else {
                  this.nodeName = this.node.name
                }
                this.node.typeName = this.getTypeName(this.node.type)
              }
          })
        },
        lineInit(line) {
            this.type = 'line'
            this.line = line
        },
        // 绑定变量
        handleBand() {
          if (this.node.data.binding) {
            this.variableNo = this.node.data.binding
          }
          this.ruleNo = this.node.no
          this.dialogVisible = true
          this.getVariableList()
          this.getVariableByNo()
        },
        // 变量测试
        handleTest(type) {
          if (type === 'STRATEGY') {
            // 分页参数
            let params = {
              current: 1,
              size: 10,
              riskNodeType: 'STRATEGY_GROUP',
              no: this.node.data.binding
            }
            getAllList(params).then(res => {
              if (res.data && res.data.code == 0) {
                console.log(res.data.data)
                this.infoData = res.data.data.records[0]
                this.infoVisible = true
              }
            })
          } else {
            if (this.node.data.binding === '') {
              this.$message.warning('请先绑定变量！')
              return false
            }
            getVariableByNo(this.node.data.binding).then(res => {
              if (res.data && res.data.code == 0) {
                const data = JSON.parse(JSON.stringify(res.data.data))
                console.log(data.expression)
                this.expression = data.expression
                getTestParams({expression: data.expression, varNo: this.node.data.binding}).then(res => {
                  if(res.data.code == 0) {
                    // if(!res.data.data || res.data.data.length == 0) {
                    //   this.$message.warning("未配置完整，不能执行测试！")
                    //   return false
                    // }
                    if(res.data.data) {
                      let temp = []
                      let defaultDemo = {}
                      for(let i in res.data.data) {
                        let obj = {
                          label: res.data.data[i].info + '  (' + res.data.data[i].key + ')',
                          prop: res.data.data[i].key,
                        }
                        obj.placeholder = res.data.data[i].info
                        switch(res.data.data[i].type) {
                          case 'String':
                            obj.type = 'input';break;
                          case 'Number':
                            obj.type = 'inputNumber';obj.controlsposition='right';break;
                          case 'Date':
                            obj.type = 'datePicker';obj.datetype = 'datetime';obj.format = "yyyy-MM-dd hh:mm:ss";obj.valueFormat = "yyyy-MM-dd hh:mm:ss";break;
                          case 'list':
                            ;break
                          default: obj.type = 'input';break;
                        }
                        obj.rules = [
                          { required: res.data.data[i].necessary, message: '请输入' + obj.placeholder, trigger: 'blur' },
                        ]
                        if(res.data.data[i].example) {
                          defaultDemo[obj.prop] = res.data.data[i].example
                        }
                        temp.push(obj)
                      }
                      this.testForm = defaultDemo
                      this.testOption.column = temp
                    }
                    this.testVisible = true
                  }
                })
              }
            })
          }
        },
        // 执行变量测试
        excuteHandle () {
          this.testLoading = true
          if (this.node && this.node.data) {
            testVariable({expression: this.expression, reqParams: this.testForm, varNo: this.node.data.binding}).then(res => {
              if(res.data.code == 0) {
                // this.$message.success('测试通过')
                // this.testClose()
                this.returnResultJson = res.data.data
                this.testLoading = false
              }
            })
          }
        },
        // 关闭变量测试
        testClose () {
          this.testVisible = false
          this.testForm = {}
          this.testOption = {
            submitBtnText: '确定',
            emptyBtn: false,
            formAlign: 'top',
            labelWidth: '100px',
            column: []
          }
          this.returnResultJson = ''
        },
        // 关闭规则集测试
        handleInfoClose() {
          this.infoVisible = false
        },
        // 选择规则集
        handleSelectStrategy(e) {
          const index = findIndex(this.groupList, ['no', e])
          this.node.data.binding = this.groupList[index].no
          this.node.name = this.groupList[index].name
        },
        // 选择变量
        handleSelect(val, row) {
          this.selectedRow = row
          this.$refs.variableTable.clearSelection() //用于多选表格，清空用户的选择
          this.variableTable.forEach(item => {
            if (item.id == row.id) {
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
      }
    }
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body{
  .el-table__header  .el-checkbox{  //找到表头那一行，然后把里面的复选框隐藏掉
    display:none !important
  }
}
</style>
<style>
    .el-node-form-tag {
        position: absolute;
        top: 50%;
        margin-left: -15px;
        height: 40px;
        width: 15px;
        background-color: #fbfbfb;
        border: 1px solid rgb(220, 227, 232);
        border-right: none;
        z-index: 0;
    }
</style>
<style lang="scss">
.risk-radio-item{
  display: flex;
  flex-direction: column;
  .el-radio{
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .el-radio__label{
      display: flex;
      align-items: center;
    }
  }
  section{
    white-space: pre-wrap;
    color: #C0C4CC;
    line-height: 20px;
    margin-left: 10px;
  }
}
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
.risk-radio-item section{
  color: #606266;
}
</style>
