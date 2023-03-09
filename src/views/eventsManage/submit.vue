<template>
    <PageHeader :title="title" style="padding: 0 30px">
    <div class="events-box">
      <div style="position: absolute; right: 20px; top: 20px">
        <i class="el-icon-close close-icon" @click="$router.back()"/>
      </div>
      <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="事件名称：" prop="eventName" style="width: 500px;">
          <el-input v-if="unitStatus != 1" size="small" v-model="form.eventName" placeholder="请输入事件名称"></el-input>
          <span v-else>{{form.eventName}}</span>
        </el-form-item>
        <el-form-item label="事件编码：" prop="eventCode" style="width: 500px;">
          <el-input v-if="unitStatus != 1" size="small" maxlength="64" v-model="form.eventCode" placeholder="请输入事件编码" @input="validFieldEnglish" show-word-limit></el-input>
          <span v-else>{{form.eventCode}}</span>
        </el-form-item>
        <el-form-item label="描述：" style="width: 500px;">
          <el-input
             v-if="unitStatus != 1"
            type="textarea"
            :rows="2"
            placeholder="请输入描述"
            v-model="form.eventDescribe">
          </el-input>
          <span v-else>{{form.eventDescribe}}</span>
        </el-form-item>
        <el-form-item label="模板：">
          <el-input v-if="unitStatus != 1" size="small" v-model="form.eventHistoryName" placeholder="可选择历史相似事件作为模板" :disabled="true" style="width: 400px;margin-right: 20px;"></el-input>
          <span v-else>{{form.eventHistoryName}}</span>
          <zebra-button v-if="unitStatus != 1" size="mini" @click="handleTemp">选择</zebra-button>
          <zebra-button v-if="unitStatus != 1" size="mini" @click="clear">清空事件及下方表格</zebra-button>
        </el-form-item>
        <div style="text-align: right;padding-right: 20px;">
          <zebra-button type="text" @click="handleResponse">返回参数</zebra-button>
          <zebra-button v-if="unitEventStatus" type="text" @click="exportEvent">导出接口文档</zebra-button>
        </div>
        <zebra-table
            :loading="loading"
            :option="option"
            :data="tableData"
            class="submitTables"
            >
            <template slot="paramsName" slot-scope="scope">
              <div v-if="scope.row.fieldSource == '1' || unitStatus == 1">{{`${scope.row.fieldEnglish}/${scope.row.fieldChina}`}}</div>
              <el-select
                v-else
                size="small"
                v-model="scope.row.paramsName"
                filterable
                remote
                :remote-method="remoteMethod"
                :loading="loadingOptions"
                @change="(val)=>handleSelect(val,scope.index)"
                @visible-change="visibleChange"
                :popper-class="paramListData.filter(v => v.type).length ? '' : 'customPoper'">
                <el-option
                  v-for="item in paramListData"
                  :key="item.id"
                  :label="item.value"
                  :value="item"
                  :style="{'width':`${getTableColumn}px`}">
                  <div v-if="!item.type" class="cuntomOptions">
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{item.value}}</span>
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{getFieldType(item.fieldType)}}</span>
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{item.fieldRequired === true ? '是' : item.fieldRequired === false ? '否' : ''}}</span>
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{item.fieldLength}}</span>
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{item.fieldDescribe}}</span>
                    <span :style="{'width':`${getTableColumn / 6}px`}">{{item.fieldSource == '2' ? '自定义字段' : '系统字段'}}</span>
                  </div>
                </el-option>
              </el-select>
            </template>
            <template slot="fieldRequired" slot-scope="scope">
              <span>{{scope.row.fieldRequired === true ? '是' : scope.row.fieldRequired === false ? '否' : ''}}</span>
            </template>
            <template slot="menu" slot-scope="scope">
              <template v-if="scope.row.fieldSource != '1' && unitStatus != 1">
                <div class="actionMenu">
                  <i class="el-icon-edit" @click="editForm(scope.row,scope.index)"></i>
                  <i class="el-icon-plus" @click="addTableData(scope.index)"></i>
                  <i class="el-icon-minus" @click="deleteTableData(scope.index)"></i>
                  <i class="el-icon-top" @click="down(scope.index)"></i>
                  <i class="el-icon-bottom" @click="up(scope.index)"></i>
                </div>
              </template>
            </template>
        </zebra-table>
      </el-form>
    </div>
    <div class="footer-button">
      <zebra-button v-if="unitStatus != 1" size="mini" :loading="loadingBtn" @click="temporary">暂存</zebra-button>
      <zebra-button v-if="unitStatus != 1" type="primary" size="mini" @click="subAndRelease">提交并发布</zebra-button>
      <zebra-button size="mini" @click="$router.back()">{{unitStatus == 1 ? '返回' : '取消'}}</zebra-button>
    </div>
    <el-dialog
      v-if="dialogVisible"
      :title="dialogTitle"
      width="80%"
      custom-class="configureModal"
      append-to-body
      :visible.sync="dialogVisible"
      :before-close="handleClose">
      <TempTable :chooseTemp="chooseTemp" :eventLists="eventLists" :eventHistoryId="form.eventHistoryId" ref="tempTable"/>
      <div slot="footer" class="dialog-footer" style="text-align:center;">
          <template v-if="chooseTemp">
            <zebra-button type="primary" size="mini" @click="fillTable">确定且字段填充至表格</zebra-button>
            <zebra-button size="mini" @click="handleClose">取消</zebra-button>
          </template>
          <template v-else>
            <zebra-button type="primary" size="mini" @click="handleClose">关闭</zebra-button>
          </template>
      </div>
    </el-dialog>
    <el-dialog
      v-if="dialogVisibleForm"
      title="新建字段"
      width="40%"
      append-to-body
      :visible.sync="dialogVisibleForm"
      :before-close="handleCloseForm">
      <ParamForm ref="paramForm" @closeForm="editTableDataOfForm"/>
      <div slot="footer" class="dialog-footer" style="text-align:center;">
          <zebra-button type="primary" size="mini" @click="saveForm">保存</zebra-button>
          <zebra-button size="mini" @click="handleCloseForm">取消</zebra-button>
      </div>
    </el-dialog>
  </PageHeader>
</template>

<script>
import PageHeader from "@/components/page-header/PageHeader";
import TempTable from './tempTable.vue'
import ParamForm from "./paramForm.vue";
import { submitListOption } from './tableColumn'
import { getInitFieldList,remoteSearch,historyRadioList,submitOrTemp,tableDetail,eventsExport,dictListData } from './api'
const checkCode = (rule, value, callback) => {
  if(value){
    const reg = /^sj_/g
    if(!reg.test(value)){
      callback(new Error('事件编码必须以 sj_ 开头'))
    }else{
      callback()
    }
  }
};
export default {
  name: "submitEvents",
  components: {PageHeader,TempTable,ParamForm},
  data() {
    return {
      title:this.$route.query.title,
      unitId:this.$route.query.id,
      unitStatus:this.$route.query.status,
      unitEventStatus:this.$route.query.eventStatus,
      form:{
        eventName:'',
        eventDescribe:'',
        eventHistoryId:'',
        eventHistoryName:'',
        eventCode:''
      },
      rules: {
        eventName: [{ required: true, message: '请输入事件名称', trigger: 'blur' }],
        eventCode: [
          { required: true, message: '请输入事件编码', trigger: 'blur' },
          { validator: checkCode, trigger: 'change' },
          { validator: checkCode, trigger: 'blur' }
        ],
      },
      dialogVisible:false,
      dialogTitle:'',
      chooseTemp:true,
      loading:false,
      tableData:[],
      option:submitListOption,
      dialogVisibleForm:false,
      loadingOptions:false,
      paramListData:[{value:'+新增自定义字段',paramsName:'',type:'add',fieldSource:'2'}],
      rowIndex:-1,
      eventLists:[],
      typeList:[],
      loadingBtn:false
    }
  },
  computed: {
    getTemplateName(){
      return (id) => {
        let name = '';
        this.eventLists.map(el => {
          if(el.value == id){
            name = el.label
          }
        })
        return name
      }
    },
    getTableColumn(){
      const thWidth = document.querySelector('.headerclass').childNodes[0].getBoundingClientRect().width
      return this.paramListData.filter(v => v.type).length ? '' : thWidth * 6
    },
    getFieldType(){
      return (val) => {
        let type = ''
        this.typeList.map(item => {
          if(item.value == val){
            type = item.label
          }
        })
        return type
      }
    }
  },
  mounted() {
    this.getRadioData()
    !this.unitId && this.getList()
    this.unitId && this.getFormInfo(this.unitId)
  },
  methods: {
    async getRadioData(){
      const res = await historyRadioList()
      this.eventLists = res.data.data.map(item => {
        return {
          value:item.id,
          label:item.eventName
        }
      })
      const resType = await dictListData()
      this.typeList = resType.data.data
    },
    async getFormInfo(id){
      const res = await tableDetail({id})
      const arr1 = res.data.data.fieldDtos.map(el => {
        return {
          ...el,
          paramsName:`${el.fieldEnglish}/${el.fieldChina}`
        }
      })
      const arr2 = arr1.filter(v => v.fieldSource == '2').sort((a,b) => {return a.fieldSort - b.fieldSort})
      const arr3 = arr1.filter(v => v.fieldSource == '1')
      this.tableData = [...arr2,...arr3]
      if(!arr2.length) this.tableData.unshift({paramsName:'',fieldSource:'2'})
      for(const key in this.form){
        this.form[key] = res.data.data[key]
      }
    },
    async getList(){
      const res = await getInitFieldList()
      this.tableData = res.data.data
      this.tableData.unshift({paramsName:'',fieldSource:'2'})
    },
    /***  表格搜索框操作 ***/
    //远程搜索
    remoteMethod(val){
      if(val){
        this.loadingOptions = true
        remoteSearch({param:val}).then(res => {
          this.loadingOptions = false
          this.paramListData = res.data.data.map(el => {
            return {
              ...el,
              value:`${el.fieldEnglish}/${el.fieldChina}`
            }
          })
        })
      }else{
        this.paramListData = [{value:'+新增自定义字段',paramsName:'',type:'add',fieldSource:'2'}]
      }
    },
    visibleChange(val){
      if(!val){
        this.paramListData = [{value:'+新增自定义字段',paramsName:'',type:'add',fieldSource:'2'}]
      }
    },
    //点击下拉框并回显至表格
    handleSelect(item,index){
      if(item.type){
        this.tableData.splice(index,1,item)
        return this.editForm(item,index)
      }
      this.paramListData = [{value:'+新增自定义字段',paramsName:'',type:'add',fieldSource:'2'}]
      const arr = JSON.parse(JSON.stringify(this.tableData))
      for(const key in arr){
        if(item.fieldEnglish == arr[key].fieldEnglish){
          this.tableData.splice(index,1,{paramsName:'',fieldSource:'2'})
          return this.$message.warning('字段名字重复！')
        } 
      }
      this.tableData.splice(index,1,{...item,paramsName:`${item.fieldEnglish}/${item.fieldChina}`})
    },
    /*** end 表格搜索 ***/

    /***  页面按钮 ***/
    //选择模板
    handleTemp(){
      this.dialogTitle = '选择历史事件'
      this.chooseTemp = true
      this.dialogVisible = true
    },
    //清空模板及表格数据
    clear(){
      this.form.eventHistoryId = ''
      if(this.form.eventHistoryName) this.form.eventHistoryName = ''
      const arr = this.tableData.filter(v => v.fieldSource == '2')
      this.tableData.splice(0,arr.length,{paramsName:'',fieldSource:'2'})
    },
    //打开返回参数表格弹窗
    handleResponse(){
      this.dialogTitle = '返回参数'
      this.chooseTemp = false
      this.dialogVisible = true
    },
    //导出接口文档
    exportEvent(){
      eventsExport({id:this.unitId}).then(res => {
        const aLink = document.createElement('a')
        let blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        let patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
        let contentDisposition = decodeURI(res.headers['content-disposition'])
        let result = patt.exec(contentDisposition)
        let fileName = result[1]
        fileName = fileName.replace(/\"/g, '')
        aLink.href = URL.createObjectURL(blob)
        aLink.setAttribute('download', fileName)
        document.body.appendChild(aLink)
        aLink.click()
        document.body.removeChild(aLink)
        URL.revokeObjectURL(aLink.href)
      })
    },
    //提交操作
    subAndRelease(){
      this.$refs.ruleForm.validate(valid => {
        if(valid){
          const arr = this.tableData.filter(v => v.fieldSource == '2' && v.paramsName)
          if(!arr.length) return this.$message.warning('请填写字段')
          this.$alert('确定提交并发布！', '提示', {
            confirmButtonText: '确定',
            callback: action => {
              if(action == 'confirm'){
                this.submitAction('1')
              }
            }
          });
        }
      })
    },
    //暂存
    temporary(){
      this.loadingBtn = true
      this.submitAction('0')
    },
    submitAction(status){
      const param = {
        ...this.form,
        status,
        eventStatus:status,
        id:this.unitId || '',
        fieldDtos:this.tableData.filter(v => v.fieldSource == '2' && v.paramsName).map((el,index) => {
          el.id && delete el.id
          return {
            ...el,
            fieldStatus:status,
            fieldSort:(index + 1)
          }
        })
      }
      submitOrTemp(param).then(res => {
        if(res.data.code == 0){
          this.loadingBtn =false
          this.$message.success('事件新建成功！')
          this.$router.back()
        }
      }).catch(err => {
        if(err) this.loadingBtn = false
      })
    },
    //格式化事件编码
    validFieldEnglish(val){
      this.form.eventCode = val.replace('\\', '')
    },
    /*** end 页面按钮 ***/

    /***  模板及返回参数弹窗 ***/
    //关闭弹窗
    handleClose(){
      this.dialogVisible = false
    },
    //填充数据至表格
    fillTable(){
      this.$nextTick(() => {
        const repeat = this.checkRepeat(this.tableData.filter(v => v.fieldSource == '2'),this.$refs.tempTable.tableData)
        if(repeat){
          this.$message.warning('已替换参数名重复的数据')
          this.tableData.splice(repeat,1)
        }
        const customArr = this.tableData.filter(v => v.fieldSource == '2' && !v.temp)
        const tepmArr = this.tableData.filter(v => v.temp)
        this.tableData.splice(customArr.length,tepmArr.length,...this.$refs.tempTable.tableData)
        this.form.eventHistoryId = this.$refs.tempTable.event
        this.eventLists.map(el => {
          if(el.value == this.form.eventHistoryId){
            this.form.eventHistoryName = el.label
          }
        })
        this.handleClose()
      })
    },
    checkRepeat(custom,temp){
      const M = new Map
      temp.forEach(el => {
        M.set(el.fieldEnglish,el)
      })
      for(const key in custom){
        if(M.get(custom[key].fieldEnglish)) return key
      }
      return false
    },
    /*** end 模板及返回参数弹窗 ***/

    /***  编辑字段表单弹窗 ***/
    //关闭弹窗
    handleCloseForm(){
      this.dialogVisibleForm = false
    },
    //验证表单必填项
    saveForm(){
      this.$nextTick(() => {
        this.$refs.paramForm.valid()
      })
    },
    //关闭表单弹窗并填充内容至表格
    editTableDataOfForm(info){
      const item = {
        ...info,
        paramsName:`${info.fieldEnglish}/${info.fieldChina}`
      }
      this.tableData.splice(this.rowIndex,1,item)
      this.handleCloseForm()
    },
    /*** end 编辑字段表单弹窗 ***/

    /***  表格操作栏按钮 ***/
    //打开表单弹窗并回显数据
    editForm(row,index){
      this.dialogVisibleForm = true
      this.rowIndex = index
      this.$nextTick(() => {
        this.$refs.paramForm.initForm(row,this.tableData,index)
      })
    },
    //添加行
    addTableData(index){
      this.tableData.splice(index+1,0,{paramsName:'',fieldSource:'2'})
    },
    //删除行
    deleteTableData(index){
      const arr = this.tableData.filter(v => v.fieldSource == '2')
      if(arr.length < 2){
        this.tableData.splice(index,1,{paramsName:'',fieldSource:'2'})
      }else{
        this.tableData.splice(index,1)
      }
    },
    //下移行
    down(index){
      const arr = this.tableData.filter(v => v.fieldSource == '2')
      if(index < arr.length - 1){
        this.tableData.splice(index, 1, ...this.tableData.splice(index + 1, 1, this.tableData[index]))
      }
    },
    //上移行
    up(index){
      if(index == 0) return
      this.tableData.splice(index -1, 1, ...this.tableData.splice(index, 1, this.tableData[index - 1]))
    },
    /*** end 表格操作栏按钮 ***/
  },
}
</script>

<style lang="scss" scoped>
.events-box/deep/{
  .close-icon {
    font-size: 16px;
    cursor: pointer;
  }
  margin-top: 16px;
}
.footer-button/deep/{
  background-color: #ffffff;
  bottom: 0;
  padding: 10px 0;
  margin-top: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.actionMenu{
  display: flex;
  justify-content: space-around;
  align-items: center;
  img{
    width: 25px;
    cursor: pointer;
  }
  i{
    font-size: 17px;
    cursor: pointer;
    color: #409EFF;
  }
}
/deep/ .submitTables{
  .el-table .el-table__body-wrapper{
    height: auto!important;
  }
}
.cuntomOptions{
  display: flex;
  font-size: 12px;
  span{
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
<style lang="scss">
.customPoper{
  left: 60px!important;
  .el-select-dropdown__item{
    padding: 0;
  }
}
</style>