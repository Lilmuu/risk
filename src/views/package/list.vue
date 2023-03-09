<template>
  <!-- 风控包管理 -->
  <div class="package-list">
    <zebra-table pageheadertitle="风控模型管理" 
      :page="page" :loading="loading" 
      :formData="queryParams" :option="option" 
      :data="tableData" @on-load="getList" 
      @search-change="searchChange" 
      @addRow="addRowHandle" 
      @editRow="editRowHandle"
    >
      <template slot="menu" slot-scope="scope">
        <div>
          <zebra-button type="text" size="mini" v-if="scope.row.status == true" @click="startStopHandle(scope.row)" permisionFlag="risk_mgr_xiang_mu_guan_li_jin_yong">停用</zebra-button>
          <zebra-button type="text" size="mini" v-if="scope.row.testState == true && scope.row.status != true" @click="startStopHandle(scope.row)" permisionFlag="">发布</zebra-button>
          <zebra-button type="text" size="mini" @click="designHandle(scope.row, scope.index)" permisionFlag="risk_mgr_she_ji_huo_qu_she_ji_shu">设计</zebra-button>
          <zebra-button type="text" size="mini" @click="testHandle(scope.row, scope.index)" permisionFlag="risk_mgr_feng_kong_ri_zhi_cha_xun_xiang_mu_ce_shi_ri_zhi">测试</zebra-button>
          <zebra-button type="text" size="mini" v-if="scope.row.status != true" @click="deletePackageHandle(scope.row, scope.index)" permisionFlag="risk_mgr_xiang_mu_guan_li_shan_chu">删除</zebra-button>
          <zebra-button type="text" size="mini" @click="bindHandle(scope.row, scope.index)">变量绑定</zebra-button>
        </div>
      </template>
      <template slot="menuLeft">
        <a href="/mgr/risk/doc/helpdoc.rar" target="_blank" style="margin-left:10px;">
          <!-- /mgr/risk/project/help -->
        <zebra-button type='primary' size="mini" permisionFlag="">使用帮助</zebra-button>
        </a>
      </template>
    </zebra-table>
    <el-dialog
      class="design-project-dialog"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose">
      <designForm :rowData="rowData" @close="closeHandle" />
    </el-dialog>
    <!-- 测试 -->
    <el-dialog
      class="test-project-dialog"
      v-if="dialogVisibleTest"
      :visible.sync="dialogVisibleTest"
      fullscreen
      :before-close="handleCloseTest">
      <infoForm :rowData="rowData" />
    </el-dialog>
    <!-- 变量绑定 -->
    <el-dialog
      class="test-project-dialog"
      v-if="variableVisible"
      :visible.sync="variableVisible"
      fullscreen
      :before-close="handleCloseVariable">
      <variableTable :rowData="rowData" @bind="bindSet" />
      <!-- <el-row style="display: flex;justify-content: center;align-items: center;">
        <zebra-button size="mini" type="primary" :disabled="bindVariableData ? false : true" @click="bindSubmit">确定</zebra-button>
        <zebra-button size="mini" @click="handleCloseVariable">返回</zebra-button>
      </el-row> -->
    </el-dialog>
  </div>
</template>
<script>
import {packageList, addPackage, editPackage, deletePackage, getPhaseList, changeStatus} from './api'
import {bindVariable} from '../variablecenter/api'
import designForm from './design'
import infoForm from '../testmanage/info'
import variableTable from './variablebind'
export default {
  name: 'package-list',
  components: {designForm, infoForm, variableTable},
  data(){
    return {
      tableData: [],
      loading: false,
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      option: {
        addBtn: this.$permissionMatch("risk_mgr_xiang_mu_guan_li_tian_jia"),
        editBtn: this.$permissionMatch("risk_mgr_xiang_mu_guan_li_xiu_gai"),
        addBtnText: '项目添加',
        addFormTitle: '添加项目',
        searchBtnText: '查询',
        viewBtn: false,
        delBtn:false,
        search: true,
        page: true,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        labelWidth: '90px',
        size: 'mini',
        inline: false,
        cancal: false,
        column: [
          {
            label: '风控模型编号',
            // label: '项目编号',
            prop: 'projectNo',
            search: true,
            addDisplay: false,
            editDisplay: false,
            searchSpan: 5
          },
          {
            label: '版本号',
            prop: 'version',
            addDisplay: false,
            editDisplay: false,
            hide: true
          },
          {
            label: '风控阶段',
            prop: 'phase',
            search: true,
            type: 'select',
            filterable: true,
            allowcreate: true,
            dicUrl: '/mgr/risk/project/phase/list',
            dicData:[],
            props: {
              label: 'phase',
              value: 'phase'
            },
            rules: [
              { required: true, message: '风控阶段不能为空', trigger: 'change' },
            ],
            searchSpan: 4
          },
          {
            label: '项目名称',
            prop: 'name',
            search: true,
            addDisplay: true,
            editDisplay: true,
            searchSpan: 4,
            maxlength: 50,
            showwordlimit: true,
            rules: [
              { required: true, message: '项目名称不能为空', trigger: 'blur' },
            ]
          },
          {
            label: '风控类型',
            // label: '项目类型',
            prop: 'riskType',
            addDisplay: true,
            editDisplay: false,
            searchSpan: 5,
            type: 'select',
            dicData: [
              {label: '专家模型', value: 'EXPERT_MODEL'},
              {label: '评分表', value: 'EVALUATION_FORM'}
            ],
            rules: [
              { required: true, message: '风控类型不能为空', trigger: 'change' },
            ]
          },
          {
            label: '测试状态',
            prop: 'testState',
            addDisplay: false,
            editDisplay: false,
            type: 'select',
            dicData: [
              {label: '已通过', value: true},
              {label: '未通过', value: false}
            ]
          },
          {
            label: '风控模型状态',
            // label: '发布状态',
            prop: 'status',
            search: true,
            searchSpan: 5,
            addDisplay: false,
            editDisplay: false,
            type: 'select',
            dicData: [
              {label: '已发布', value: true},
              {label: '未发布', value: false}
            ]
          },
          {
            label: '创建人',
            prop: 'createBy',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '创建时间',
            prop: 'createTime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false
          },
          // {
          //   label: '客户来源',
          //   prop: 'customer',
          //   hide: true,
          //   type: 'select',
          //   dicUrl: '/mgr/risk/secret/customer/list',
          //   rules: [
          //     { required: true, message: '客户来源不能为空', trigger: 'change' },
          //   ]
          // },
          {
            label: '备注',
            prop: 'remark',
            // hide: true,
            type: 'textarea'
          }
        ]
      },
      dialogVisible: false, // 设计弹框
      rowData: {}, // 当前行数据
      dialogVisibleTest: false, // 测试弹框
      variableVisible: false, // 变量绑定弹框
      bindVariableData: null, // 绑定的变量
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
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
      packageList(temp).then(res => {
        if(res.data.code == 0) {
          this.tableData = res.data.data.records
          this.page.currentPage = res.data.data.current
          this.page.total = res.data.data.total
        }
      }).catch(e => {
        this.tableData = []
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
      addPackage(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('添加成功')
          this.getList()
          this.getPhaseListHandle()
        }
      })
    },
    editRowHandle (form) {
      editPackage(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('修改成功')
          this.getList()
          this.getPhaseListHandle()
        }
      })
    },
    // 设计
    designHandle (row, index) {
      this.rowData = row
      this.dialogVisible = true
    },
    // 关闭设计
    handleClose () {
      this.dialogVisible = false
    },
    // 子组件通知关闭
    closeHandle (bool) {
      this.handleClose()
      this.rowData = {}
    },
    // 删除风控包
    deletePackageHandle (row, index) {
      this.$confirm('确认删除？').then(_ => {
        deletePackage(row.id).then(res => {
          if(res.data.code == 0) {
            this.$message.success('删除成功')
            this.getList()
            this.getPhaseListHandle()
          }
        })
      }).catch(_ => {})
    },
    // 测试
    testHandle (row, index) {
      this.rowData = row
      this.dialogVisibleTest = true
    },
    // 关闭测试
    handleCloseTest () {
      this.dialogVisibleTest = false
    },
    // 启用  停用
    startStopHandle (row) {
      let str = ''
      if(row.status) {
        str = '停用'
      }else{
        str = '发布'
      }
      this.$confirm('确认'+str+'？').then(_ => {
        changeStatus(row.id).then(res => {
          if(res.data.code == 0) {
            this.$message.success(str+'成功')
            this.getList()
          }
        })
      }).catch(_ => {})
    },
    // 获取风控阶段列表
    async getPhaseListHandle() {
      await getPhaseList().then(res => {
        if(res.data.code == 0) {
          let temp = []
          for(let i in res.data.data) {
            if(res.data.data[i]) {
              temp.push(res.data.data[i])
            }
          }
          this.option.column.filter(item => {
            if(item.prop == 'phase') {
              item.dicData = temp // res.data.data
            }
          })
        }
      })
    },
    // 变量绑定
    bindHandle (row, index) {
      // console.log(row)
      this.rowData = row
      this.variableVisible = true
    },
    // 关闭变量绑定弹框
    handleCloseVariable () {
      this.variableVisible = false
    },
    // 选中的变量
    bindSet (row) {
      this.bindVariableData = row
    },
    // 变量绑定提交
    bindSubmit () {
      if(this.bindVariableData) {
        bindVariable(this.bindVariableData).then(res => {
          if(res.data.code == 0) {
            this.$message.success('变量绑定成功')
            this.handleCloseVariable()
            this.getList()
          }
        })  
      }
    }
  },
  created () {
    this.getPhaseListHandle()
  }
}
</script>
<style lang="scss">
.package-list{
  .search-form{
    .el-col-6:nth-last-of-type(1) {
      .el-form-item__content{
        text-align: left;
      }
    }
  }
  .project-add-introduce{
    cursor: pointer;
    color: #409EFF;
  }
}
.design-project-dialog{
  .el-dialog{
    background: #f0f2f5;
    box-sizing: border-box;
  }
  .el-dialog__header{
    background: #f0f2f5;
    padding-top: 0;
    .el-dialog__headerbtn{
      top: 10px;
    }
  }
  .el-dialog__body{
    padding-top: 0;
    padding-bottom: 0;
    height: calc(100% - 10px);
    background: #f0f2f5;
    padding: 0 10px;
  }
}
</style>