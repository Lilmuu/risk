<template>
  <PageHeader :title="'查看规则'" style="padding: 0 30px">
    <div class="policy-box">
      <div style="position: absolute; right: 20px; top: 20px">
        <i class="el-icon-close close-icon" @click="handleCancel"/>
      </div>
      <zebra-form :option="formOption" :formData="formData"></zebra-form>
      <div class="create-rule">
        <div class="title">规则列表</div>
        <div style="height: 1px; width: 100%; background-color: #cccccc; margin: 0 10px 20px"/>
        <zebra-table
          :loading="loading"
          :option="option"
          :data="tableData"
          :page="page"
          @on-load="getList"
        >
        </zebra-table>
        <div class="param-list-box" v-if="tableData.length !== 0">
          <div style="padding: 0 10px 20px">
            <section class="param-string-section">
              <h4>关系式</h4>
              <div v-html="formatParamString(paramObjList, 'html')"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-button">
      <zebra-button size="mini" @click="handleCancel">返回</zebra-button>
    </div>
  </PageHeader>
</template>

<script>
import PageHeader from "@/components/page-header/PageHeader";
import { guid } from "@/util/util";
import {getAllList} from "../policygroup/api";
import {addStrategy, editStrategy} from "./api";
export default {
  name: "see",
  components: {PageHeader},
  data() {
    return {
      paramObjList: [],
      operatorList: [
        {label: '且', value: '&'},
        {label: '或', value: '|'}
      ],
      hadSelect: [],
      groupList: [],
      actNode: {},
      loading: false,
      isEdit: false,
      superNo: '',
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
        layout: "total, sizes, prev, pager, next, jumper", // 分页工具
      },
      option: {
        editBtn: false,
        delBtn:false,
        viewBtn: false,
        addBtn: false,
        menuWidth: 1,
        page: false,
        column: [
          {
            label: "规则名称",
            prop: "name",
          },
          {
            label: "规则描述",
            prop: "description",
          },
          {
            label: "规则备注",
            prop: "remark",
          }
        ]
      },
      tableData: [],
      tempData: {},
      formData: {
        name: '',
        strategyType: '',
        remark: ''
      },
      formOption: {
        labelWidth: '80px',
        btnHide: true,
        column: [
          {
            label: "规则名称",
            prop: "name",
            span: 6,
            disabled: true,
            placeholder: '请输入规则名称'
          },
          {
            label: "规则类型",
            prop: "strategyType",
            type: "select",
            filterable: true,
            disabled: true,
            allowcreate: true,
            dicUrl: '/mgr/risk/manage/strategy/type/list',
            placeholder: '请选择规则类型',
            span: 6
          },
          {
            label: "备注",
            disabled: true,
            // type: 'textarea',
            prop: "remark",
            placeholder: '请输入备注信息',
            span: 12
          },
        ]
      }
    }
  },
  created() {
    if (JSON.stringify(this.$route.query) !== '{}') {
      const data = JSON.parse(JSON.stringify(this.$route.query))
      this.tempData = JSON.parse(JSON.stringify(this.$route.query))
      this.isEdit = true
      Object.keys(this.formData).forEach(item => {
        this.formData[item] = data[item]
      })
      this.superNo = data.no
      if (data.paramObjList) {
        this.paramObjList = JSON.parse(data.paramObjList)
      }
    } else {
    }
  },
  watch: {
    tableData: {
      handler(newVal, oldVal) {
        const arr = [...newVal]
        this.groupList = arr.map(item => {
          item.label = item.name
          item.value = item.no
          return item
        })
      },
      deep: true
    }
  },
  methods: {
    // 根据value获取label
    getLabelByValue (val) {
      let str = val
      for(let i in this.groupList) {
        if(this.groupList[i].value == val) {
          str = this.groupList[i].label
        }
      }
      return str
    },
    formatParamString (list, tp) {
      if(list && list.length == 0) {
        return ""
      }
      let str = ""
      let html = ""
      let text = ""
      for(let p in list) {
        str += `${list[p].operator}`
        if(list[p].operator) {
          html += (list[p].operator == '&' ? ' 且 ' : ' 或 ')
          text += (list[p].operator == '&' ? ' 且 ' : ' 或 ')
        }
        if(list[p].list) {
          if(list[p].list.length > 1) {
            str += '('
            html += '('
            text += '('
          }
          for(let l in list[p].list) {
            if(list[p].list[l].type == 'variable') {
              str += `${list[p].list[l].str}`
              html += ('<b>' + this.getLabelByValue(list[p].list[l].str) + '</b>')
              if(tp == 'html') {
                list[p].list[l].text = this.getLabelByValue(list[p].list[l].str)
              }
              text += list[p].list[l].text
            }else{
              str += `${list[p].list[l].operator}`
              html += (list[p].list[l].operator == '&' ? '且' : '或')
              text += (list[p].list[l].operator == '&' ? '且' : '或')
            }
          }
          if(list[p].list.length > 1) {
            str += ')'
            html += ')'
            text += ')'
          }
        }
      }
      if(tp == 'html') {
        return html
      }else if(tp == 'text'){
        return text
      }else{
        return str
      }
    },
    //   获取数据
    getList (page) {
      if (this.isEdit) {
        this.loading = true
        // 分页参数
        let obj = {
          current: this.page.currentPage,
          // size: this.page.pageSize,
          superNo: this.superNo,
          riskNodeType: 'RULE'
        }
        let temp = Object.assign(obj, this.queryParams) // 查询参数，请求接口返回数据，设置page的total和currentPage
        getAllList(temp).then(res => {
          if (res.data && res.data.code == 0) {
            const data = JSON.parse(JSON.stringify(res.data.data))
            this.tableData = [...data.records]
            this.loading = false
            // this.page.total = data.total
          }
        })
      } else {
      }
    },
    addRowHandle(form) {
      console.log(form)
    },
    editRowHandle() {},
    // 取消
    handleCancel() {
      this.$router.go(-1)
    }
  },
}
</script>

<style lang="scss" scoped>
.policy-box/deep/{
  .close-icon {
    font-size: 16px;
    cursor: pointer;
  }
  //padding: 0 20px;
  margin-top: 16px;
  .create-rule{
    .title{
      color: #606266;
      font-size: 18px;
      font-weight: bold;
      padding: 10px 20px;
    }
  }
  .el-table .el-table__body-wrapper {
    height: calc(100vh - 360px)!important;
  }
  .param-list-box{
    .param-list-item{
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 10px;
      padding: 10px;
      .param-list-item-right{
        height: 48px;
        line-height: 48px;
      }
      .param-list-item-left{
        flex: 1;
        .param-list-item-right-item{
          display: flex;
          flex-wrap: wrap;
          .param-list-item-right-item-div{
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            // width: 50%;
            .el-select{
              // flex: 1;
              // min-width: 250px;
            }
            .el-select:nth-of-type(2) {
              margin-right: 0;
            }
          }
        }
        .el-input, .el-select{
          // margin: 0 5px;
          margin-right: 10px;
        }
      }
      .param-list-item-btn{
        width: 100%;
        margin-bottom: 10px;
      }
    }
    .param-list-item:nth-of-type(2n+1) {
      background: #f5f7fa;
    }
  }
  .param-string-section{
    div{
      b{
        display: inline-block;
        font-weight: 500;
        padding: 0 10px;
        background-color: #409EFF;
        text-align: center;
        color: #fff;
        margin: 0 5px;
        border-radius: 5px;
      }
    }
  }
}
.footer-button/deep/{
  //position: fixed;
  background-color: #ffffff;
  bottom: 0;
  padding: 10px 0;
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
