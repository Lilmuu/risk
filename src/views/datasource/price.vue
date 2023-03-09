<template>
  <div class="datasource-price">
    <zebra-table refs="myTable" :option="option" :data="tableData"  pageheadertitle="价格配置">
      <template slot="headerTop">
        <div>
          <zebra-form v-if="form" :formData="form" :option="formOption" @submit="saveHandle" style="margin-top:10px;margin-left:50px;">
            <template v-for="item in slotForm" :slot="item+'Form'">
              <div :key="item+'tableForm'">
<!--                <tableForm :option="tableOption[item]" :data="form[item]" :shortName="rowData.shortName">-->
                <tableForm :option="tableOption[item]" :data="rowData.shortName === 'lexin' ? formTableData : form[item]" :shortName="rowData.shortName">
                  <template slot="menuBtn" slot-scope="scope">
                    <zebra-button size="mini" type="text" @click="delRow(scope.row, scope.index, item)">删除</zebra-button>
                  </template>
                </tableForm>
                <zebra-button v-if="rowData.shortName !== 'lexin'" style="margin-top:10px;" size="mini" type="primary" @click="addRow(item)">新增</zebra-button>
              </div>
            </template>
          </zebra-form>
<!--          <div v-if="form">-->
<!--            <zebra-button @click="saveHandle" type="primary">提交</zebra-button>-->
<!--            <zebra-button @click="handleReset">重置</zebra-button>-->
<!--          </div>-->
        </div>
      </template>
      <template slot="price" slot-scope="scope">
        <el-input-number :disabled="rowData.status" size="mini" v-model="scope.row.price" :precision="2" :step="0.1" :min="0"></el-input-number>
      </template>
      <template slot="docUrl" slot-scope="scope">
        <div>
          <span v-if="scope.row.docUrl == '-'">{{scope.row.docUrl}}</span>
          <a v-else style="color:#409EFF;" :href="scope.row.docUrl" target="_blank">查看</a>
        </div>
      </template>
    </zebra-table>
    <!-- <el-row style="margin-top:10px;display:flex;justify-content:center;align-items:center;">
      <zebra-button size="mini" type="primary" @click="saveHandle">保存</zebra-button>
      <zebra-button size="mini" @click="emptyHandle">重置</zebra-button>
    </el-row> -->
  </div>
</template>
<script>
import {getAccountInfo, getApiInfo, configPrice} from './api'
import PageHeader from '@/components/page-header/PageHeader'
import tableForm from '@/components/tableForm'
export default {
  name: 'price-info',
  components: {PageHeader, tableForm},
  props: {
    rowData: {
      type: Object
    }
  },
  data(){
    return {
      form: null,
      formOption: {
        submitBtn: true,
        emptyBtn: true,
        cancal: false,
        disabled: this.rowData.status,
        column: []
      },
      tableData: [],
      option: {
        page: false,
        menu: false,
        addBtn: false,
        align: 'center',
        menuAlign: 'center',
        showOverflow: true,
        index: true,
        cancal: false,
        column: [
          {
            label: '接口',
            prop: 'apiName'
          },
          {
            label: '说明',
            prop: 'info'
          },
          {
            label: '地址',
            prop: 'docUrl',
            slot: true
          },
          {
            label: '价格/元',
            prop: 'price',
            slot: true
          }
        ]
      },
      defaultForm: {},
      defaultTable: [],
      slotForm: [],
      tableOption: {},
      formTableData: [],
    }
  },
  created () {
    if(this.rowData.id) {
      this.initForm()
    }
  },
  methods: {
    /**
     * @description: 字段格式化,下划线转驼峰
     * @param val example_data
     * @return str exampleData
     */
    formatProp(val) {
      const arr = val.split('_')
      let str = ''
      arr.forEach((item, key) => {
        if (key === 0) {
          str = item
        } else {
          str += item.trim().toLowerCase().replace(item[0], item[0].toUpperCase())
        }
      })
      return str
    },
    initForm () {
      getAccountInfo(this.rowData.id).then(res => {
        if(res.data.data.parameter) {
          let temp = []
          for(let i in res.data.data.parameter) {
            let obj = {
              label: res.data.data.parameter[i].info,
              prop: this.formatProp(res.data.data.parameter[i].name),
              rules: [
                { required: true, message: '请输入' + res.data.data.parameter[i].info, trigger: 'blur' },
              ]
            }
            if(res.data.data.parameter[i].cls == 'java.util.List') {
              obj.rules = []
              obj.formSlot = true
              this.slotForm.push(obj.prop)
              if(res.data.data.parameter[i].vos) {
                let pList = res.data.data.parameter[i].vos
                if(pList.length > 0) {
                  let tp = {
                    addBtn: false,
                    editBtn: false,
                    viewBtn: false,
                    delBtn: false,
                    column: []
                  }
                  for(let p in pList) {
                    let po = {
                      label: pList[p].info,
                      prop: pList[p].name
                    }
                    tp.column.push(po)
                  }
                  this.tableOption[obj.prop] = tp
                }
              }
            }
            // if (this.rowData.shortName === 'lexin' && obj.prop === 'setMealNo') {
            //   console.log(obj)
            // } else {
            //   temp.push(obj)
            // }
            temp.push(obj)
          }
          this.formOption.column = temp
          this.formOption.column.forEach(item => {
            const obj = res.data.data.parameter.find(el => el.name == item.prop)
            if (item.prop === 'env' && obj.mapEnvs) {
              item['type'] = 'select'
              item['dicData'] = obj ? Object.keys(obj.mapEnvs).map(key => {
                return {
                  label:obj.mapEnvs[key],
                  value:key
                }
              }) : []
            }
          })
        }
        let obj = {}
        if(res.data.data.json) {
          if(res.data.data.json.startsWith('{')) {
            obj = JSON.parse(res.data.data.json)
            this.defaultForm = JSON.parse(res.data.data.json)
          }else{
            obj = res.data.data.json
            this.defaultForm = res.data.data.json
          }
        }
        for(let s in this.formOption.column) {
          // console.log(this.slotForm)
          // if(this.slotForm.indexOf(this.formOption.column[s].prop) > -1) {
          //   obj[this.formOption.column[s].prop] = []
          // }
        }
        this.form = obj
        getApiInfo(this.rowData.id).then(res => {
          if(res.data.code == 0) {
            this.tableData = this.changeUnit('元', res.data.data)
            if (this.rowData.shortName === 'lexin') {
              const arr = this.tableData.map(item => {
                return {
                  apiName: item.apiName,
                  setMealNo: ''
                }
              })
              if (this.form && this.form.setMealNos) {
                const arrTemp = [...this.form.setMealNos]
                arrTemp.forEach(item => {
                  const index = arr.findIndex(temp => {
                    return temp.apiName === item.apiName
                  })
                  if (index !== -1) {
                    arr[index].setMealNo = item.setMealNo
                  }
                })
              }
              this.formTableData = [...arr]
              this.$forceUpdate()
            }
            this.defaultTable = JSON.parse(JSON.stringify(res.data.data))
          }
        })
      })
    },

    emptyHandle () {
      this.form = this.defaultForm
      this.tableData = this.defaultTable
    },
    handleReset() {},
    saveHandle (form) {
      if (this.rowData.shortName === 'lexin') {
        this.form.setMealNos = [...this.formTableData]
      }
      let json = this.form // JSON.stringify(form)
      let price = {}
      for(let i in this.tableData) {
        price[this.tableData[i].apiName] = Number.parseFloat(this.tableData[i].price) * 100
      }
      let data = {
        json: json,
        price: price
      }
      configPrice(this.rowData.id, data).then(res => {
        if(res.data.code == 0) {
          this.$message.success("保存成功")
          this.$emit('close', true)
        }
      })
    },
    changeUnit (type, list) {
      let temp = JSON.parse(JSON.stringify(list))
      for(let i in temp) {
        temp[i].price = Number.parseFloat(temp[i].price)
        if(type == '分') {
          temp[i].price = temp[i].price * 100
        }else{
          temp[i].price = temp[i].price / 100
        }
      }
      return temp
    },
    // 表格新增行
    addRow (prop) {
      if(!this.form[prop]) {
        // this.form[prop] = []
        this.$set(this.form, prop, [])
      }
      this.form[prop].push({})
      this.$forceUpdate()
    },
    // 表格删除行
    delRow (row, index, prop) {
      this.form[prop].splice(index, 1)
      this.$forceUpdate()
    }
  }
}
</script>
<style lang="scss">
.datasource-price{
  height: calc(100vh - 20px);
  overflow-x: hidden;
  overflow-y: scroll;
  .table-top{
    .table-top-left{
      margin: 0;
    }
  }
  .el-table {
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .el-table::-webkit-scrollbar{
    display: none;
  }
}
.datasource-price::-webkit-scrollbar {
  display: none;
}
</style>
