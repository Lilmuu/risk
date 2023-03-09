<template>
  <!-- 数据源管理 -- 项目管理 -->
  <div class="datasource-list">
    <zebra-table
      pageheadertitle="账号管理"
      :loading="loading"
      :formData="queryParams"
      :defaultFormData="queryParams"
      :option="option"
      :data="tableData"
      :page="page"
      size="mini"
      @on-load="getList"
      @search-change="searchChange"
      @addRow="addRowHandle"
    >
      <template slot="shortName" slot-scope="scope">
        {{ scope.row.systemName }}
      </template>
      <template slot="headerTop">
        <zebra-form style="margin-left: 40px" :option="formOption" @submit="getList('','reset')" @reset="handleReset" :formData="queryParams">
          <template slot="systemNameForm" slot-scope="scope">
            <el-select filterable v-model="queryParams.shortName" placeholder="请选择">
              <el-option
                v-for="(item, key) in datasourceList"
                :key="key"
                :label="item.label"
                :value="item.value">
                <div style="display: flex;justify-content: space-between">
                  <span>{{ item.label }}</span>
                  <span style="color: rgb(132, 146, 166);">{{ item.value }}</span>
                </div>
              </el-option>
            </el-select>
          </template>
        </zebra-form>
      </template>
      <template slot="menu" slot-scope="scope">
        <div>
          <zebra-button type="text" size="mini" v-if="!scope.row.status" @click="editHandle(scope.row)" permisionFlag="risk_mgr_zhang_hao_guan_li_xiu_gai_ping_zheng">修改</zebra-button>
          <zebra-button type="text" size="mini" v-if="!scope.row.status" @click="deleteRowHandle(scope.row)" permisionFlag="risk_mgr_zhang_hao_guan_li_shan_chu_ping_zheng">删除</zebra-button>
          <zebra-button type="text" size="mini" v-if="scope.row.status" @click="configRowHandle(scope.row)" permisionFlag="risk_mgr_zhang_hao_guan_li_zhang_hao_pei_zhi_xin_xi">查看</zebra-button>
          <zebra-button type="text" size="mini" v-if="!scope.row.status" @click="configRowHandle(scope.row)" permisionFlag="risk_mgr_zhang_hao_guan_li_pei_zhi_jie_kou_jia_ge">配置</zebra-button>
          <zebra-button type="text" size="mini" v-if="scope.row.status" @click="enableHandle(scope.row)" permisionFlag="risk_mgr_zhang_hao_guan_li_jin_yong">停用</zebra-button>
          <zebra-button type="text" size="mini" v-if="!scope.row.status" @click="enableHandle(scope.row)" permisionFlag="">启用</zebra-button>
        </div>
      </template>
    </zebra-table>
    <el-dialog
      fullscreen
      append-to-body
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      class="no-header-dialog account-info-dialog"
      :before-close="handleClose">
      <priceInfo :rowData="rowData" @close="closeHandle" />
    </el-dialog>
    <el-dialog
      title="修改"
      append-to-body
      v-if="formVisible"
      :visible.sync="formVisible"
      :before-close="handleCloseForm">
      <zebra-form :option="rowOption" :formData="rowData" @submit="editRowHandle"></zebra-form>
    </el-dialog>
  </div>
</template>
<script>
import {accountList, addAccount, eidtAccount, deleteAccount, enableAccount, getDataSource} from './api'
import priceInfo from './price'
export default {
  name: 'datasource-list',
  components: {priceInfo},
  data(){
    return {
      datasourceList: [],
      tableData: [],
      loading: false,
      queryParams: {
      }, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      formOption: {
        inline: true,
        formAlign: 'right',
        isSearch: true,
        emptyBtn: true,
        submitBtnText: '查询',
        cancal: false,
        labelWidth: 'auto',
        column: [
          {
            label: "数据源",
            prop: "systemName",
            formSlot: true,
            span: 6
          },
          {
            label: "账号名称",
            prop: "secretName",
            span: 6
          },
          {
            label: "密钥",
            prop: "secret",
            span: 6
          },
        ]
      },
      option: {
        addBtnText: '添加',
        searchBtnText: '查询',
        emptyBtn: true,
        cancal: false,
        addBtn: this.$permissionMatch("risk_mgr_zhang_hao_guan_li_bao_cun"),
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        search: false,
        page: true,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        labelWidth: '90px',
        size: 'mini',
        inline: false,
        formAlign: 'right',
        column: [
          // {
          //   label: '数据源编号',
          //   prop: 'secret',
          //   addDisplay: false,
          //   editDisplay: false,
          // },
          {
            label: '数据源',
            prop: 'shortName',
            search: true,
            addDisplay: true,
            editDisplay: false,
            slot: true,
            // hide: true,
            type: 'select',
            dicUrl: '/mgr/risk/api/secret/list',
            dicData: [],
            props: {
              label: 'systemName',
              value: 'shortName'
            }
          },
          // {
          //   label: '简称',
          //   prop: 'short',
          //   slot: true,
          //   addDisplay: false,
          // },
          {
            label: '客户来源',
            prop: 'customer',
            // hide: true,
            type: 'select',
            filterable: true,
            allowcreate: true,
            dicUrl: '/mgr/risk/secret/customer/list',
            placeholder: '客户来源，可手动输入并选择',
            rules: [
              { required: true, message: '客户来源不能为空', trigger: 'change' },
            ]
          },
          {
            label: '账号名称',
            prop: 'secretName',
            search: true,
            rules: [
              { required: true, message: '账号名称不能为空', trigger: 'blur' },
            ]
          },
          {
            label: '密钥',
            prop: 'secret',
            search: true,
            addDisplay: false,
            editDisplay: false,
            rules: [
              { required: true, message: '账号名称不能为空', trigger: 'blur' },
            ]
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
          {
            label: '状态',
            prop: 'status',
            dicData: [
              {label: '启用', value: true},
              {label: '禁用', value: false}
            ],
            addDisplay: false,
            editDisplay: false
          },
        ]
      },
      dialogVisible: false, // 配置弹框
      rowData: {}, // 当前行数据
      formVisible: false,
      rowOption: {
        cancal: false,
        column: [
          {
            label: '账号名称',
            prop: 'secretName',
            search: true,
          }
        ]
      }
    }
  },
  filters: {
    getLabel (str) {
      console.log(str)
      return str
    }
  },
  created () {
    const arr = JSON.parse(JSON.stringify(this.option.column))
    getDataSource().then(res => {
      if(res.data.code == 0) {
        arr.filter(item => {
          if(item.prop == 'shortName') {
            item.dicData = res.data.data
            this.datasourceList = item.dicData.map(temp => {
              return { value: temp.shortName, label: temp.systemName }
            })
          }
        })
      }
    })
  },
  methods: {
    // 重置查询条件
    handleReset() {
      this.queryParams = {}
    },
    //   获取数据
    getList (page,reset) {
      // 分页参数
      reset && (this.page.currentPage = 1)
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      console.log(this.queryParams)
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
      accountList(temp).then(res => {
        if(res.data.code == 0) {
          this.tableData = res.data.data.records
          this.page.currentPage = res.data.data.current
          this.page.total = res.data.data.total
        }
      })
    },
    /**
     * 搜索回调
     */
    searchChange (form) {
      this.queryParams = form
      this.getList()
    },
    addRowHandle (form) {
      addAccount(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('添加成功')
          this.getList()
        }
      })
    },
    editHandle (row) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.formVisible = true
    },
    editRowHandle (form) {
      eidtAccount(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('修改成功')
          this.handleCloseForm()
          this.getList()
        }
      })
    },
    handleCloseForm () {
      this.rowData = {}
      this.formVisible = false
    },
    deleteRowHandle (row) {
      this.$confirm('确认删除？').then(_ => {
        deleteAccount(row.id).then(res => {
          if(res.data.code == 0) {
            this.$message.success('删除成功')
            this.getList()
          }
        })
      }).catch(_ => {})
    },
    // 启用或禁用
    enableHandle (row) {
      let str = ''
      if(row.status) {
        str = '禁用'
      }else{
        str = '启用'
      }
      this.$confirm('确认'+str+'？').then(_ => {
        enableAccount(row.id).then(res => {
          this.$message.success(str + '成功')
          this.getList()
        })
      }).catch(_ => {})
    },
    // 配置
    configRowHandle (row) {
      this.rowData = row
      this.dialogVisible = true
    },
    // 关闭配置
    handleClose () {
      this.dialogVisible = false
    },
    closeHandle (bool) {
      if(bool) {
        this.handleClose()
      }
    }
  }
}
</script>
<style lang="scss">
.datasource-list{
  .zebra-table-titleTop{
    .zebra-form .el-form-item.form-btn-bar .el-form-item__content{
      text-align: left;
    }
    .el-col{
      margin-bottom: 10px;
    }
    .zebra-form-autoflexable .el-form-item{
      margin-left: 0;
    }
    .pageheader-top{
      height: 30px;
      .pageheader-line{
        margin-left: 20px;
      }
      .title{
        margin-left: 16px;
      }
    }
    .table-top{
      .table-top-left{
        margin-left: 40px;
      }
    }
  }
  .search-form{
    .el-col-6:nth-last-of-type(1) {
      .el-form-item__content{
        text-align: left;
      }
    }
  }
}
.account-info-dialog{
  .el-dialog__body{
    overflow: hidden;
    overflow-y: auto;
  }
  .el-dialog__body::-webkit-scrollbar{
    display: none;
  }
}
.no-header-dialog{
  .el-dialog{
    background: #F0F2F5;
    .el-dialog__header{
      padding: 0;
      .el-dialog__headerbtn{
        z-index: 9;
        right: 10px;
        top: 10px;
      }
    }
    .el-dialog__body{
      padding: 10px 8px;
    }
  }
}
</style>
