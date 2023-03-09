<template>
    <div class="tempTables">
        <div v-if="chooseTemp" class="checkEventsList">
            <p>选择事件</p>
            <el-radio-group @change="radioChange" v-model="event" size="small">
                <el-radio :label="item.value" v-for="item in eventLists" :key="item.value">{{item.label}}</el-radio>
            </el-radio-group>
        </div>
        <div v-if="chooseTemp" class="line"></div>
        <zebra-table
            :loading="loading"
            :option="option"
            :data="tableData"
            style="flex:1;"
            >
            <template slot="paramsName" slot-scope="scope">
                <div>{{`${scope.row.fieldEnglish}/${scope.row.fieldChina}`}}</div>
            </template>
            <template slot="fieldRequired" slot-scope="scope">
              <span>{{scope.row.fieldRequired ? '是' : '否'}}</span>
            </template>
        </zebra-table>
    </div>
</template>

<script>
import { tempListOption,returnListOption } from './tableColumn'
import { historyTableDetail,returnValue } from './api'
export default{
    props:{
        chooseTemp:{
            type:Boolean,
            default:true
        },
        eventLists:{
            type:Array,
            default:[]
        },
        eventHistoryId:{
            type:String,
            default:''
        }
    },
    data(){
        return {
            tableData: [],
            loading: false,
            option: this.chooseTemp ? tempListOption : returnListOption,
            event:''
        }
    },
    mounted(){
        this.event = this.eventHistoryId
        this.event && this.chooseTemp && this.getTableData(this.event)
        !this.chooseTemp && this.getReturnValue()
    },
    methods: {
        getReturnValue(){
            returnValue().then(res => {
                this.tableData = res.data.data
            })
        },
        radioChange(val){
            this.loading = true
            this.getTableData(val)
        },
        findProperty(){
            for(const key in this.eventLists){
                if(this.eventLists[key].value == this.event) return true
            }
            return false
        },
        getTableData(val){
            if(!this.findProperty()) return
            historyTableDetail({id:val}).then(res => {
                this.loading = false
                this.tableData = res.data.data.map(el => {
                    return {
                        temp:true,
                        paramsName:`${el.fieldEnglish}/${el.fieldChina}`,
                        ...el
                    }
                })
            })
        }
    }
}
</script>

<style lang="scss">
.configureModal{
    .el-dialog__body{
        padding: 0 20px;
        .el-table .el-table__body-wrapper{
            height: auto!important;
        }
    }
}
.tempTables{
    display: flex;
    max-height: 600px;
    .checkEventsList{
        overflow-y: auto;
        overflow-x: hidden;
        margin: 10px;
        padding: 10px;
        box-sizing: border-box;
        width: 30%;
        border: 1px solid rgba(215, 215, 215, 1);
        p{
            margin-top: 0;
        }
        .el-radio-group{
            display: flex;
            flex-flow: column;
            .el-radio{
                margin-bottom: 10px;
            }
            .el-radio:nth-last-of-type(1){
                margin-bottom: 0;
            }
        }
    }
    .line{
        width: 1px;
        background: rgba(215, 215, 215, 1);
        margin-top: 10px;
        box-sizing: border-box;
    }
    .el-table .el-table__body-wrapper .el-table__empty-block{
        min-height: unset;
    }
    .zebra-table .table-body-box .el-table .el-table__header-wrapper tr th{
        font-weight: normal;
    }
    .zebra-table .table-body-box .el-table .el-table__header-wrapper{
        margin-top: 2px;
    }
    .zebra-table{
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>