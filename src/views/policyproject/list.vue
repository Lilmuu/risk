<template>
  <!-- 决策流管理 -->
  <div class="policy-list">
    <zebra-table
      pageheadertitle="决策流管理"
      :page="page"
      :loading="loading"
      :formData="queryParams"
      :defaultFormData="queryParams"
      :option="option"
      :data="tableData"
      @on-load="getList"
      @search-change="searchChange"
      @addRow="addRowHandle"
      @editRow="editRowHandle"
    >
      <template slot="version" scope="scope">
        <zebra-button type="text" size="mini" @click="handleVersion(scope.row, scope.index)">{{ scope.row.version }}</zebra-button>
      </template>
      <template slot="testState" scope="scope">
        <span>{{ scope.row.testState ? '已通过' : '未通过' }}</span>
      </template>
      <template slot="menuLeft" scope="scope">
        <zebra-button type="primary " size="mini" @click="handleAdd">新增决策流</zebra-button>
      </template>
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" v-if="scope.row.status == 0 || scope.row.status == 2" size="mini" @click="handleStatus(scope.row,1)">启用</zebra-button>
        <zebra-button type="text" v-if="scope.row.status == 1" size="mini" @click="handleStatus(scope.row,0)">停用</zebra-button>
        <zebra-button v-if="scope.row.status == 2" type="text" size="mini" @click="handleStatus(scope.row,0)">停用</zebra-button>
<!--        <zebra-button type="text" size="mini" @click="handleDesign(scope.row, scope.index)">设计</zebra-button>-->
        <zebra-button v-if="scope.row.status == 0" type="text" size="mini" @click="handleDesign(scope.row, scope.index)">修改</zebra-button>
<!--        <zebra-button type="text" size="mini" @click="handleEdit(scope.row, scope.index)">修改</zebra-button>-->
        <zebra-button type="text" size="mini" @click="handleView(scope.row, scope.index)">查看</zebra-button>
        <zebra-button type="text" size="mini" @click="handleTest(scope.row, scope.index)">测试</zebra-button>
<!--        <zebra-button type="text" size="mini" @click="handleDelete(scope.row, scope.index)">删除</zebra-button>-->
      </template>
    </zebra-table>
    <!-- 测试 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose">
      <infoForm :rowData="rowData" />
    </el-dialog>
    <el-dialog
      v-if="versionVisible"
      title="版本选择"
      width="80%"
      top="5vh"
      append-to-body
      :visible.sync="versionVisible"
      :before-close="versionClose">
      <zebra-table
        :loading="versionLoading"
        :option="versionOption"
        :data="versionTableData"
        @on-load="getVersionList"
      >
        <template slot="testState" scope="scope">
          <span>{{ scope.row.testState ? '已通过' : '未通过' }}</span>
        </template>
        <template slot="menu" slot-scope="scope">
          <zebra-button type="text" v-if="scope.row.status == 0 || scope.row.status == 2" size="mini" @click="handleStatus(scope.row,1)">启用</zebra-button>
          <zebra-button type="text" v-if="scope.row.status == 1" size="mini" @click="handleStatus(scope.row,0)">停用</zebra-button>
          <zebra-button v-if="scope.row.status == 2" type="text" size="mini" @click="handleStatus(scope.row,0)">停用</zebra-button>
<!--          <zebra-button type="text" size="mini" @click="handleDesign(scope.row, scope.index)">设计</zebra-button>-->
          <zebra-button v-if="scope.row.status == 0" type="text" size="mini" @click="handleDesign(scope.row, scope.index)">修改</zebra-button>
<!--          <zebra-button type="text" size="mini" @click="handleView(scope.row, scope.index)">查看</zebra-button>-->
<!--          <zebra-button type="text" size="mini" @click="handleTest(scope.row, scope.index)">测试</zebra-button>-->
<!--          <zebra-button v-if="!scope.row.status" type="text" size="mini" @click="handleDelete(scope.row, scope.index)">删除</zebra-button>-->
<!--          <zebra-button v-if="!scope.row.status" type="text" size="mini" @click="selectVersion(scope.row, scope.index)">选择</zebra-button>-->
          <el-dropdown>
            <span class="menu-more">
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
<!--              <el-dropdown-item>-->
<!--                <zebra-button type="text" size="mini" @click="handleEdit(scope.row, scope.index)">修改</zebra-button>-->
<!--              </el-dropdown-item>-->
              <el-dropdown-item>
                <zebra-button type="text" size="mini" @click="handleView(scope.row, scope.index)">查看</zebra-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <zebra-button type="text" size="mini" @click="handleTest(scope.row, scope.index)">测试</zebra-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <zebra-button type="text" size="mini" @click="handleDelete(scope.row, scope.index)">删除</zebra-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </zebra-table>
    </el-dialog>
    <!-- 测试 -->
    <el-dialog
      v-if="editVisible"
      width="30%"
      title="修改决策流"
      :visible.sync="editVisible"
      append-to-body
      :before-close="handleEditClose">
      <zebra-form :option="formOption" :formData="formData" @submit="handleSubmit"></zebra-form>
    </el-dialog>
  </div>
</template>
<script>
import {
  enableProject,
  getProjectList,
  deleteProject,
  getVersionList,
  chooseVersion,
  editProject,
  getProjectById,
  getBtnType,
  eventEnable
} from "./api";
import infoForm from './info'

export default {
  name: 'policy-group-list',
  components: { infoForm },
  data(){
    return {
      formData: {},
      formOption: {
        cancal: false,
        column: [
          {
            label: "决策流名称",
            prop: "name",
            rules: [
              // { required: true, message: "请输入文本框", trigger: "blur" },
            ]
          },
          {
            label: "决策流备注",
            prop: "remark",
            rules: [
              // { required: true, message: "请输入文本框", trigger: "blur" },
            ]
          },
        ]
      },
      versionLoading: false,
      editVisible: false,
      versionOption: {
        addBtn: false,
        searchBtnText: '查询',
        emptyBtn: false,
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        menuWidth: '200px',
        labelWidth: '90px',
        size: 'mini',
        inline: false,
        // search: true,
        formAlign: 'right',
        column: [
          {
            label: '决策流编号',
            prop: 'no',
          },
          {
            label: '决策流名称',
            prop: 'name',
            search: true
          },
          {
            label: '关联事件',
            prop: 'eventName',
          },
          {
            label: '测试状态',
            prop: 'testState',
            slot: true,
          },
          {
            label: '决策流状态',
            prop: 'status',
            dicData:[
              {
                value:0,
                label:'停用'
              },
              {
                value:1,
                label:'启用'
              },
              {
                value:2,
                label:'验证中'
              },
            ]
          },
          // {
          //   label: '创建人',
          //   prop: 'createBy',
          // },
          // {
          //   label: '创建时间',
          //   prop: 'createTime',
          //   datetype: 'datetime',
          //   format: "yyyy-MM-dd hh:mm:ss",
          //   valueFormat: "yyyy-MM-dd hh:mm:ss",
          //   search: true
          // },
          {
            label: '备注',
            prop: 'remark',
          },
          {
            label: '版本号',
            prop: 'version',
          },
        ]
      },
      versionTableData: [],
      versionVisible: false,
      groupNo: '',
      tableData: [],
      loading: false,
      rowData: {}, // 行数据
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
      },
      option: {
        addBtn: false,
        searchBtnText: '查询',
        emptyBtn: false,
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        search: true,
        page: true,
        showOverflow: true,
        menuWidth: '200px',
        align: 'center',
        menuAlign: 'center',
        labelWidth: '90px',
        size: 'mini',
        inline: false,
        // search: true,
        formAlign: 'right',
        column: [
          {
            label: '决策流编号',
            prop: 'no',
          },
          {
            label: '决策流名称',
            prop: 'name',
            search: true
          },
          {
            label: '关联事件',
            prop: 'eventName',
          },
          {
            label: '测试状态',
            prop: 'testState',
            slot: true,
          },
          {
            label: '决策流状态',
            prop: 'status',
            search: true,
            type: 'select',
            clearable: true,
            dicData:[
              {
                value:0,
                label:'停用'
              },
              {
                value:1,
                label:'启用'
              },
              {
                value:2,
                label:'验证中'
              },
            ]
          },
          {
            label: '创建人',
            prop: 'createBy',
          },
          {
            label: '创建时间',
            prop: 'createTime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
            search: true
          },
          {
            label: '备注',
            prop: 'remark',
          },
          {
            label: '版本号',
            prop: 'version',
            slot: true,
          },
        ]
      },
      dialogVisible: false,
      detailInfo: {}
    }
  },
  created() {
    // getStrategyType().then(res => {
    //   console.log(res)
    // })
  },
  methods: {
    // 选择版本
    selectVersion(row) {
      chooseVersion(row.no).then(res => {
        if (res.data && res.data.code == 0) {
          this.$message.success('版本切换成功！')
          this.versionVisible = false
          this.getList()
        }
      })
    },
    // 版本切换
    handleVersion(row, index) {
      this.groupNo = row.groupNo
      this.versionVisible = true
    },
    // 关闭版本列表弹窗
    versionClose() {
      this.versionVisible = false
    },
    // 获取版本列表数据
    getVersionList() {
      this.versionLoading = true
      getVersionList(this.groupNo).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          this.versionTableData = [...data]
          this.versionLoading = false
        }
      })
    },
    //   获取数据
    getList (page) {
      this.loading = true
      // 分页参数
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize,
      }
      let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
      getProjectList(temp).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          this.tableData = [...data.records]
          this.page.total = data.total
          this.loading = false
        }
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
      console.log(form)
    },
    editRowHandle (form) {
      console.log(form)
    },
    handleStatus(row,status) {
      if(row.eventId && status){
        getBtnType(row.eventId).then(res => {
          const h = this.$createElement;
          this.$msgbox({
            title: '提示',
            message: h('div', null ,[
              h('p', {style:'font-size:16px;font-weight:700;margin-bottom:10px;'}, '确认调整为启用状态？ '),
              res.data.data.exist && h('p', {style:'font-size:16px;font-weight:700;'}, `特别提醒：“${row.eventName}”已有启用的决策流“${res.data.data.strategyName}”，启用新决策流后原启用的决策流会变更为停用状态 `)
            ]),
            confirmButtonText: '确定',
          }).then(action => {
            if(action == 'confirm'){
              eventEnable(row.id,status).then(res => {
                if (res.data && res.data.code == 0) {
                  this.$message.success('操作成功！')
                  this.versionVisible = false
                  this.getList()
                }
              })
            }
          });
        })
        return
      }
      const name = row.eventId ? eventEnable : enableProject
      name(row.id,status).then(res => {
        if (res.data && res.data.code == 0) {
          this.$message.success('操作成功！')
          this.versionVisible = false
          this.getList()
        }
      })
    },
    handleAdd() {
      this.$router.push({ path: 'policyProjectAdd' })
    },
    handleDesign(row, index) {
      this.$router.push({ path: 'policyProjectAdd', query: row })
    },
    handleEdit(row, index) {
      getProjectById(row.id).then(res => {
        if (res.data && res.data.code == 0) {
          this.formData = JSON.parse(JSON.stringify(res.data.data))
          this.editVisible = true
        }
      })
    },
    handleSubmit() {
      editProject(this.formData).then(res => {
        if (res.data && res.data.code == 0) {
          this.$message.success('修改成功')
          this.handleEditClose()
          this.getList()
        }
      })
    },
    handleEditClose() {
      this.editVisible = false
      this.formData = {}
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteProject(row.id).then(res => {
          if (res.data && res.data.code == 0) {
            this.$message.success('删除成功！')
            // this.getList()
            this.getVersionList()
          }
        })
      }).catch(() => {
      });
    },
    handleView (row, index) {
      this.$router.push({ path: 'policyProjectSee', query: row })
    },
    handleTest(row, index) {
      this.rowData = row
      this.dialogVisible = true
    },
    handleClose () {
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="scss">
.menu-more{
  margin-left: 10px;
  //padding: 7px 15px;
  cursor: pointer;
  color: #409EFF;
  font-size: 12px;
  border-radius: 3px;
  &:hover{
    color: #66b1ff;
  }
}
</style>
