<template>
  <div class="api-manage-info">
    <PageHeader :title="infoForm.apiName">
      <div style="position: fixed;right: 20px;top: 10px;">
        <i class="el-icon-close close-icon" @click="handleClose"/>
      </div>
      <!-- <zebra-form :option="infoOption" :formData="detailInfo"></zebra-form> -->
      <el-row class="info-form" style="position:relative;" v-if="infoForm">
        <p><span class="el-form-item__label">接口价格：</span>{{infoForm.price ? '￥' + (Number.parseFloat(infoForm.price) / 100).toFixed(2) +' / 次' : ''}}</p>
        <p><span class="el-form-item__label">接口地址：</span><a style="color: #1890ff;" :href="infoForm.docUrl" target="_blank" rel="noopener noreferrer">{{infoForm.docUrl}}</a></p>
        <p><span class="el-form-item__label">接口说明：</span><span>{{infoForm.info ? infoForm.info : ''}}</span></p>
        <!-- <zebra-button size="mini" type="primary" style="position: absolute;top: 0;right: 65px;" @click="customParam" permisionFlag="">自定义变量</zebra-button> -->
        <zebra-button size="mini" type="primary" style="position: absolute;top: 0;right: 10px;" @click="testHandle" permisionFlag="">测试</zebra-button>
      </el-row>
    </PageHeader>
    <zebra-tab :option="tabOption" :active="active">
      <template slot="in">
        <zebra-table v-if="enterData.length > 0"  :page="enterpage" :option="enterOption" :data="enterData"></zebra-table>
      </template>
      <template slot="out">
        <zebra-table v-if="outData.length > 0" :page="outpage" :option="outOption" :data="outData">
        <template slot="key" slot-scope="scope">
          <span v-html="placeEmpty(scope.row.key)"></span>
        </template>
        <template slot="typeName" slot-scope="scope">
          <span v-html="placeEmpty(scope.row.typeName)"></span>
        </template>
        <template slot="variableType" slot-scope="scope">
          <span v-html="placeEmpty(scope.row.variableType)"></span>
        </template>
        <template slot="info" slot-scope="scope">
          <span v-html="placeEmpty(scope.row.info, scope.row.extend)"></span>
        </template>
        <template slot="example" slot-scope="scope">
          <span v-html="placeEmpty(scope.row.example)"></span>
        </template>
      </zebra-table>
      </template>
    </zebra-tab>
    <!-- <zebra-children-table v-if="outData.length > 0" :page="outpage" :option="outOption" :data="outData" /> -->

    <!-- <h4 v-if="newData.length > 0">新增规则</h4> -->
      <!-- <zebra-table v-if="newData.length > 0" :page="newpage" :option="newOption" :data="newData"></zebra-table> -->
    <div :class="{'testBox': true, 'openTest': isShow}">
      <i class="el-icon-close" @click="closeTest" style="position: absolute;top: 5px;right: 5px;font-size: 16px;cursor: pointer;color: #909399;"></i>
      <h3>测试</h3>
      <zebra-form :key="testFormKey" :formData="testForm" :option="testFormOption" @submit="testSubmit">
        <template slot="formButton"><zebra-button size="mini" @click="handleReset">重置</zebra-button></template>
        <template slot="formButton"><zebra-button size="mini" @click="closeTest">取消</zebra-button></template>
      </zebra-form>
      <LoadingBox v-if="formloading" />
      <json-viewer
        v-if="returnResultJson"
        style="margin-top: 10px;overflow:auto;flex:1;min-height:300px;"
        :value="returnResultJson"
        :expand-depth="2000"
        copyable
        boxed
        sort
        ></json-viewer>
    </div>
  </div>
</template>
<script>
import {apiDetail, testData} from './api'
import PageHeader from '@/components/page-header/PageHeader'
import LoadingBox from '@/components/basic-container/loading'
export default {
  name: 'api-manage-info',
  components: {PageHeader, LoadingBox},
  props: {
    detailInfo: {
      type: Object
    }
  },
  data(){
    return {
      infoForm: {},
      infoOption: {
        disabled: true,
        labelWidth: '90px',
        btnHide: true,
        column: [
          {
            label: '数据源',
            prop: 'fullName',
            span: 8
          },
          // {
          //   label: '数据名称',
          //   prop: 'name',
          //   span: 8
          // },
          {
            label: '接口名称',
            prop: 'apiName',
            span: 8
          }
        ]
      },
      active: 'in',
      tabOption: {
        type: 'card',
        column: [
          {
            label: '入参信息',
            name: 'in'
          },
          {
            label: '出参信息',
            name: 'out'
          }
        ]
      },
      // 入参
      enterpage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
        pageSizes: [20, 50, 100, 200, 500, 1000]
      },
      enterData: [],
      enterOption: {
        addBtn: false,
        menu: false,
        // page: true,
        search: false,
        align: 'left',
        menuAlign: 'left',
        showOverflow: true,
        column: [
          {
            label: '入参名称',
            prop: 'key'
          },
          {
            label: '数据类型',
            prop: 'typeName'
          },
          {
            label: '说明',
            prop: 'info'
          },
          {
            label: '是否必填',
            prop: 'necessary',
            dicData: [
              {label: '必填', value: true},
              {label: '非必填', value: false}
            ]
          },
          {
            label: '示例',
            prop: 'example'
          }
        ]
      },
      // 出参信息（规则）
      outpage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
        pageSizes: [20, 50, 100, 200, 500, 1000]
      },
      outData: [],
      outOption: {
        addBtn: false,
        menu: false,
        // page: true,
        search: false,
        align: 'left',
        menuAlign: 'left',
        children: 'list', // children字段
        showOverflow: true,
        column: [
          {
            label: '出参名称',
            prop: 'key',
            slot: true
          },
          {
            label: '数据类型',
            prop: 'typeName',
            slot: true
          },
          {
            label: '变量类型',
            prop: 'variableType',
            slot: true,
            // dicData: [
            //   {label: '源生变量', value: 'origin'},
            //   {label: '系统变量', value: 'system'},
            //   {label: '自定义变量', value: 'custom'}
            // ]
          },
          {
            label: '说明',
            prop: 'info',
            slot: true
          },
          {
            label: '示例',
            prop: 'example',
            slot: true
          }
        ]
      },
      // 新增规则
      newpage: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
        pageSizes: [20, 50, 100, 200, 500, 1000]
      },
      newData: [],
      newOption: {
        addBtn: false,
        menu: false,
        // page: true,
        search: false,
        align: 'center',
        menuAlign: 'center',
        column: [
          {
            label: '出参名称',
            prop: 'name'
          },
          {
            label: '项目',
            prop: 'project'
          },
          {
            label: '数据类型',
            prop: 'typeName'
          },
          {
            label: '说明',
            prop: 'introduce'
          },
          {
            label: '示例',
            prop: 'example'
          }
        ]
      },
      isShow: false, // 测试内容
      testForm: {},
      testFormKey: 0,
      testFormOption: {
        // submitBtn: true,
        emptyBtn: false,
        cancal: false,
        labelWidth: '100px',
        size: 'mini',
        // formAlign: 'top',
        column: [
          {
            label: '账号',
            prop: 'account',
            type: 'select',
            dicUrl: '/mgr/risk/api/secret/' + this.detailInfo.shortName,
            props: {
              label: 'secretName',
              value: 'id'
            },
            rules: [ {required: true, message: '请输入选择账号', trigger: 'change'} ]
            }
        ]
      },
      returnResultJson: null,
      formloading: false
    }
  },
  created () {
    apiDetail({apiName: this.detailInfo.apiName, shortName: this.detailInfo.shortName}).then(res => {
      if(res.data.code == 0 && res.data.data) {
        this.infoForm = res.data.data
        if(res.data.data.apiResult) {
          this.outData = res.data.data.apiResult
        }
        if(res.data.data.apiReq) {
          this.enterData = res.data.data.apiReq
          this.initTestForm()
        }
      }
    })
  },
  methods: {
    handleClose() {
      this.$emit('handleClose')
    },
    testHandle () {
      this.initTestForm()
      this.isShow = true
    },
    customParam () {
      this.$message.warning('此功能正在开发中')
    },
    testSubmit (form) {
      let obj = {}
      for(let i in form) {
        if(i != 'account') {
          obj[i] = form[i]
        }
      }
      this.formloading = true
      testData(this.infoForm.apiName, form.account, obj).then(res => {
        this.returnResultJson = res.data.data
        if(res.data.code != 0) {
          this.$message.error(res.data.msg)
          this.formloading = false
        }else{
          this.formloading = false
        }
      }).catch(e => {
        this.returnResultJson = e + ''
        this.formloading = false
      })
    },
    closeTest () {
      this.isShow = false
      this.testForm = {}
    },
    handleReset() {
      this.$set(this, 'testForm', {})
      this.testFormKey++
    },
    placeEmpty (str, ex) {
      let tsr = str
      if(str) {
        tsr = str.replace(/\s/g,'&nbsp;')
      }
      if(ex) {
        tsr += `<a style="color:#409EFF;">(${ex})</a>`
      }
      return tsr
    },
    initTestForm () {
      let tf = {}
      let temp = [
        {
          label: '账号',
          prop: 'account',
          type: 'select',
          dicUrl: '/mgr/risk/api/secret/' + this.detailInfo.shortName,
          props: {
            label: 'secretName',
            value: 'id'
          },
          rules: [
            {required: true, message: '请输入选择账号', trigger: 'change'}
          ]
        }
      ]
      for(let i in this.enterData) {
        let obj = {
          label: this.enterData[i].key, //this.enterData[i].info,
          prop: this.enterData[i].key,
          placeholder: this.enterData[i].info
        }
        if(this.enterData[i].typeName == 'Integer') {
          obj.type = 'inputNumber'
          obj.min = 0
        }
        if(this.enterData[i].necessary) {
          obj.rules = [
            { required: true, message: ('请输入' + this.enterData[i].info), trigger: 'blur' },
          ]
        }
        // 默认示例值
        if(this.enterData[i].example) {
          tf[obj.prop] = this.enterData[i].example
        }
        temp.push(obj)
      }
      this.testForm = tf
      this.testFormOption.column = temp
      this.testFormKey++
    }
  }
}
</script>
<style lang="scss" scoped>
.api-manage-info{
  position: relative;
  .close-icon {
    font-size: 16px;
    cursor: pointer;
  }
  .el-tabs{
    background: #fff;
    margin-top: 10px;
    padding: 10px 10px;
  }
  .info-form{
    p{
      display: flex;
      align-items: center;
      margin: 0;
      .el-form-item__label{
        width: 80px;
        white-space: nowrap;
      }
    }
  }
}
.children-table-body div span{
  white-space: pre-wrap;
}
.testBox{
  position: fixed;
  right: 0;
  top: 0;
  width: 0;
  height: 100%;
  z-index: 99;
  background-color: #fff;
  overflow: hidden;
  overflow-y: auto;
}
.testBox::-webkit-scrollbar{
  display: none;
}
.openTest{
  width: 400px;
  box-shadow: 0 0 10px #e5e5e5;
  padding: 10px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
</style>
<style lang="scss">
.api-manage-info{
  .pageheader-top{
    .pageheader-line{
      margin-left: 20px;
    }
    .title{
      margin-left: 16px;
    }
  }
  .info-form{
    margin-left: 40px;
  }
}
</style>
