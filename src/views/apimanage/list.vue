<template>
  <!-- 接口管理 -->
  <div class="apimanage-list">
    <zebra-table pageheadertitle="接口管理" :page="page" :loading="loading" :formData="queryParams" :defaultFormData="queryParams" :option="option" :data="tableData" @on-load="getList" @search-change="searchChange">
      <template slot="menu" slot-scope="scope">
        <zebra-button type="text" size="mini" @click="viewHandle(scope.row, scope.index)">详情</zebra-button>
        <!-- <zebra-button type="text" size="mini"> {{scope.row.status ? '停用' : '启用'}}</zebra-button> -->
      </template>
      <template slot="docUrl" slot-scope="scope">
        <div>
          <a v-if="hasHttp(scope.row.docUrl)" style="color:#409EFF;" :href="scope.row.docUrl" target="_blank">查看</a>
          <span v-else>{{scope.row.docUrl}}</span>
        </div>
      </template>
    </zebra-table>
    <!-- 详情 -->
    <el-dialog
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      fullscreen
      class="no-header-dialog"
      :before-close="handleClose">
      <infoForm :detailInfo="detailInfo" />
    </el-dialog>
  </div>
</template>
<script>
import {apiList} from './api'
import infoForm from './info'
export default {
  name: 'apimanage-list',
  components: {infoForm},
  data(){
    return {
      tableData: [],
      loading: false,
      queryParams: {}, // 查询参数
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
        // pageSizes: [10, 20, 50, 100, 200, 500, 1000]
      },
      option: {
        addBtn: false,
        searchBtnText: '查询',
        // emptyBtn: false,
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        search: true,
        page: true,
        showOverflow: true,
        align: 'center',
        menuAlign: 'center',
        labelWidth: '90px',
        size: 'mini',
        inline: false,
        search: true,
        formAlign: 'right',
        column: [
          // {
          //   label: '接口编号',
          //   prop: 'apiNo',
          //   hide: true
          // },
          {
            label: '数据源名称',
            prop: 'fullName',
            search: true,
            type: 'select',
            filterable: true,
            dicUrl: '/mgr/risk/api/secret/list',
            props: {
              label: 'systemName',
              value: 'shortName'
            }
          },
          {
            label: '接口名称',
            prop: 'apiName',
            search: true,
            align: 'left'
          },
          {
            label: '说明',
            prop: 'info',
            align: 'left'
          },
          {
            label: '接口地址',
            prop: 'docUrl',
            slot: true
          },
          // {
          //   label: '接口状态',
          //   prop: 'status',
          //   search: true,
          //   type: 'select',
          //   // hide: true,
          //   dicData: [
          //     {label: '启用', value: true},
          //     {label: '停用', value: false}
          //   ]
          // },
          {
            label: '创建时间',
            prop: 'createTime',
            datetype: 'datetime',
            format: "yyyy-MM-dd hh:mm:ss",
            valueFormat: "yyyy-MM-dd hh:mm:ss",
            hide: true
          },
        ]
      },
      dialogVisible: false,
      detailInfo: {}
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
      apiList(temp).then(res => {
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
      this.page.currentPage = 1
      this.getList()
    },
    viewHandle (row, index) {
      this.detailInfo = row
      this.dialogVisible = true
    },
    handleClose () {
      this.dialogVisible = false
    },
    hasHttp (url) {
      if(url.includes('http') || url.includes('https')) {
        return true
      }else{
        return false
      }
    }
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
}
.no-header-dialog{
  .el-dialog{
    background: #F0F2F5;
    .el-dialog__header{
      padding: 0;
      .el-dialog__headerbtn{
        z-index: 9;
        right: 15px;
        top: 10px;
      }
    }
    .el-dialog__body{
      padding: 10px 8px;
    }
  }
}
</style>