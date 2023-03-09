<template>
    <div class="eventsManage">
        <zebra-table
            pageheadertitle="事件管理"
            :page="page"
            :loading="loading"
            :formData="queryParams"
            :defaultFormData="queryParams"
            :option="option"
            :data="tableData"
            @on-load="getList"
            @search-change="searchChange"
            >
            <template slot="strategyNumber" scope="scope">
                <span style="cursor: pointer;color: #409EFF;padding: 0 10px;" @click="handleConfig(scope.row.strategyNos)">{{ scope.row.strategyNumber }}</span>
            </template>
            <template slot="menuLeft" scope="scope">
                <zebra-button type="primary " size="mini" @click="handleAdd">新建事件</zebra-button>
            </template>
            <template slot="menu" slot-scope="scope">
                <zebra-button type="text" size="mini" v-if="scope.row.eventStatus == 0" :loading="loadingBtn == 0 && activeIndex == scope.index" @click="handleDelOrSub(scope.row.id,0,scope.index)">删除</zebra-button>
                <zebra-button type="text" size="mini" v-if="scope.row.eventStatus == 0 || scope.row.eventStatus == 2" :loading="loadingBtn == 1 && activeIndex == scope.index" @click="handleDelOrSub(scope.row.id,1,scope.index)">发布</zebra-button>
                <zebra-button type="text" size="mini" v-if="scope.row.eventStatus == 1" :loading="loadingBtn == 2 && activeIndex == scope.index" @click="handleDelOrSub(scope.row.id,2,scope.index)">下线</zebra-button>
                <zebra-button type="text" size="mini" v-if="scope.row.eventStatus != 1" @click="handleDetail(scope.row,0)">编辑</zebra-button>
                <zebra-button type="text" size="mini" @click="handleDetail(scope.row,1)">查看</zebra-button>
            </template>
        </zebra-table>
        <el-dialog
            v-if="dialogVisible"
            title="已配置决策流"
            width="80%"
            custom-class="configureModal"
            append-to-body
            :visible.sync="dialogVisible"
            :before-close="handleClose">
            <ConfigureTable :strategyNos="strategyNos"/>
            <div slot="footer" class="dialog-footer" style="text-align:center;">
                <el-button type="primary" size="small" @click="handleClose">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import ConfigureTable from './configureTable.vue'
import { eventsListOption } from './tableColumn'
import { getEventsList,eventStatusData,deleteTable,releaseTable,offline } from './api'
export default{
    name:'eventsMange',
    components:{
        ConfigureTable
    },
    data(){
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
            dialogVisible: false,
            detailInfo: {},
            strategyNos:[],
            loadingBtn:-1,
            activeIndex:-1
        }
    },
    methods: {
        async getList () {
            this.loading = true
            let param = {
                current: this.page.currentPage,
                size: this.page.pageSize,
                ...this.queryParams,
            }
            if(this.queryParams.updateTime && this.queryParams.updateTime.length){
                param.startTime = this.queryParams.updateTime[0]
                param.endTime = this.queryParams.updateTime[1]
                delete param.updateTime
            }
            const res = await getEventsList(param)
            this.loading = false
            this.tableData = res.data.data.records
            this.page.total = res.data.data.total
        },
        /**
         * 搜索回调
         */
        searchChange (form) {
            this.queryParams = form
            this.page.currentPage = 1
            this.getList()
        },
        handleClose () {
            this.dialogVisible = false
        },
        handleConfig(nums){
            this.strategyNos = nums
            this.dialogVisible = true
        },
        handleAdd(){
            this.$router.push({ path: 'eventSubmit',query:{title:'新建事件'} })
        },
        handleDelOrSub(id,status,index){
            this.activeIndex = index
            this.loadingBtn = status
            const interFaceName = status == 0 ? deleteTable : status == 1 ? releaseTable : offline
            interFaceName({id}).then(res => {
                if(res.data.code == 0){
                    this.loadingBtn = -1
                    this.activeIndex = -1
                    this.$message.success(`${status == 0 ? '删除' : status == 1 ? '发布' : '下线'}成功！`)
                    this.getList()
                }
            }).catch(err => {
                if(err) {
                    this.loadingBtn = -1
                    this.activeIndex = -1
                }
            })
        },
        handleDetail(row,status){
            this.$router.push({ path: 'eventSubmit',query:{title:status == 0 ? '编辑事件' : '事件详情',status,id:row.id,eventStatus:row.eventStatus} })
        }
    }
}
</script>

<style lang="scss" scoped>
.eventsManage{
    ::v-deep .zebra-form-autoflexable .el-form-item .el-form-item__content{
        overflow: hidden;
    }
}
</style>
<style lang="scss">
.configureModal{
    .el-dialog__body{
        padding: 0 20px;
    }
    .el-table .el-table__body-wrapper{
        height: auto!important;
    }
}
</style>