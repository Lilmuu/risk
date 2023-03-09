<template>
<!-- 变量绑定 -->
  <div class="variable-bind-list">
    <zebra-table
      class="variable-table"
      pageheadertitle="变量中心"
      :page="page"
      :loading="loading"
      :option="option"
      :data="tableData"
      :formData="queryParams"
      @on-load="getList"
      @search-change="searchChange"
      @addRow="addRowHandle"
      @editRow="editRowHandle"
      @delRow="delRowHandle"
    >
      <!-- 表格顶部, 在left和right之上 -->
      <template slot="headerTop">
        <zebra-form :option="formOption" :formData="formData" @submit="handleQuery" @reset="handleReset"></zebra-form>
      </template>
      <!-- 表格顶部左侧 -->
      <template slot="menuLeft" scope="scope">
        <div style="display: inline-flex;">
          <el-upload
            :action="'/mgr/risk/variable/import'"
            :on-success="successHandle"
            :headers="uploadHeader"
            multiple
            :show-file-list="false"
          >
            <zebra-button style="margin-left: 8px" size="mini" type="primary">导入</zebra-button>
          </el-upload>
  <!--        <zebra-button size="mini" type="primary" @click="handleImport">导入</zebra-button>-->
          <zebra-button style="margin-left: 8px" size="mini" type="primary" @click="handleExport">导出</zebra-button>
        </div>
      </template>
      <template slot="menu" slot-scope="scope">
        <zebra-button size="mini" type="text" @click="designHandle(scope.row, scope.index)">设计</zebra-button>
      </template>
    </zebra-table>
    <el-dialog
      class="no-header-dialog-variable variable-design"
      append-to-body
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      :before-close="handleClose"
    >
      <variableDesign ref="variableDesign" :rowData="rowData" @close="closeHandle" />
    </el-dialog>
  </div>
</template>
<script>
import store from "@/store";
import variableDesign from './variable'
import {variableList, addVariable, editVariable, delVariable, exportVariable,} from './api'
export default {
  name: 'variable-bind',
  components: {variableDesign},
  data(){
    return {
      uploadHeader: {
        tenantId: store.getters.userInfo.tenantId,
        Authorization: store.getters.access_token
      },
      tableData: [],
      loading: false,
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      formData: {
        // name: '',
        // remark: '',
        // startTime: '',
        // endTime: ''
        dateRange: []
      },
      formOption: {
        inline: true,
        isSearch: true,
        submitBtnText: '查询',
        cancal: false,
        column: [
          {
            label: "变量名称",
            prop: "name",
            span: 5
          },
          {
            label: "变量说明",
            prop: "remark",
            span: 5
          },
          {
            label: "日期时间范围",
            prop: "dateRange",
            type: "datePicker",
            datetype: "datetimerange",
            span: 8
          }
        ]
      },
      option: {
        viewBtn: false,
        page: true,
        search: true,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        searchBtnText: '查询',
        cancal: false,
        labelWidth: '90px',
        column: [
          {
            label: '编号',
            prop: 'no',
            // search: true,
            addDisplay: false,
            editDisplay: false,
            // hide: true
          },
          {
            label: '变量名称',
            prop: 'name',
            // search: true,
            rules: [
              { required: true, message: '请输入变量名称', trigger: 'blur' },
            ]
          },
          {
            label: '生成方式',
            prop: 'resourceType',
            // search: true,
            hide: true,
            type: 'select',
            dicData: [
              {label: '自定义', value: '自定义'},
              {label: '系统生成', value: '系统生成'}
            ],
            addDisplay: false,
            editDisplay: false,
          },
          {
            label: '变量说明',
            prop: 'remark',
            type: 'textarea'
          },
          {
            label: '创建人员',
            prop: 'createBy',
            addDisplay: false,
            editDisplay: false
          },
          {
            label: '创建时间',
            prop: 'createTime',
            type: "datePicker",
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
            addDisplay: false,
            editDisplay: false
          }
        ]
      },
      rowData: {},
      dialogVisible: false, // 设计弹框
    }
  },
  methods: {
    // 查询表格
    handleQuery(form) {
      const params = {
        name: form.name,
        remark: form.remark,
        startTime: form.dateRange && form.dateRange.length > 0 ? form.dateRange[0] : undefined,
        endTime: form.dateRange && form.dateRange.length > 0 ? form.dateRange[1] : undefined
      }
      this.queryParams = JSON.parse(JSON.stringify(params))
      this.page.currentPage = 1
      this.getList()
    },
    // 表格查询条件重置
    handleReset() {
      this.queryParams = {}
    },
    successHandle (res, file, fileList) {
      try {
        if(res.code == 0) {
          this.$message.success('导入成功')
          this.getList()
        } else {
          this.$message.error(res.msg)
        }
      } catch (err) {
      }
    },
    // 导出变量
    handleExport() {
      const arr = [...this.tableData]
      const strArr = []
      arr.forEach(item => {
        strArr.push(item.id)
      })
      const str = strArr.toString()
      this.$openUrl(`/mgr/risk/variable/export?ids=${str}`)
      // exportVariable({ ids: str}).then(res => {
      //   // console.log(res.data)
      //   // let url = URL.createObjectURL(new Blob([res.data]));
      //   // console.log(url)
      //   // let a = document.createElement("a");
      //   // document.body.appendChild(a);
      //   // a.href = url;
      //   // a.download = name;
      //   // a.target = "_blank";
      //   // a.click();
      //   // a.remove();
      // })
    },
    // 导入变量
    handleImport() {},
    //   获取数据
    getList (page) {
      // 分页参数
      let obj = {
        current: this.page.currentPage,
        size: this.page.pageSize
      }
      variableList(Object.assign(obj, this.queryParams)).then(res => {
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
    // 新增
    addRowHandle (form) {
      form.resourceType = '自定义'
      addVariable(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('添加成功')
          this.getList()
        }
      })
    },
    // 编辑
    editRowHandle (form) {
      form.resourceType = '自定义'
      editVariable(form).then(res => {
        if(res.data.code == 0) {
          this.$message.success('修改成功')
          this.getList()
        }
      })
    },
    // 删除
    delRowHandle (row) {
      this.$confirm('确认删除？').then(_ => {
        delVariable({no: row.no}).then(res => {
          if(res.data.code == 0) {
            this.$message.success('删除成功')
            this.getList()
          }
        })
      }).catch(_ => {})
    },
    // 设计
    designHandle (row, index) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      // this.$refs.variableDesign.init()
    },
    // 关闭设计
    handleClose () {
      this.dialogVisible = false
    },
    // 取消
    closeHandle (bool) {
      this.handleClose()
      if(bool) {
        this.getList()
      }
    }
  }
}
</script>
<style lang="scss">

.el-dialog.is-fullscreen {
  background-color: #f0f2f5;
  .el-dialog__header{
    margin: 8px;
    background-color: #ffffff;
    border-radius: 5px 5px 0 0;
    padding: 0;
  }
  .el-dialog__body{
    padding: 0;
    margin: 8px;
  }
}
</style>
<style lang="scss" scoped>
.variable-bind-list{
  ::v-deep.variable-table{
    .el-form-item{
      margin-bottom: 2px;
      //margin-right: 10px;
      margin-left: 28px;
      .el-form-item__label-wrap {
        margin-left: 0!important;
      }
    }
    .el-row{
      margin-left: 12px;
    }
    .table-top-left{
      display: flex;
    }
  }
}
</style>
