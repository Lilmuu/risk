<template>
  <div class="rule-manage-info">
    <PageHeader title="项目测试">
      <div style="height:20px;margin:0;padding:0;"></div>
      <zebra-form :option="infoOption" :formData="info" class="info-form-head">
        <template slot="nameForm">
          <span>{{info.name}}</span>
        </template>
        <template slot="phaseForm">
          <span>{{info.phase}}</span>
        </template>
<!--        <template slot="riskTypeForm">-->
<!--          <span>{{info.riskType == 'EVALUATION_FORM' ? '评分表' : '专家模型'}}</span>-->
<!--        </template>-->
        <template slot="remarkForm">
          <el-tooltip class="item" effect="dark" :content="info.remark" placement="bottom">
<!--            <span style="width: 100%;display: block;overflow: hidden;text-overflow: ellipsis;white-space: pre;">{{info.remark}}</span>-->
            <span>{{info.remark}}</span>
          </el-tooltip>
        </template>
      </zebra-form>
    </PageHeader>
    <div class="rule-manage-info-box" v-loading="loading">
      <div class="left">
        <LoadingBox v-if="formloading" />
        <!-- 未配置表单时 -->
        <zebra-button v-if="onlyBtn" type="primary" size="mini" @click="excuteHandle({})" style="margin-bottom:10px;">执行</zebra-button>
        <zebra-form v-if="!formloading" :option="formOption" :formData="form" @submit="excuteHandle">
          <template slot="formButton">
            <el-upload
              class="upload-demo"
              :action="'/mgr/risk/test/batch/strategyGroup/' + rowData.no"
              :on-success="successHandle"
              :on-progress="loadHandle"
              :headers="uploadHeader"
              multiple
              :show-file-list="false"
            >
              <zebra-button size="mini" type="primary">批量导入</zebra-button>
            </el-upload>
            <zebra-button size="mini" @click="downloadModelHandle">模板下载</zebra-button>
          </template>
        </zebra-form>
        <el-row class="example" v-if="!formloading">
          <h4>调用示例：</h4>
          <p><span>接口地址</span><span>/api/risk/risk</span></p>
          <p><span>请求方式</span><span>post</span></p>
          <p><span>请求头</span><span>_application_name_</span><span>服务名称</span></p>
          <p><span></span><span>no</span><span>项目编号</span></p>
          <p style="height:auto;">
            <span>请求体</span>
            <a style="flex:1;">
              <span >[{</span>
              <span v-for="(ist,isx) in formOption.column" :key="'ex'+ist.prop">{{ist.prop+':xxx' + (formOption.column.length-1 > isx ? ' ,' : '') }}</span>
              <span>}]</span>
            </a>
          </p>
        </el-row>
      </div>
      <!-- <div class="right img-right" v-if="!boolShow"></div> -->
      <div class="right">
        <h4>{{boolShow ? '测试结果' : '测试日志'}}</h4>
        <zebra-form :option="ruleOption" :formData="info">
          <template slot="countForm">
            <span>{{ruleInfo.count || '-'}}</span>
          </template>
          <template slot="passingForm">
<!--            <span>{{ruleInfo.passing ? (ruleInfo.passing + '%') : (ruleInfo.passing == 0 ? ruleInfo.passing : '') || '-'}}</span>-->
            <span>{{ruleInfo.passing == 0 ? (ruleInfo.passing + '%') : (ruleInfo.passing ? (ruleInfo.passing + '%') : '-')}}</span>
          </template>
          <template slot="createTimeForm">
            <span>{{ruleInfo.createTime || '-'}}</span>
          </template>
          <template slot="finishTimeForm">
            <span>{{ruleInfo.finishTime || '-'}}</span>
          </template>
          <template slot="consumingTimeForm">
            <span>{{ruleInfo.consumingTime || '-'}}</span>
          </template>
        </zebra-form>
        <!-- 测试日志 -->
        <zebra-table :loading="tableLoading" :page="page" :option="logOption" :data="logData" v-if="!boolShow" @on-load="getLogHandle">
          <template slot="errorMsg" slot-scope="scope">
            <span>{{scope.row.errorMsg ? scope.row.errorMsg : '-'}}</span>
          </template>
          <template slot="menu" slot-scope="scope">
            <zebra-button size="mini" type="text" @click="viewDetail(scope.row)">明细</zebra-button>
          </template>
          <template slot="totalScore" slot-scope="scope">
            <span>{{scope.row.totalScore ? (scope.row.totalScore + '分') : '0分'}}</span>
          </template>
        </zebra-table>
        <!-- 测试结果 -->
        <zebra-table :loading="tableLoading" :page="page" :option="resultOption" :data="tableData" v-else @on-load="getList('')">
          <template slot="menuRight">
            <!-- <zebra-button size="mini" @click="exportHandle">数据导出</zebra-button> -->
          </template>
          <template slot="menu" slot-scope="scope">
            <zebra-button size="mini" type="text" @click="reExcute(scope.row)">重新测试</zebra-button>
            <zebra-button size="mini" type="text" @click="viewDetail(scope.row)">明细</zebra-button>
          </template>
          <template slot="errorMsg" slot-scope="scope">
            <span>{{scope.row.errorMsg ? scope.row.errorMsg : '-'}}</span>
          </template>
          <template slot="totalScore" slot-scope="scope">
            <span>{{scope.row.totalScore ? (scope.row.totalScore + '分') : '0分'}}</span>
          </template>
        </zebra-table>
      </div>
    </div>
    <el-dialog
      v-if="viewVisible"
      title="规则集明细"
      append-to-body
      :visible.sync="viewVisible"
      :before-close="viewClose">
<!--      <viewDetail :modelData="rowData" :rowData="testRow" />-->
      <el-table :data="detailData" height="400px">
        <el-table-column prop="nodeName" label="名称" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reason" label="原因" show-overflow-tooltip></el-table-column>
        <el-table-column prop="result" label="结果" show-overflow-tooltip></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import store from "@/store";
import {getTemplate, getResult, getLog} from '../testmanage/api'
import {ruleList, singleTest} from './api'
import PageHeader from '@/components/page-header/PageHeader'
import LoadingBox from '@/components/basic-container/loading'
// import TimeBarSlice from '@antv/g6/lib/plugins/timeBar/timeBarSlice'
import viewDetail from '../policyproject/testDetail'
export default {
  name: 'rule-manage-info',
  components: {PageHeader, LoadingBox, viewDetail},
  props: {
    rowData: {
      type: Object
    }
  },
  data(){
    return {
      loading: false,
      boolShow: false,
      info: {},
      detailData: [],
      infoOption: {
        disabled: true,
        btnHide: true,
        labelWidth: '90px',
        formAlign: 'left',
        column: [
          {
            label: '规则集名称',
            prop: 'name',
            span: 8,
            formSlot: true
          },
          // {
          //   label: '项目阶段',
          //   prop: 'phase',
          //   span: 8,
          //   formSlot: true
          // },
          // {
          //   label: '风控类型',
          //   prop: 'riskType',
          //   span: 8,
          //   formSlot: true
          // },
          {
            label: '备注',
            prop: 'remark',
            span: 16,
            type: 'textarea',
            formSlot: true
          }
        ]
      },
      form: {},
      formOption: {
        submitBtnText: '执行',
        emptyBtn: false,
        formAlign: 'top',
        labelWidth: '100px',
        cancal: false,
        column: []
      },
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
      },
      tableData: [],
      ruleInfo: {},
      ruleOption: {
        addBtn: false,
        editBtn: false,
        viewBtn: false,
        delBtn: false,
        align: 'center',
        menuAlign: 'center',
        page: true,
        btnHide: true,
        cancal: false,
        formAlign: 'left',
        labelWidth: '90px',
        column: [
          {
            label: '总条数',
            prop: 'count',
            span: 8,
            formSlot: true
          },
          {
            label: '通过率',
            prop: 'passing',
            span: 8,
            formSlot: true
          },
          {
            label: '耗时/ms',
            prop: 'consumingTime',
            span: 8,
            formSlot: true
          },
          {
            label: '开始时间',
            prop: 'createTime',
            span: 8,
            formSlot: true
          },
          {
            label: '结束时间',
            prop: 'finishTime',
            span: 8,
            formSlot: true
          },
        ]
      },
      nomber: '',
      resultOption: {
        addBtn: false,
        editBtn: false,
        viewBtn: false,
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
            dicData: [
              {label: '通过', value: true},
              {label: '不通过', value: false}
            ],
            hide: this.rowData.riskType == 'EVALUATION_FORM'
          },
          {
            label: '测试结果',
            prop: 'totalScore',
            slot: true,
            hide: this.rowData.riskType !== 'EVALUATION_FORM'
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
          }
        ]
      },
      formloading: false,
      logData: [],
      uploadHeader: {
        tenantId: store.getters.userInfo.tenantId,
        Authorization: store.getters.access_token
      },
      viewVisible: false, // 明细弹框
      // testRow: {}, // 测试结果行数据
      onlyBtn: false, // 无参数时可测试
      tableLoading: false
    }
  },
  created () {
    if(this.rowData) {
      if(this.rowData.id) {
        // 表单配置
        this.getFormOption()
        // 日志
        this.logOption = JSON.parse(JSON.stringify(this.resultOption))
        this.logOption.menu = true
        this.getLogHandle()
      }
      this.info = JSON.parse(JSON.stringify(this.rowData))
    }
  },
  methods: {
    getList (nomber) {
      if(!nomber && this.nomber) {
        nomber = this.nomber
      }
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      if(nomber) {
        this.tableLoading = true
        getResult(nomber, obj).then(res => {
          if(res.data.code == 0 && res.data.data) {
            this.tableData = res.data.data.records
            this.page.currentPage = res.data.data.current
            this.page.total = res.data.data.total
            this.tableLoading = false
            this.$forceUpdate()
          }
        }).catch(e => {
          this.tableLoading = false
        })
      }
    },
    excuteHandle (form) {
      let temp = []
      this.loading = true
      for(let i in form) {
        temp.push({
          key: i,
          value: form[i]
        })
      }
      for(let i in form) {
        form[i] = form[i].trim()
      }
      singleTest(this.rowData.no, form).then(res => {
        if(res.data.code == 0 && res.data.data) {
          this.ruleInfo = res.data.data
          this.page.currentPage = 1
          this.nomber = res.data.data.no
          this.getList(this.nomber)
          this.loading = false
          this.boolShow = true
        }else{
          if(res.data.msg) {
            this.$message.error(res.data.msg)
          }
        }
      }).catch (e => {
        console.log(e)
        this.loading = false
      })
    },
    // 重新测试
    reExcute (row) {
      if(row.parameters) {
        let temp = JSON.parse(row.parameters)
        this.excuteHandle(temp)
      }
    },
    // 下载模板
    downloadModelHandle () {
      var elink = document.createElement('a')
      elink.style.display = 'none'

      elink.href = '/mgr/risk/test/template/' + this.rowData.no

      document.body.appendChild(elink)
      elink.click()

      document.body.removeChild(elink)
      // getTemplate(this.rowData.id).then(res => {
      //   // let name = res.headers["content-disposition"].split(";")[1]
      //   // name = name.split("=")[1]
      //   // name = decodeURI(name)
      //   // this.downloadFile(name, res.data)
      // })
    },
    // 下载文件
    downloadFile(filename, content) {
      var elink = document.createElement('a')
      if(filename) {
        elink.download = filename
      }
      elink.style.display = 'none'

      var blob = new Blob([content]) //, {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'})
      elink.href = URL.createObjectURL(blob)

      document.body.appendChild(elink)
      elink.click()

      document.body.removeChild(elink)
    },
    // 上传
    loadHandle () {
      this.loading = true
    },
    successHandle (res, file, fileList) {
      if(res.code == 0) {
        this.$message.success('导入成功')
        this.ruleInfo = res.data
        this.nomber = res.data.no
        this.page.currentPage = 1
        this.getList(res.data.no)
        this.loading = false
        this.boolShow = true
      }
    },
    // 导出
    exportHandle () {
      var elink = document.createElement('a')
      elink.style.display = 'none'

      elink.href = '/mgr/risk/test/export/' + this.rowData.id + '/' + this.nomber

      document.body.appendChild(elink)
      elink.click()

      document.body.removeChild(elink)
    },
    // 获取表单结构
    getFormOption () {
      this.formloading = true
      // 表单配置
      ruleList(this.rowData.no).then(res => {
        if(res.data.code == 0) {
          if(res.data.data){
            // if(res.data.data.length == 0) {
            //   this.$message.warning("风控未配置完整，不能执行测试！")
            //   return false
            // }else{
            // }
            let temp = []
            for(let i in res.data.data) {
              let obj = {
                label: res.data.data[i].label + '  (' + res.data.data[i].key + ')',
                prop: res.data.data[i].key,
              }
              obj.placeholder = res.data.data[i].label
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
              if (res.data.data[i].necessary) {
                obj.rules = [
                  { required: true, message: '请输入' + obj.placeholder, trigger: 'blur' },
                ]
              }
              temp.push(obj)
            }
            this.formOption.column = temp
          }else{
            // this.onlyBtn = true
            this.$message.error("风控未配置完整，不能执行测试！")
          }
          this.formloading = false
        }
      })
    },
    // 日志记录
    getLogHandle () {
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      this.tableLoading = true
      getLog(this.rowData.no, obj).then(res => {
        if(res.data.code == 0) {
          this.logData = res.data.data.riskLogPos
          this.page.total = res.data.data.total
          this.page.currentPage = res.data.data.current
          this.ruleInfo = res.data.data.riskLogBatchPo
          this.tableLoading = false
        }
      }).catch(e => {
        this.tableLoading = false
      })
    },
    // 查看明细
    viewDetail (row) {
      this.detailData = [...JSON.parse(row.reason)]
      // this.testRow = row
      this.viewVisible = true
    },
    // 关闭明细
    viewClose () {
      this.viewVisible = false
    }
  }
}
</script>
<style lang="scss">
.rule-manage-info{
  // height: calc(100vh - 10px);
  .el-card{
    .el-card__body{
      .pageheader-top{
        .pageheader-line{
          margin-left: 20px;
        }
        .title{
          margin-left: 16px;
        }
      }
    }
  }
}
.rule-manage-info-box{
  display: flex;
  // height: calc(100% - 132px);
  .left{
    width: 350px;
    border-right: 1px solid #e5e5e5;
    padding-right: 10px;
    overflow: hidden;
    overflow-y: auto;
    .form-btn-bar{
      display: flex;
      .el-form-item__content{
        display: flex;
        .el-button{
          margin-right: 10px;
        }
      }
    }
    .el-input-number{
      .el-input__inner{
        text-align: left;
      }
      .el-input-number__decrease, .el-input-number__increase{
        display: none;
      }
    }
  }
  .left::-webkit-scrollbar{
    display: none;
  }
  .right {
    flex: 1;
    margin-left: 20px;
  }
  .img-right{
    background-image: url('../../styles/relation.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
  .example{
    border: 1px solid #e5e5e5;
    font-size: 12px;
    h4{
      margin: 0 10px;
      height: 36px;
      line-height: 36px;
    }
    p{
      display: flex;
      align-items: center;
      border-top: 1px solid #e5e5e5;
      margin: 0;
      height: 36px;
      padding: 0 10px;
      span{
        margin-left: 10px;
      }
      span:nth-of-type(1) {
        width: 75px;
        margin-left: 0;
      }
      span:nth-of-type(2) {
        flex: 1;
        margin-left: 0;
      }
      a{
        flex: 1;
      }
    }
  }
}
.package-list {
  background: #f0f2f5;
  .test-project-dialog {
    background: #f0f2f5;
    .el-dialog__header{
      padding: 0!important;
      .el-dialog__headerbtn{
        z-index: 9;
      }
    }
    .el-dialog__body{
      padding: 0!important;
      height: 100%;
      overflow: hidden;
      overflow-y: auto;
    }
    .el-dialog__body::-webkit-scrollbar{
      display: none;
    }
  }
}
.rule-manage-info{
  background: #f0f2f5;
  .el-card{
    background: none;
  }
  .el-card__body{
    background: #fff;
    padding: 0;
    margin: 10px;
    margin-bottom: 0;
  }
  .rule-manage-info-box{
    background: #fff;
    margin: 10px;
    padding: 10px;
  }
  .info-form-head{
    margin-left: 40px;
    .el-form-item{
      margin-bottom: 0;
    }
  }
}
.view-test-detail{
  .el-dialog__header{
    padding: 0!important;
    .el-dialog__headerbtn{
      z-index: 1;
    }
  }
  .el-dialog__body{
    padding: 0!important;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
  }
  .el-dialog__body::-webkit-scrollbar{
    display: none;
  }
}
</style>
