<template>
  <div class="variable-design-content">
    <PageHeader title="变量设计" class="page-header">
      <div class="title-header">
        <p class="right-icon-close">
          <img :src="closeIcon" alt="" @click="handleClose(false)">
        </p>
        <p class="right-icon-save">
          <el-tooltip effect="dark" content="保存" placement="top">
            <img :src="saveIcon" alt="" @click="submitHandle">
          </el-tooltip>
        </p>
        <p class="right-icon-test">
          <el-tooltip effect="dark" content="测试" placement="top">
            <img :src="testIcon" alt="" @click="testHandle">
          </el-tooltip>
        </p>
      </div>
    </PageHeader>
    <div class="variable-design-box">
      <div class="left">
<!--        <div class="variable-design-top">-->
<!--          <div>-->
<!--            &lt;!&ndash; 风控规则/变量名称 &ndash;&gt;-->
<!--            <span>{{rowData.type == 'rule' ? '风控规则：' : '变量名称：'}}</span>-->
<!--            <span>{{rowData.name}}</span></div>-->
<!--          <div>-->
<!--            &lt;!&ndash; 详情/变量说明 &ndash;&gt;-->
<!--            <span>{{rowData.type == 'rule' ? '详情：' : '变量说明：'}}</span>-->
<!--            <span>{{rowData.remark}}</span></div>-->
<!--        </div>-->
        <div class="variable-design-center">
          <div class="center-left">
            <el-tree
              class="function-list-tree"
              :data="functionList"
              :props="defaultProps"
              accordion
              @node-click="handleNodeClick">
              <div class="custom-tree-node" slot-scope="{ node, data }">
                <el-tooltip class="item" effect="dark" :content="data.funcInfo" placement="top" v-if="data.funcInfo">
                  <span>{{node.label}}</span>
                </el-tooltip>
                <span v-else>{{node.label}}</span>
              </div>
            </el-tree>
          </div>
          <div class="center-right">
            <div class="variable-design-top">
              <div>
                <!-- 风控规则/变量名称 -->
                <span>{{rowData.type == 'rule' ? '风控规则：' : '变量名称：'}}</span>
                <span>{{rowData.name}}</span></div>
              <div>
                <!-- 详情/变量说明 -->
                <span>{{rowData.type == 'rule' ? '详情：' : '变量说明：'}}</span>
                <span>{{rowData.remark}}</span></div>
            </div>
            <!-- 富文本  函数设计器 -->
            <div id="functionEditor" style="font-size: 16px;"></div>
            <div class="help">
              <zebra-button type="text" @click="viewUrl">查看帮助</zebra-button>
            </div>
            <div class="iframeBox" v-if="openClose">
              <iframe :src="docUrl || 'https://thoughts.teambition.com/share/6131e9aeacc49900410f82ed#title=函数帮助文档'"></iframe>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div>
          <h4>变量引用</h4>
          <el-tabs v-model="activeName">
            <el-tab-pane label="事件中心" name="events">
              <zebra-form :option="eventsOption" :formData="eventsForm">
                 <template slot="eventParamForm">
                  <el-select 
                    style="width:100%;"
                    v-model="eventsForm.eventParam" 
                    multiple
                    filterable
                    @visible-change="handleBlurEvent"
                    @change="handleChangeEvent">
                    <el-option
                      v-for="item in eventParamsList"
                      :key="item.value"
                      :label="item.label"
                      :value="item">
                    </el-option>
                  </el-select>
                </template>
              </zebra-form>
            </el-tab-pane>
            <el-tab-pane label="接口出参" name="api">
              <zebra-form :option="quoteApiOption" :formData="quoteForm">
                <template slot="apiNameForm">
                  <el-select v-model="quoteForm.apiName" placeholder="接口名称" style="width: 100%;">
                    <el-option
                      v-for="(item, key) in apiListData"
                      :key="key"
                      :label="item.apiName"
                      :value="item.apiName">
                    </el-option>
                  </el-select>
                </template>
                 <template slot="resParamsForm">
                   <el-cascader
                      style="width:100%;"
                      v-model="quoteForm.resParams"
                      :options="resParamsList"
                      @visible-change="handleBlur"
                      @change="handleChange"
                       :props="props"></el-cascader>
                  <!-- <el-select v-model="quoteForm.resParams" multiple placeholder="接口出参" style="width: 100%;">
                    <el-option
                      v-for="item in resParamsList"
                      :key="item.absoluteKey"
                      :label="item.info"
                      :value="item.absoluteKey">
                    </el-option>
                  </el-select> -->
                </template>
              </zebra-form>
            </el-tab-pane>
            <el-tab-pane label="其他变量" name="other">
              <zebra-form :option="quoteOtherOption" :formData="quoteForm"></zebra-form>
            </el-tab-pane>
            <el-tab-pane label="python脚本" name="python">
              <zebra-form :option="pythonOption" :formData="pythonForm">
                <template slot="functionNameForm">
                  <el-select filterable v-model="pythonForm.functionName" placeholder="请选择函数名" style="width:100%;">
                    <el-option
                    v-for="item in functionNameList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </zebra-form>
            </el-tab-pane>
          </el-tabs>
          <zebra-button type="primary" @click="viewHandle" v-if="quoteForm.apiName && activeName != 'events'">查看接口出参</zebra-button>
        </div>
        <div id="selectedVar">
          <h4>已选变量</h4>
          <ul>
            <li v-for="(item, index) in selectedList" :key="item.name">
              <div v-if="item.type == 'variable' || item.type == 'eventParams' || item.type == 'functionNames'" >
                <el-tooltip class="item" effect="dark" :content="item.type == 'eventParams' ? `${item.eventNames}/${item.fieldChina}` : item.expression" placement="top" v-if="item.expression">
                  <span
                    :class="{'selectedItem': true, 'variable': item.type == 'variable', 'rule': item.type == 'api','reqParams':item.type=='reqParams','eventParams':item.type == 'eventParams','functionNames':item.type == 'functionNames'}"
                    @click="addVariableHandle(item)" @contextmenu="click1(item)">{{item.name}}
                  </span>
                </el-tooltip>
                <span
                  v-else
                  :class="{'selectedItem': true, 'variable': item.type == 'variable', 'rule': item.type == 'api','reqParams':item.type=='reqParams','eventParams':item.type == 'eventParams','functionNames':item.type == 'functionNames'}"
                  @click="addVariableHandle(item)" @contextmenu="click1(item)">{{item.name}}
                </span>
              </div>
              <div v-else>
                <!-- <el-tooltip class="item" effect="dark" :content="item.info" placement="top" v-if="item.info">
                  <span :class="{'selectedItem': true, 'variable': item.type == 'variable', 'rule': item.type == 'api','reqParams':item.type=='reqParams'}" @click="addVariableHandle(item)">{{item.apiName}}</span>
                </el-tooltip> -->
                 <el-tooltip class="item" effect="dark" :content="`${item.cfullName}/${item.apiName}`" placement="top" v-if="item.apiName">
                  <span
                    :class="{'selectedItem': true, 'variable': item.type == 'variable', 'rule': item.type == 'api','reqParams':item.type=='reqParams','eventParams':item.type == 'eventParams'}"
                    @click="addVariableHandle(item)" @contextmenu="click1(item)">{{item.info}}
                  </span>
                </el-tooltip>
                <span
                  v-else
                  :class="{'selectedItem': true, 'variable': item.type == 'variable', 'rule': item.type == 'api','reqParams':item.type=='reqParams','eventParams':item.type == 'eventParams'}"
                  @click="addVariableHandle(item)" @contextmenu="click1(item)">{{item.apiName}}
                </span>
              </div>
              <zebra-button size="mini" type='text' @click="delSelect(item, index)">删除</zebra-button>
            </li>
          </ul>
        </div>
      </div>
    </div>
<!--    <el-row class="variable-design-footer">-->
<!--      <zebra-button size="mini" type="info" @click="testHandle">测试</zebra-button>-->
<!--      <zebra-button size="mini" type="primary" :loading="subLoading" @click="submitHandle">确定</zebra-button>-->
<!--      <zebra-button size="mini" @click="handleClose(false)">取消</zebra-button>-->
<!--    </el-row>-->
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
        @reset="handleReset"
      >
        <template v-for="(item, key) in testOption.column" :slot="item.prop + 'Form'">
          <el-input
            v-if="item.type === 'input'"
            size="mini"
            v-model="testForm[item.prop]"
            :placeholder="item.placeholder"
            @focus="handleFocus(item.prop)"
            @blur="handleBlurItem(item.prop)"
          ></el-input>
          <el-input-number
            v-if="item.type === 'inputNumber'"
            style="width: 100%"
            size="mini"
            v-model="testForm[item.prop]"
            :placeholder="item.placeholder"
            @focus="handleFocus(item.prop)"
            @blur="handleBlurItem(item.prop)"
          ></el-input-number>
          <div v-if="selectContent === item.prop && selectList[item.prop].length > 0" class="select-content">
            <div class="select-item" v-for="(temp, tempKey) in selectList[item.prop]" :key="tempKey" @mousedown="handleSelect(item.prop, temp)">{{ temp }}</div>
          </div>
          <div v-if="selectContent === item.prop && selectList[item.prop].length === 0" class="select-content-null select-content">无历史数据</div>
        </template>
      </zebra-form>
      <zebra-button v-else size="mini" type="primary" @click="excuteHandle">测试</zebra-button>
      <div>
        <h4>测试结果</h4>
        <section v-html="returnResultJson"></section>
        <!-- <json-viewer
          style="overflow:auto;flex:1;min-height:200px;"
          :value="returnResultJson"
          :expand-depth="2000"
          copyable
          boxed
          sort
          ></json-viewer> -->
      </div>
    </el-dialog>
    <el-dialog
      v-if="dialogVisibleForm"
      :visible.sync="dialogVisibleForm"
      fullscreen
      class="no-header-dialog"
      append-to-body
      :before-close="handleCloseForm">
      <infoForm :detailInfo="detailInfo" @handleClose="handleCloseForm" />
    </el-dialog>
  </div>
</template>
<script>
import closeicon from "@/const/img/关闭.png"
import saveicon from "@/const/img/保存.png"
import testicon from "@/const/img/测试.png"
import PageHeader from '@/components/page-header/PageHeader'
import {
  addVariable,
  apiResParams,
  editVariable,
  getTestParams,
  otherVariableList,
  queryFunctionList,
  testVariable,
  getDocUrl,
  getEventsParamsList,
  getEventsNamesList,
  getPythonList
} from './api'
import {apiList} from '../apimanage/api'
import E from "wangeditor"
import infoForm from '@/views/apimanage/info'

export default {
  name: 'variable-design',
  components: {PageHeader,infoForm},
  props: {
    rowData: {
      type: Object
    },
    isFromModel: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      cfullName:'',
      selectList: {},
      tempData: {},
      selectContent: '',
        props:{
          multiple: true,
          value:'absoluteKey',
          label:'info',
          children:'list'
        },
       dialogVisibleForm: false,
       detailInfo:{},
      closeIcon: closeicon,
      saveIcon: saveicon,
      testIcon: testicon,
      // 帮助文档的显隐
      openClose:false,
      dialogVisible: false, // 显隐
      // 函数列表
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      functionList: [],
      functionNameList:[],
      // 变量引用
      activeName: 'events',
      quoteForm: {
        apiName: '',
        variableName: [],
        resParams:[]
      },
      pythonForm: {
        functionName: '',
      },
      eventsForm:{
        eventName:'',
        eventParam:[]
      },
      eventsOption: {
        btnHide: true,
        labelWidth: '80px',
        column: [
          {
            label: '事件名称',
            prop: 'eventName',
            type: 'select',
            dicUrl: '/mgr/risk/event/list',
            props: {
              label: 'eventName',
              value: 'id'
            },
            filterable:true,
          },
          {
            label: '入参',
            prop: 'eventParam',
            formSlot:true,
            type: 'select',
            dicData: []
          }
        ]
      },
      quoteApiOption: {
        btnHide: true,
        labelWidth: '80px',
        column: [
          {
            label: '数据源',
            prop: 'fullName',
            type: 'select',
            dicUrl: '/mgr/risk/api/secret/list',
            props: {
              label: 'systemName',
              value: 'shortName'
            }
          },
          {
            label: '接口名称',
            prop: 'apiName',
            type: 'select',
            formSlot:true,
            // multiple: true,
            dicData: []
          },
          {
            label: '接口出参',
            prop: 'resParams',
            formSlot:true,
            type: 'select',
            dicData: []
          }
        ]
      },
      quoteOtherOption: {
        btnHide: true,
        labelWidth: '80px',
        column: [
          {
            label: '变量选择',
            prop: 'variableType',
            type: 'select',
            dicData: [
              {label: '自有模型', value: 'model'},
              {label: '变量中心', value: 'center'}
            ],
            display: this.isFromModel, // 变量中心的没有自有模型
          },
          {
            label: '变量名称',
            prop: 'variableName',
            type: 'select',
            filterable: true,
            multiple: true,
            dicData: []
          }
        ]
      },
      pythonOption:{
        btnHide: true,
        labelWidth: '80px',
        column: [
          {
            label: '函数名',
            prop: 'functionName',
            formSlot:true,
          }
        ]
      },
      resParamsList:[],
      eventParamsList:[],
      variableCenterList: [], // 变量中心的列表
      editor: null, // 富文本编辑器
      // 已选变量
      selectedList: [],
      apiListData: [], // 接口列表
      firstTimes: -1, // 数据源change次数
      firstFlagApiName:true, //第一次请求api接口且有值
      otherTimes: -1, // 变量选择change次数
      // 测试
      testForm: {},
      testVisible: false,
      testLoading: false,
      testOption: {
        submitBtnText: '确定',
        // emptyBtn: false,
        formAlign: 'top',
        labelWidth: '100px',
        column: []
      },
      returnResultJson: null, // 测试结果
      vaId: '',
      subLoading: false,
      // 当前选中的接口名称
      currentApiName:"",
      docUrl: '', // 文档地址
      selectionDom:'',
      pasteDom:'',
      paramNameList:'',
      updateStatus:true
    }
  },
  methods: {
    getFunctionNameList(){
      getPythonList({apiName:'',shortName:''}).then(res => {
        this.functionNameList = res.data.data.map(el => {
          return {
            label:el.functionName,
            value:el.id
          }
        })
      })
    },
    handleBlur(e) {
      if (!e) {
        this.quoteForm.resParams = []
      }
    },
    handleBlurEvent(e){
      if (!e) {
        this.eventsForm.eventParam = []
      }
    },
    handleChange() {
    },
    handleChangeEvent(val){
      val.map(el => {
        const bool = this.isInArr(el.value, 'id', this.selectedList)
        if(!bool){
          this.selectedList.push({
            name:el.label,
            expression:el.expression,
            type:'eventParams',
            id:el.value,
            eventNames:el.eventNames,
            fieldChina:el.fieldChina
          })
        }
      })
    },
    async getParamName(){
      const res = await getEventsNamesList()
      this.paramNameList = res.data.data
    },
    async init () {
      this.getParamName()
      this.getFunctionList()
      this.firstFlagApiName = true
      let temp = {}
      // 绑定的变量
      if(this.rowData.bindStatus == true) {
        temp = this.rowData.riskVariable
      }else{
        temp = this.rowData
      }
      if(temp.id) {
        this.vaId = temp.id
      }
      // 变量中心的数据
      if(!this.isFromModel) {
        await this.getVariableCenterList()
      }else{
        // {projectId: this.rowData.projectId}
        await this.getVariableCenterList({}, false)
      }
      this.initData()
    },
    // 赋值
    initData () {
      let temp = {}
      // 绑定的变量
      if(this.rowData.bindStatus == true) {
        temp = this.rowData.riskVariable
      }else{
        temp = this.rowData
      }
      if(temp.details) {
        let obj = JSON.parse(temp.details)
        if(obj.quoteForm) {
          obj.quoteForm.fullName && this.$set(this.quoteForm, 'fullName', obj.quoteForm.fullName)
          obj.quoteForm.apiName && this.$set(this.quoteForm, 'apiName', obj.quoteForm.apiName)
          obj.quoteForm.resParams && this.$set(this.quoteForm, 'resParams', obj.quoteForm.resParams)
          obj.quoteForm.variableType && this.$set(this.quoteForm, 'variableType', obj.quoteForm.variableType)
          obj.quoteForm.variableName && this.$set(this.quoteForm, 'variableName', obj.quoteForm.variableName)
          if(obj.pythonForm.functionName){
            this.$set(this.pythonForm, 'functionName', obj.pythonForm.functionName)
            this.updateStatus = false
          }
        }
        if(obj.eventsForm){
          let bool = false
          this.paramNameList.map(el => {
            if(el.id == obj.eventsForm.eventName){
              bool = true
            }
          })
          bool && obj.eventsForm.eventName && this.$set(this.eventsForm, 'eventName', obj.eventsForm.eventName)
        }
        if(obj.pythonForm){
          if(!this.functionNameList.find(el => el.value == obj.pythonForm.functionName)){
            this.$set(this.pythonForm, 'functionName', '')
          }
        }
        obj.activeName && (this.activeName = obj.activeName)
        if(obj.selectedList) {
          for(let i in obj.selectedList) {
            let item = this.getItemOfList(obj.selectedList[i].id, 'id', this.variableCenterList)
            if(item) {
              obj.selectedList[i].name = item.name
              obj.selectedList[i].expression = item.expression
              obj.selectedList[i].remark = item.remark
            }
          }
          this.selectedList = obj.selectedList
          this.$nextTick(() => {
            this.quoteForm.resParams = []
          })
        }
      }else{
        this.quoteForm.apiName =  ''
        this.quoteForm.resParams = []
        this.quoteForm.variableName = []
        this.selectedList = []
      }
      if(temp.exprDetails) {
        this.formatHtml(temp.exprDetails)
      }
      // this.getReqParams()
      this.$forceUpdate()
    },
    // 关闭组件弹框
    handleClose (bool) {
      this.editor.destroy()
      this.$emit('close', bool)
    },
    // 点击函数
    handleNodeClick(data) {
      // console.log(data);
      if(data.value) {
        // this.editor.cmd.do('insertHTML', `<p class="functionItem" data-value="${data.label}">${data.value}( )</p>`)
        this.editor.cmd.do('insertHTML', `<p data-value="${data.label}">${data.value}( )</p>`)
      }
    },
    // 获取变量中心的变量列表
    async getVariableCenterList (obj, needSet) {
      this.quoteOtherOption.column.filter(item => {
        if(item.prop == 'variableName') {
          item.dicData = []
        }
      })
      await otherVariableList(obj).then(res => {
        if(res.data.code == 0) {
          this.variableCenterList = res.data.data
          if(needSet !== false){
            this.quoteOtherOption.column.filter(item => {
              if(item.prop == 'variableName') {
                let temp = []
                for(let i in res.data.data) {
                  if(res.data.data[i].id != this.vaId) {
                    temp.push(res.data.data[i])
                  }
                }
                item.dicData = temp
                item.props = {
                  label: 'name',
                  value: 'id'
                }
              }
            })
          }
        }
      })
    },
    // 初始化富文本
    initEditor () {
      let _this = this
      if(this.editor) {
        this.editor.destroy()
      }
      _this.editor = new E('#functionEditor')
      _this.editor.config.height = window.innerHeight - 102
      _this.editor.config.uploadImgShowBase64 = true
      _this.editor.config.menus = []
      _this.editor.config.onblur = function (newHtml) {
      }
      _this.editor.config.onchange = function (newHtml) {
      }
      _this.editor.config.onSelectionChange  = function (newSelection) {
        _this.selectionDom = newSelection.html
      }
      _this.editor.config.pasteTextHandle = function (pasteStr) {
        let str = null
        if(_this.pasteDom){
          const expImg = /<img.+?>/g
          const expB = /(<b[^\/]*?>)/gi
          const matchArrImg = _this.pasteDom.match(expImg)
          const matchArrB = _this.pasteDom.match(expB).filter(v => v.indexOf('br') == -1)
          let numImg = -1
          let numB = -1
          str = pasteStr.replace(expImg,()=>{
            numImg++
            return matchArrImg[numImg]
          }).replace(expB,()=>{
            numB++
            return matchArrB[numB] || '<br>'
          })
        }
        _this.selectionDom = ''
        return _this.editor.cmd.do('insertHTML', (str || pasteStr))
      }
      _this.editor.create()

      if(_this.rowData) {
        let temp = _this.rowData
        if(_this.rowData.bindStatus == true) {
          temp = _this.rowData.riskVariable
        }
        if(temp.exprDetails) {
          _this.editor.txt.html(temp.exprDetails)
        }
      }
      this.$forceUpdate()
    },
    // 同步富文本内容html
    formatHtml (htmlString) {
      let div = document.createElement('div')
      div.innerHTML = htmlString
      for(let i in div.children) {
        for(let j in div.children[i].children) {
          if(div.children[i].children[j].className && div.children[i].children[j].className.includes('variable')) {
            if(div.children[i].children[j].dataset && div.children[i].children[j].dataset.id) {
              let item = this.getItemOfList(div.children[i].children[j].dataset.id, 'id', this.selectedList)
              if(item) {
                div.children[i].children[j].innerHTML = item.name
                div.children[i].children[j].dataset.expression = item.expression
              }
            }
          }
        }
      }
      if(this.editor) {
        this.editor.txt.html(div.innerHTML)
      }
    },
    drawLogo(text, font, type, unuse) {
      // 创建画布
      let canvas = document.createElement('canvas');
      // 绘制文字环境
      let context = canvas.getContext('2d');
      // 获取字体宽度
      let width = context.measureText(text).width;
      width = width + 30;
      // 画布宽度
      canvas.width = width;
      // 画布高度
      canvas.height = 28;
      // 填充白色
      context.fillStyle = type === 'variable' ? '#67C23A' : type === 'eventParams' ? '#f1bc29' : type === 'functionNames' ? 'purple' : '#409EFF';
      context.fillStyle = unuse ? '#b8b8b8' : context.fillStyle;
      // 绘制文字之前填充白色
      context.fillRect(0, 0, canvas.width, canvas.height);
      // 设置字体
      context.font = '16px Calibri';
      // 设置水平对齐方式
      context.textAlign = 'center';
      // 设置垂直对齐方式
      context.textBaseline = 'middle';
      // 设置字体颜色
      context.fillStyle = '#ffffff';
      // 绘制文字（参数：要写的字，x坐标，y坐标）
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      // 生成图片信息
      return canvas.toDataURL('image/png');
    },
    click1(item) {
      if(item.type == 'eventParams') return
      const fontStyle = 'normal 16px'
      // let className = (item.type == 'variable') ? 'selectedItem variable' : 'selectedItem rule'
      let className = 'varStyle'
      let html = ''
      if(item.type == 'variable') {
        const imgSrc = this.drawLogo(item.name, fontStyle, item.type, true)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}"><img title="${item.name}" src="${imgSrc}" data-unused="${true}" data-expression="${item.expression}" data-id="${item.id}"/><span style="display: none">${item.name}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else if(item.type == 'reqParams'){
        const imgSrc = this.drawLogo(item.info, fontStyle, undefined, true)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}""><img title="${item.info}" src="${imgSrc}" data-unused="${true}" data-type="reqParams" data-apiName="${item.apiName}" data-absoluteKey="${item.absoluteKey}"  data-shortname="${item.shortName}"/><span style="display: none">${item.info}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else if(item.type == 'eventParams'  || item.type == 'functionNames') {
        const imgSrc = this.drawLogo(item.name, fontStyle, item.type, true)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}"><img title="${item.name}" src="${imgSrc}" data-type="eventParams" data-unused="${true}" data-expression="${item.type == 'eventParams' ? item.expression : item.id}" data-id="${item.id}"/><span style="display: none">${item.name}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else{
        const imgSrc = this.drawLogo(item.apiName, fontStyle, undefined, true)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}" ><img title="${item.info}" src="${imgSrc}" data-unused="${true}" data-shortname="${item.shortName}"/><span style="display: none">${item.apiName}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }
      this.editor.cmd.do('insertHTML', html)
    },
    // 富文本添加 变量
    addVariableHandle (item) {
      const fontStyle = 'normal 16px'
      // let className = (item.type == 'variable') ? 'selectedItem variable' : 'selectedItem rule'
      let className = 'varStyle'
      let html = ''
      if(item.type == 'variable') {
        console.log(item)
        const imgSrc = this.drawLogo(item.name, fontStyle, item.type)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}"><img title="${item.name}" src="${imgSrc}" data-expression="${item.expression}" data-id="${item.id}"/><span style="display: none">${item.name}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else if(item.type == 'reqParams'){
        const imgSrc = this.drawLogo(item.info, fontStyle)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}""><img title="${item.info}" src="${imgSrc}" data-type="reqParams" data-apiName="${item.apiName}" data-absoluteKey="${item.absoluteKey}"  data-shortname="${item.shortName}"/><span style="display: none">${item.info}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else if(item.type == 'eventParams' || item.type == 'functionNames') {
        const imgSrc = this.drawLogo(item.name, fontStyle, item.type)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}"><img title="${item.name}" src="${imgSrc}" data-type="eventParams" data-expression="${item.type == 'eventParams' ? item.expression : item.id}" data-id="${item.id}"/><span style="display: none">${item.name}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }else{
        const imgSrc = this.drawLogo(item.apiName, fontStyle)
        html = `<span style="font-size: 16px;">&nbsp;</span><b class="${className}" ><img title="${item.info}" src="${imgSrc}" data-shortname="${item.shortName}"/><span style="display: none">${item.apiName}</span></b><span style="font-size: 16px;">&nbsp;</span>`
      }
      this.editor.cmd.do('insertHTML', html)
    },
    // 删除已选变量
    delSelect (item, index) {
      this.selectedList.splice(index, 1)
    },
    // 变量是否已选择
    isInArr (val, attr, list) {
      let bool = false
      for(let i in list) {
        if(list[i][attr] == val) {
          bool = true
        }
      }
      return bool
    },
    // 查询接口列表
    getApiList (obj) {
      apiList(obj).then(res => {
        if(res.data.code == 0) {
          this.apiListData = res.data.data.records
          if(this.quoteForm.apiName && this.firstFlagApiName){
            for(let i in this.apiListData) {
              if(this.quoteForm.apiName === this.apiListData[i].cls){
                this.currentApiName = this.apiListData[i].apiName
                break
              }
            }
            // console.log(this.quoteForm)
            // 注掉的部分时接口多选的逻辑
            if(this.currentApiName){
              this.apiResParams({shortName:this.quoteForm.fullName,apiName: this.currentApiName, current: 1, size: 10000})
            }
          }
          this.firstFlagApiName = false
          this.quoteApiOption.column.filter(item => {
            if(item.prop == 'apiName') {
              item.dicData = res.data.data.records
              item.props = {
                label: 'apiName',
                value: 'cls'
              }
            }
          })
        }
      })
    },
    // 确定
    submitHandle () {
      if (this.editor.txt.text().trim().length === 0) {
        this.editor.txt.clear()
      }
      let obj = {}
      if(this.rowData.bindStatus == true) {
        obj = JSON.parse(JSON.stringify(this.rowData.riskVariable))
      }else{
        obj = JSON.parse(JSON.stringify(this.rowData))
      }
      obj.exprDetails = this.editor.txt.html()
      if(obj.exprDetails && obj.exprDetails.trim() !== '') {
        let detailObj = {
          quoteForm: this.quoteForm,
          selectedList: this.selectedList,
          eventsForm:this.eventsForm,
          activeName:this.activeName,
          pythonForm:this.pythonForm
        }
        obj.details = JSON.stringify(detailObj)
        obj.expression = this.getExpressStr()
        // 测试数据
        if(this.returnResultJson) {
          obj.testDemo = this.returnResultJson
        }
        // 模型绑定传值ruleId
        if(this.isFromModel) {
          obj.ruleId = this.rowData.id
        }
        this.subLoading = true
        // 绑定变量调新增接口
        if(this.rowData.bindStatus == false) {
          obj.id = null
          addVariable(obj).then(res => {
            if(res.data.code == 0) {
              this.$message.success('绑定成功')
              this.handleClose(true)
              this.subLoading = false
            }
          }).catch(e => {
            this.subLoading = false
          })
        }else{
          // return false
          editVariable(obj).then(res => {
            if(res.data.code == 0) {
              this.$message.success('修改成功')
              this.handleClose(true)
              this.subLoading = false
            }
          }).catch(e => {
            this.subLoading = false
          })
        }
      }else{
        this.$message.warning('表达式不能为空')
      }
    },
    // 根据富文本生成表达式
    getExpressStr () {
      let result = ''
      let tempExp = []
      let dom = $('#functionEditor .w-e-text-container .w-e-text')[0]
      if(dom && dom.childNodes && dom.childNodes.length > 0) {
        let variList = dom.childNodes
        for(let i in variList) {
          let str = ''
          if(variList[i].childNodes && variList[i].childNodes.length > 0) {
            for(let j in variList[i].childNodes) {
              if(variList[i].childNodes[j].className && variList[i].childNodes[j].className.includes('varStyle') && variList[i].childNodes[j].dataset) {
                // 接口
                const arr = [...variList[i].childNodes[j].childNodes]
                for (let p in arr) {
                  if(arr[p].dataset && arr[p].dataset.shortname) {
                    if(arr[p].dataset.type=='reqParams'){
                      str += arr[p].dataset.unused ?
                        ('"${'+ arr[p].dataset.shortname+':'+arr[p].dataset.apiname+':'+ arr[p].dataset.absolutekey+'}"') :
                        ('${'+ arr[p].dataset.shortname+':'+arr[p].dataset.apiname+':'+ arr[p].dataset.absolutekey+'}')
                    }else{
                      str += ('${'+ arr[p].dataset.shortname+':'+ arr[p].innerText+'}')
                    }
                    // 变量
                    // if(variList[i].childNodes[j].dataset.expression && ['undefined', 'null', ''].indexOf(variList[i].childNodes[j].dataset.expression ) == -1 ) {
                    //   str += (' ' + variList[i].childNodes[j].dataset.expression + ' ')
                    // }
                    if(arr[p].dataset.id && ['undefined', 'null', ''].indexOf(arr[p].dataset.id ) == -1 ) {
                      str += ('${var:' + arr[p].dataset.id + '}')
                    }
                  } else if (arr[p].dataset && arr[p].dataset.expression) {
                    if(arr[p].dataset.type == 'eventParams'){
                      str += arr[p].dataset.expression
                    }else{
                      str += arr[p].dataset.unused ?
                        ('"${var:' + arr[p].dataset.id + '}"') :
                        ('${var:' + arr[p].dataset.id + '}')
                      // str += ('${var:' + arr[p].dataset.id + '}')
                    }
                  } else if (arr[p].style === undefined) {
                    str += ('' + arr[p].textContent + '')
                  }
                }
              }else{
                if(variList[i].childNodes[j].textContent) {
                  str += ('' + variList[i].childNodes[j].textContent + '')
                }
              }
            }
          }
          tempExp.push(str)
        }
      }
      result = tempExp.join(' ')
      // console.log(result)
      return result
    },
    // 是否包含函数名
    isIncludeFunctionName (val) {
      let bool = false
      val = val.replace(/^\s*|\s*$/g,"")
      for(let i in this.functionList) {
        if(this.functionList[i].children && this.functionList[i].children.length > 0) {
          for(let j in this.functionList[i].children) {
            if(val.includes(this.functionList[i].children[j].label)) {
              bool = true
            }
          }
        }
      }
      return bool
    },
    // 开启测试  获取表单结构
    testHandle () {
      this.testForm = {}
      // 表单配置
      let str = this.getExpressStr()
      // console.log(str)
      // return
      getTestParams({expression: str, varNo: this.rowData.no}).then(res => {
        if(res.data.code == 0) {
          // if(!res.data.data || res.data.data.length == 0) {
          //   this.$message.warning("未配置完整，不能执行测试！")
          //   return false
          // }
          if(res.data.data) {
            let temp = []
            let defaultDemo = {}
            const obj = {}
            res.data.data.forEach(item => {
              obj[item.key] = item.historyInput || []
            })
            this.selectList = JSON.parse(JSON.stringify(obj))
            for(let i in res.data.data) {
              let obj = {
                label: res.data.data[i].info + '  (' + res.data.data[i].key + ')',
                prop: res.data.data[i].key,
                formSlot: res.data.data[i].type !== 'Date',
                typeName: res.data.data[i].typeName
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
                { required: res.data.data[i].necessary, message: '请输入' + obj.placeholder, trigger: 'change' },
              ]
              if(res.data.data[i].example) {
                defaultDemo[obj.prop] = res.data.data[i].example
              }
              temp.push(obj)
            }
            // this.testForm = defaultDemo
            this.testOption.column = temp
          } else {
            this.testOption.column = []
          }
          this.testVisible = true
        }
      })
    },
    // 测试表单-输入历史记录选择
    handleSelect(key, value) {
      this.$set(this.testForm, key, value)
      this.selectContent = ''
    },
    // 获取焦点
    handleFocus(prop) {
      this.selectContent = prop
    },
    // 失焦
    handleBlurItem() {
      this.selectContent = ''
    },
    // 重置
    handleReset() {
      this.testForm = {}
    },
    // 测试
    excuteHandle (form) {
      const obj = JSON.parse(JSON.stringify(this.testForm))
      // console.log(obj)
      // return false
      const reqParams = typeof form !== 'object' ? {} : form
      this.testOption.column.map(el => {
        if(el.typeName == 'Integer' || el.typeName == 'Double'){
          reqParams[el.prop] = Number(reqParams[el.prop])
        }
      })
      this.testLoading = true
      let str = this.getExpressStr()
      testVariable({expression: str, reqParams, varNo: this.rowData.no}).then(res => {
        if(res.data.code == 0) {
          // this.$message.success('测试通过')
          // this.testClose()
          this.testLoading = false
          this.returnResultJson = res.data.data
        }
      })
    },
    //关闭测试
    testClose () {
      this.testVisible = false
      this.returnResultJson = null
      this.selectContent = ''
    },
    // 获取函数列表
    getFunctionList () {
      queryFunctionList().then(res => {
        if(res.data.code == 0) {
          this.functionList = res.data.data.children
          this.formatList(this.functionList)
        }
      })
    },
    // 格式化函数列表
    formatList (list) {
      for(let i in list) {
        if(list[i].funcType) {
          list[i].label = list[i].funcType
        }
        if(list[i].funcName) {
          list[i].label = list[i].funcName
          list[i].value = list[i].funcName
        }
        if(list[i].children) {
          this.formatList(list[i].children)
        }
      }
    },
    // 获取列表项
    getItemOfList (val, attr, list) {
      for(let i in list) {
        if(list[i][attr] == val) {
          return list[i]
        }
      }
      return false
    },
    // 获取接口出参
    apiResParams(data){
      apiResParams(data).then(res=>{
        // this.resParamsList.push(...res.data.data)
        this.resParamsList = res.data.data
        this.setResParams()
      })
    },
    // 设置出参下拉列表
    setResParams(){
      this.quoteApiOption.column.filter(item => {
        if(item.prop == 'resParams') {
          item.dicData =this.resParamsList
          item.props = {
            label: 'info',
            value: 'absoluteKey'
          }
        }
      })
    },
    // 打开接口出参页面
    viewHandle () {
      this.detailInfo = {
        apiName:this.currentApiName,
        shortName:this.quoteForm.fullName
      }
      this.dialogVisibleForm = true
    },
    // 关闭组件弹框
    handleCloseForm (bool) {
      this.dialogVisibleForm = false
    },
    viewUrl () {
      getDocUrl().then(res => {
        if(res.data && res.data.code == 0 && res.data.data) {
          this.docUrl = res.data.data
          this.openClose = !this.openClose
        }
      })
    },
    handleKeyPress(e){
      const key = e.keyCode
      const ctrl = e.ctrlKey
      if((key == '67' || key == '88') && ctrl){
        this.pasteDom = this.selectionDom
      }
    }
  },
  created () {
    if (this.rowData.testData) {
      this.tempData = JSON.parse(this.rowData.testData)
    }
    this.init()
  },
  mounted () {
    this.$nextTick(() => {
      this.initEditor()
      document.getElementById('selectedVar').oncontextmenu=function () {return false} // 禁用鼠标右击事件
      this.getFunctionNameList()
    })
    document.addEventListener('keyup',this.handleKeyPress)
  },
  destroyed(){
    document.removeEventListener('keyup',this.handleKeyPress)
  },
  watch: {
    // 数据源切换
    'quoteForm.fullName': {
      handler(newVal, oldVal) {
        if(newVal) {
          this.currentApiName = ''
          this.getApiList({fullName: newVal, current: 1, size: 10000})
          if(this.firstTimes > -1) {
            this.quoteForm.apiName = ''
            this.quoteForm.resParams = []
          }
          this.resParamsList = []
          this.firstTimes += 1
        }
      }
    },
    'quoteForm.apiName': {
      handler(newVal, oldVal) {
        if(newVal) {
          if(!this.firstFlagApiName){
            this.quoteForm.resParams = []
          }
          // 获取接口名称
          for(let i in this.apiListData) {
            // if(diff.indexOf(this.apiListData[i].cls) > -1) {
            if(newVal === this.apiListData[i].apiName){
              this.currentApiName = this.apiListData[i].apiName
              this.cfullName = this.apiListData[i].fullName
              break
            }
          }
          // 注掉的部分时接口多选的逻辑
          // if(newVal.length>0 && newVal.length>oldVal.length && apiName) {
          if(this.currentApiName){
            this.apiResParams({shortName:this.quoteForm.fullName,apiName: this.currentApiName, current: 1, size: 10000})
          }
        }
      }
    },
    // 选择变量
    'quoteForm.resParams':{
      handler (newVal, oldVal) {
        if(newVal){
          // console.log(newVal)
          newVal.forEach(item => {
            let newReqList = JSON.parse(JSON.stringify([...this.resParamsList]))
            item.forEach(itemss=>{
              newReqList.forEach(items=>{
                if(itemss == items.absoluteKey ){
                  if(items.list && items.list.length>0){
                    newReqList = JSON.parse(JSON.stringify(items.list))
                  }else{
                    let bool = this.isInArr(items.absoluteKey, 'absoluteKey', this.selectedList)
                    if(!bool) {
                      let obj = JSON.parse(JSON.stringify(items))
                      obj.type = 'reqParams'
                      obj.apiName = this.currentApiName
                      obj.shortName = this.quoteForm.fullName
                      obj.cfullName = this.cfullName
                      this.selectedList.push(obj)
                    }
                  }
                }
              })
            })
          });
          // for(let i in newReqList){
          //   if(item.indexOf(this.resParamsList[i].absoluteKey)>-1){
          //     let bool = this.isInArr(this.resParamsList[i].absoluteKey, 'absoluteKey', this.selectedList)
          //     if(!bool) {
          //       let obj = JSON.parse(JSON.stringify(this.resParamsList[i]))
          //       obj.type = 'reqParams'
          //       obj.apiName = this.currentApiName
          //       obj.shortName = this.quoteForm.fullName
          //       this.selectedList.push(obj)
          //     }
          //   }
          // }
        }
      }
    },
    // 变量选择方式
    'quoteForm.variableType' : {
      handler (newVal, oldVal) {
        if(newVal == 'model') {
          // 自有模型的列表
          this.getVariableCenterList({projectId: this.rowData.projectId})
        }
        if(newVal == 'center') {
          // 变量中心的数据
          this.getVariableCenterList()
        }
        if(newVal) {
          if(this.otherTimes > -1) {
            this.quoteForm.variableName = []
          }
          this.otherTimes += 1
        }
      }
    },
    // 选择变量
    'quoteForm.variableName': {
      handler (newVal, oldVal) {
        for(let i in this.variableCenterList) {
          if(newVal.indexOf(this.variableCenterList[i].id) > -1) {
            let bool = this.isInArr(this.variableCenterList[i].id, 'id', this.selectedList)
            if(!bool) {
              let obj = JSON.parse(JSON.stringify(this.variableCenterList[i]))
              obj.type = 'variable'
              this.selectedList.push(obj)
              // console.log(this.selectedList)
            }
          }
        }
      }
    },
    'eventsForm.eventName':{
      handler(newVal){
        if(newVal){
          getEventsParamsList(newVal).then(res => {
            this.eventParamsList = res.data.data.map(el => {
              return {
                value:el.id,
                label:`${el.fieldEnglish}/${el.fieldChina}`,
                describe:el.fieldDescribe,
                expression:el.fieldExpression,
                eventNames:el.eventName,
                fieldChina:el.fieldChina
              }
            })
          })
        }
      }
    },
    'pythonForm.functionName':{
      handler(newVal){
        if(newVal){
          this.updateStatus && this.functionNameList.map(el => {
            if(el.value == newVal){
              this.selectedList.push({
                name:el.label,
                expression:el.label,
                type:'functionNames',
                id:el.value,
                eventNames:el.label,
              })
            }
          })
          this.updateStatus = true
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/deep/.el-input-number .el-input__inner{
  text-align: left;
}
.select-content-null{
  text-align: center;
  color: #c4c4cc;
}
.select-content {
  background-color: #ffffff;
  margin-top: 8px;
  position: absolute;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  border: 1px solid #E4E7ED;
  width: 100%;
  padding: 6px 0;
  z-index: 2;
  .select-item{
    padding: 4px 20px;
    cursor: pointer;
    z-index: 2;
  }:hover{
  background-color: #F5F7FA;
     }
}
.variable-design{
  .variable-design-box{
    display: flex;
    margin-top: 10px;
    box-sizing: border-box;
    margin-left: 10px;
    padding-right: 10px;
  }
  .left{
    flex: 1;
    .variable-design-top{
      display: flex;
      justify-content: space-between;
      align-items: center;
      div{
        //margin-right: 40px;
        span{
           //margin-right: 10px;
          font-size: 13px;
        }
      }
    }
    .variable-design-center{
      display: flex;
      .center-left{
        width: 20%;
        margin-right: 10px;
      }
      .center-right{
        .variable-design-top{
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          div{
            span{
              font-size: 13px;
            }
          }
        }
        flex: 1;
        //margin-top: 8px;
        position: relative;
        .help{
          z-index:999999;
          position:absolute;
          right:8px;
          bottom:0px;
        }
        .iframeBox{
          z-index: 999998;
          // background-color: rgba(0,0,0,0.1);
          position: absolute;
          top:0px;
          right: 8px;
          bottom: 0px;
          width: 100%;
          height: 100%;
          margin: auto;
          left: 0px;
          iframe{
            background-color: #fff;
            border:none;
            position: absolute;
            width: 80%;
            height: 80%;
            top:0px;
            right: 8px;
            bottom: 0px;
            margin: auto;
            left: 0px;
          }
        }
      }
    }
  }
  .right{
    width: 25%;
    margin-left: 10px;
    div{
      h4{
        margin: 0;
      }
      ul{
        padding: 0;
        li{
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .selectedItem{
            cursor: pointer;
            display: block;
          }
        }
      }
    }
  }
  .variable-design-footer{
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
<style lang="scss">
.no-header-dialog-variable{
  .el-dialog__header{
    padding: 0;
  }
  .el-dialog__body{
    padding-top: 0;
    padding: 0;
    // 变量的显示
    .varStyle{
      font-weight: normal;
      font-size: 16px;
    }
    .selectedItem{
      height: 24px;
      line-height: 24px;
      padding: 0 10px;
      border-radius: 5px;
      color: #fff;
    }
    .selectedItem.variable{
      background:  #67C23A;
    }
    .selectedItem.rule{
      background: #409EFF;
    }
    .selectedItem.reqParams{
      background: #409EFF;
    }
    .selectedItem.eventParams{
      background: #f1bc29;
    }
    .selectedItem.functionNames{
      background: purple;
    }
  }
}
.variable-design{
  .left{
    .variable-design-center{
      .center-left{
        height: calc(100vh - 80px);
        overflow: auto;
        margin-top: 4px;
        background-color: #f6f6f6;
        .function-list-tree{
          //background: #f9f9f9;
          background-color: #f6f6f6;
          .el-tree-node{
            //background: #f9f9f9;
            //border: solid 1px rgb(220, 223, 230);
            //margin: 10px 0;
            .el-tree-node__content {
              height: 32px;
              line-height: 32px;
              .el-tree-node__expand-icon{
                margin-right: 6px;
              }
            }
            .el-tree-node__content:hover{
              background: #409EFF;
              //background: rgb(238, 238, 238);;
              color: #fff;
            }
          }
        }
      }
      ::-webkit-scrollbar {
        display: none; /* Chrome Safari */
      }
    }
  }
  #functionEditor{
    .w-e-toolbar{
      display: none;
    }
    .w-e-text-container{
      border-top: 1px solid #c9d8db!important;
    }
    .w-e-text p, .w-e-text h1, .w-e-text h2, .w-e-text h3, .w-e-text h4, .w-e-text h5, .w-e-text table, .w-e-text pre {
      //height: 28px;
      //line-height: 28px;
      //display: inline-flex;
    }
    .w-e-text img {
      vertical-align: middle;
      border-radius: 6px;
    }:hover{
       box-shadow: none;
     }
  }
}
.variable-design-content{
  .el-card{
    .el-card__body{
      .pageheader-top{
        margin-left: 20px;
        .title{
          margin-left: 16px;
        }
      }
    }
  }
  .page-header{
    position: relative;
    .title-header{
      position: absolute;
      right: 0;
      top: 0;
      height: 45px;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      .right-icon-close{
        padding: 0 17px;
        width: 18px;
        height: 18px;
        cursor: pointer;
        border-left: 1px solid #DCDFE6;
        img{
          width: 18px;
          height: 18px;
        }
      }
      .right-icon-save {
        cursor: pointer;
        width: 20px;
        height: 20px;
        padding: 0 17px;
        border-left: 1px solid #DCDFE6;
        img{
          width: 20px;
          height: 20px;
        }
      }
      .right-icon-test {
        cursor: pointer;
        width: 20px;
        height: 20px;
        padding: 0 17px;
        img{
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}
</style>
