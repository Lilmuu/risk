<template>
    <zebra-table
        :page="page"
        :loading="loading"
        :option="option"
        :data="tableData"
        @on-load="getList"
        class="configTables"
        >
    </zebra-table>
</template>

<script>
import { configureListOption } from './tableColumn'
import { strategyList } from './api'
export default{
    props:{
        strategyNos:{
            typeof:Array,
            default:[]
        }
    },
    data(){
        return {
            tableData: [],
            loading: false,
            page: {
                total: 0, // 总页数
                currentPage: 1, // 当前页数
                pageSize: 10, // 每页显示多少条
                pageSizes: [10, 20, 50, 100, 200, 500, 1000],
            },
            option: configureListOption,
        }
    },
    methods: {
        getList () {
            this.loading = true
            const param = {
                size:this.page.pageSize,
                current:this.page.currentPage,
                ids:[...this.strategyNos]
            }
            strategyList(param).then(res => {
                this.loading = false
                this.tableData = res.data.data.records
                this.page.total = res.data.data.total
            })
        },
    }
}
</script>

<style lang="scss">
.configTables{
    .table-body-box{
        max-height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>