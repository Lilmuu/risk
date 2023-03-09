<template>
    <div class="pythonManage">
        <zebra-table
            pageheadertitle="python脚本管理"
            :page="page"
            :loading="loading"
            :formData="queryParams"
            :defaultFormData="queryParams"
            :option="option"
            :data="tableData"
            @on-load="getList"
            >
            <template slot="headerTop">
                <zebra-form style="margin-left: 40px" :option="formOption" @submit="handleSubmits" @reset="handleReset" :formData="queryParams">
                    <template slot="systemNameForm" slot-scope="scope">
                        <el-select filterable @change="shortNameChange" v-model="queryParams.shortName" placeholder="请选择数据源">
                            <el-option
                            v-for="item in shortNameList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                    <template slot="apiNameForm" slot-scope="scope">
                        <el-select filterable v-model="queryParams.apiName" placeholder="请选择接口名称">
                            <el-option
                            v-for="item in apiNameList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                </zebra-form>
            </template>
            <template slot="menuLeft" scope="scope">
                <zebra-button type="primary " size="mini" @click="handleAdd">新增</zebra-button>
                <!-- <zebra-button type="primary " size="mini" @click="handlePreview(true)">预览</zebra-button> -->
                <zebra-button type="primary " size="mini" @click="handlePreview(false)">下载</zebra-button>
            </template>
            <template slot="menu" slot-scope="scope">
                <zebra-button type="text" size="mini" @click="handleEdit(scope.row)">修改</zebra-button>
                <zebra-button type="text" size="mini" @click="handleDelete(scope.row)">删除</zebra-button>
                <zebra-button type="text" size="mini" @click="handleDetail(scope.row)">详情</zebra-button>
            </template>
        </zebra-table>
        <el-dialog
        v-if="dialogVisible"
        append-to-body
        :visible.sync="dialogVisible"
        fullscreen
        class="view-python-formDetail"
        :before-close="handleClose">
            <div >
                <CustomForm :title="dialogTitle" ref="customForm" :shortNameList="shortNameList"></CustomForm>
            </div>
            <div slot="footer" class="dialog-footer" style="text-align:center;">
                <template v-if="dialogTitle != '详情'">
                    <el-button type="primary" :loading="loadingSubmit" size="small" @click="handleSubmit">提交</el-button>
                    <el-button size="small" @click="handleClose">取消</el-button>
                </template>
                <template v-else>
                    <el-button size="small" @click="handleClose">关闭</el-button>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { eventsListOption,formOption,previewUrl } from './tableColumn'
import { getSecretList,getSearchList,getTableList,saveList,deleteList,editList,detailList,getDocUrl } from './api'
import CustomForm from './form.vue'
export default {
    name:'pythonMange',
    components:{CustomForm},
    data() {
        return {
            tableData: [],
            loading: false,
            queryParams: {}, // 查询参数
            page: {
                total: 0, // 总页数
                currentPage: 1, // 当前页数
                pageSize: 10, // 每页显示多少条
                pageSizes: [10, 20, 50, 100, 200, 500, 1000],
            },
            option: eventsListOption,
            formOption,
            dialogVisible: false,
            dialogTitle:'新增',
            shortNameList:[],
            apiNameList:[],
            loadingSubmit:false
        }
    },
    mounted() {
        this.getShortNameList()
    },
    methods: {
        async getList (page,reset) {
            reset && (this.page.currentPage = 1)
            this.loading = true
            let param = {
                current: this.page.currentPage,
                size: this.page.pageSize,
                ...this.queryParams,
            }
            const res = await getTableList(param)
            this.loading = false
            this.tableData = res.data.data.records
            this.page.total = res.data.data.total
        },
        async getShortNameList(){
            const res = await getSecretList()
            this.shortNameList = res.data.data.map(el => {
                return {
                    label:el.systemName,
                    value:el.shortName
                }
            })
            this.getSearchList()
        },
        async getSearchList(){
            const res = await getSearchList({size:500,current:1})
            this.apiNameList = res.data.data.records.map(el => {
                return {
                    label:this.queryParams.shortName ? el.apiName : `${el.apiName}-${el.fullName}`,
                    value:this.queryParams.shortName ? el.apiName : `${el.apiName}-${el.shortName}`
                }
            })
        },
        async shortNameChange(val){
            this.queryParams.apiName && (this.queryParams.apiName = '')
            let param = {
                size:500,
                current:1,
                fullName:val
            }
            const res = await getSearchList(param)
            this.apiNameList = res.data.data.records.map(el => {
                return {
                    label:el.apiName,
                    value:el.apiName
                }
            })
        },
        handleClose () {
            this.$refs.customForm.resetForm()
            this.dialogVisible = false
        },
        handleAdd(){
            this.dialogVisible = true
            this.dialogTitle = '新增'
        },
        handlePreview(status){
            getDocUrl().then(res => {
                if(res.data.data){
                    status ? window.open(`${previewUrl}onlinePreview?url=${encodeURIComponent(btoa(res.data.data))}`) : this.DownloadFile(res.data.data)
                }
            })
        },
        DownloadFile(url){
            const urls = url.indexOf('docx?') !== -1 ? url.split('docx?')[0] + 'docx' : url
            const link = document.createElement('a');
            link.href = urls;
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        },
        handleSubmit(){
            this.$refs.customForm.validForm().then(res => {
                this.loadingSubmit = true
                const apiName = this.dialogTitle == '新增' ? saveList : editList
                apiName(res).then(() => {
                    this.$message.success(`${this.dialogTitle}成功`)
                    this.dialogVisible = false
                    this.getList()
                }).finally(() => {
                    this.loadingSubmit = false
                })
            })
        },
        handleReset() {
            this.queryParams.apiName = ''
            this.queryParams.shortName = ''
            this.getSearchList()
        },
        handleSubmits(data){
            this.queryParams = data
            this.getList('','reset')
        },
        handleEdit(row){
            this.dialogVisible = true
            this.dialogTitle = '修改'
            this.$nextTick(() => {
                this.$refs.customForm.setDataOfForm(row,'edit')
            })
        },
        handleDelete(row){
            this.$confirm(
                '确定删除该数据？',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }
            ).then(() => {
                deleteList(row.id).then(() => {
                    this.$message.success('删除成功')
                    this.getList()
                })
            })
        },
        handleDetail(row){
            this.dialogVisible = true
            this.dialogTitle = '详情'
            this.$nextTick(() => {
                detailList(row.id).then(res => {
                    this.$refs.customForm.setDataOfForm(res.data.data,'detail')
                })
            })
        }
    },
}
</script>

<style lang="scss" scoped>
.pythonManage{
    ::v-deep .zebra-form-autoflexable .el-form-item .el-form-item__content{
        overflow: hidden;
    }
}
</style>
<style lang="scss">
.view-python-formDetail{
  .el-dialog__header{
    padding: 0!important;
    .el-dialog__headerbtn{
      z-index: 1;
    }
  }
  .el-dialog__body{
    padding: 0!important;
    height: calc(100% - 78px);
    overflow: hidden;
    overflow-y: auto;
    background: #ffffff;
    margin: 8px 10px 0 10px!important;
  }
  .el-dialog__body::-webkit-scrollbar{
    display: none;
  }
  .el-dialog__footer{
    background: #ffffff;
    margin: 0 10px 8px 10px!important;
  }
}
</style>