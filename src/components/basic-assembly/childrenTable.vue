<template>
  <div class="children-table">
    <slot name="headerTop"></slot>
    <zebra-form v-if="!option.search == false" :formData="formData" :defalutFormData="formData" class="search-form" :option="searchOption" @submit="searchHandle">
    </zebra-form>
    <div class="table-top">
      <div class="table-top-left">
        <el-button type="primary" :size="$store.state.params.btn.size || 'mini'" v-if="!(option.addBtn==false)" @click="addForm">{{option.addBtnText || '新增'}}</el-button>
        <slot name="menuLeft"></slot>
      </div>
      <div class="table-top-right">
        <slot name="menuRight"></slot>
      </div>
    </div>
    <h4 class="table-title">{{option.title}}</h4>
    <div class="children-table-header">
      <span v-for="item in option.column" :key="item.prop">{{item.label}}</span>
    </div>
    <div class="children-table-body" v-html="tableHtml">
      <!-- <div v-for="(item, index) in tableData" :key="'item'+index">
        <span v-for="(it, ix) in option.column" :key="it.prop+'cell'+ix">{{item[it.prop]}}</span>
      </div> -->
    </div>
    <el-dialog
      :title="title"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      width="75%"
      :before-close="handleClose">
      <zebra-form :formData="rowData" :defalutFormData="rowData" :option="formOpton" @submit="submitHandle">
      </zebra-form>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "children-table",
  props: {
    pageheadertitle: {
      type:String,
      default: '',
    },
    // 绑定表格 refs
    refs: {
      type: String,
      default: 'multipleTable'
    },
    // 是否显示表格头
    showHeader: {
      type: Boolean,
      default: true
    },
    // tip提示背景
    tooltipEffect: {
      type: String,
      default: 'light', // 'dark'
    },
    // 是否可以多选
    selectable: {
      type: Boolean,
      default: false
    },
    // 是否提示 等待加载loading
    loading: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: ''
    },
    // 是否显示顺序
    index: {
      type: Boolean,
      default: false
    },
    // 分页配置
    page: {
      type: Object,
      default: () => {
        return {
          total: 0, // 总页数
          currentPage: 1, // 当前页数
          pageSize: 20, // 每页显示多少条
          pageSizes: [20, 50, 100, 200, 500, 1000], // 分页大小
          layout: "total, sizes, prev, pager, next, jumper", // 分页工具
        }
      }
    },
    // 表格数据
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 搜索表单
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 表格配置
    option: {
      type: Object,
      default: () => {
        return {
          border: false, // 表格是否边框
          page: true, // 是否分页
          align: 'center', // body对齐
          menuAlign: 'center', // 表头对齐
          menuFix: 'right', // 操作栏固定位置
          menuWidth: 200, // 操作栏宽度
          search: false, // 是否开启查询
          showOverflow: true, // 超出是否合并移入悬浮tip显示
          
          // 搜索表单设置
          formAlign: 'right', //对其方式
          inline: false, // 表单项是否可以同行,当垂直方向空间受限且表单较简单时，可以在一行内放置表单
          labelWidth: 'auto', // label宽
          submitBtn: true, // 提交按钮是否显示，默认显示
          submitBtnText: '查询', // 提交按钮文字，默认 提交
          emptyBtn: true, // 重置按钮，默认显示
          emptyBtnText: '清空', // 重置按钮文字，默认 重置
          column: [
            {
              label: '', // 文字
              prop: '', // 字段
              search: false, // 是否搜索
              slot: false, // 是否自定义
              hide: true, // 当前列在表格是否隐藏
              color: '', // 颜色特殊显示
              align: '', // 默认与table保持一致，可自定义 left right center
              menuAlign: '', // 默认与table保持一致，可自定义 left right center
              type: '', // 文本类型，默认input
              dicData: [], // 字典数据
              showOverflow: true, // 超出是否合并移入悬浮tip显示

              // 搜索表单对应
              span: 24, // 表单项栅格比，默认24
              formSlot: false, // 表单项是否自定义

              // 新增、编辑、查看对应表单设置
              addDisabled: false, // 表单新增时是否禁止
              addDisplay: true, // 表单新增时是否可见
              editDisabled: false, // 表单编辑时是否禁止
              editDisplay: false, // 表单编辑是否可见
              viewDisplay: true, // 表单查看是否可见
            }
          ]
        }
      }
    },
    // 是否清空多选，随机数
    isClearSelect: {
      type: Number
    }
  },
  data () {
    return {
      searchForm: {},
      title: '', // 弹框标题
      dialogVisible: false,
      rowData: {}, // 行数据
      formOpton: {},
      optype: 'addRow', // 提交方式
      pagination: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
        pageSizes: [20, 50, 100, 200, 500, 1000], // 分页大小
        layout: "total, sizes, prev, pager, next, jumper", // 分页工具
      },
      // 搜索表单配置
      searchOption: {},
      tableData: [],
      tableHtml: '',
      tableHtmlList: []
    };
  },
  filters: {},
  created () {
    let searchObj = {}
    this.searchOption = JSON.parse(JSON.stringify(this.option))
    this.searchOption.labelWidth = 'auto'
    let temp = []
    for(let i in this.searchOption.column) {
      if(this.searchOption.column[i] && this.searchOption.column[i].search == true) {
        if(this.searchOption.column[i].formSlot == true) {
          this.searchOption.column[i].formSlot = false
        }
        searchObj[this.searchOption.column[i].prop] = null
        if(this.searchOption.column[i] && !this.searchOption.column[i].span) {
          this.searchOption.column[i].span = 4
        }
        temp.push(this.searchOption.column[i])
      }
    }
    // 去除搜索条件的校验
    for(let j in temp) {
      if(temp[j].rules && temp[j].rules.length > 0) {
        for(let k in temp[j].rules) {
          if(temp[j].rules[k].required && temp[j].rules[k].required === true) {
            temp[j].rules[k].required = false
          }
        }
      }
    }
    this.searchOption.column = temp
    this.searchOption.isSearch = true
    if(JSON.stringify(this.formData) == '{}') {
      this.formData = JSON.parse(JSON.stringify(searchObj))
    }
    this.$emit('on-load', this.page)
    this.tableData = JSON.parse(JSON.stringify(this.data))
    // this.tableHtml = 
    this.getTable(this.tableData)
    let tob = {
      list: this.tableData
    }
    for(let i in this.tableData) {
      if(!this.tableData[i].html) {
        this.tableData[i].html = ''
      }
      this.tableData[i].html = this.getTableHtml(this.tableData[i])
      // console.log(this.tableData[i].html)
      this.tableHtml += `<div>${this.tableData[i].html}</div>`
    }
    // console.log(this.tableData)
  },
  mounted () { },
  computed: {
    // tableData () {
    //   let data = JSON.parse(JSON.stringify(this.data))
    //   this.getTable(data)
    //   console.log(data)
    //   return data
    // }
  },
  methods: {
    // 行点击
    rowClick (row, column, cell, event) {
      this.$emit('row-click', { row, column, cell, event })
    },
    // 多选
    handleSelectionChange (selection) {
      this.$emit('selection-change', selection)
    },
    // 搜索
    searchHandle (form) {
      this.$emit('search-change', form)
    },
    // 清空
    emptyHandle () {
      this.searchForm={}
    },
    // 分页大小变化
    handleSizeChange (val) {
      this.page.pageSize=val
      this.$emit('on-load', this.page)
      this.$emit('size-change', this.page)
    },
    // 当前页改变
    handleCurrentChange (val) {
      this.page.currentPage=val
      this.$emit('on-load', this.page)
      this.$emit('current-change', this.page)
    },
    // 判断是否需要超出文字提示
    tooltipShow (item, option) {
      let temp = true
      temp = (item.showOverflow == false) ? (item.showOverflow && option.showOverflow) : (item.showOverflow || option.showOverflow)
      console.log(temp)
      return temp
    },
    // 关闭弹框
    handleClose () {
      this.rowData = {}
      this.dialogVisible = false
    },
    // 表单提交
    submitHandle (form) {
      if(this.optype == 'addRow') {
        this.$emit('addRow', form)
      }
      if(this.optype == 'editRow') {
        this.$emit('editRow', form)
      }
      this.handleClose()
    },
    // 新增
    addForm () {
      this.formOpton = JSON.parse(JSON.stringify(this.option))
      this.formOpton.submitBtnText = '提交'
      this.title = '新增'
      this.optype = 'addRow'
      this.formOpton.disabled = false
      this.formOpton.submitBtn = true
      this.formOpton.emptyBtn = true
      let temp = []
      for(let i in this.formOpton.column) {
        if(this.formOpton.column[i].addDisabled == true) {
          this.formOpton.column[i].disabled = true
        }
        if(this.formOpton.column[i].addDisplay != false) {
          temp.push(this.formOpton.column[i])
        }
      }
      this.formOpton.column = temp
      this.dialogVisible = true
    },
    // 查看
    viewHandle (row) {
      this.formOpton = JSON.parse(JSON.stringify(this.option))
      this.formOpton.submitBtnText = '提交'
      this.title = '查看'
      this.optype = 'viewRow'
      this.formOpton.disabled = true
      this.formOpton.submitBtn = false
      this.formOpton.emptyBtn = false
      this.rowData = row
      let temp = []
      for(let i in this.formOpton.column) {
        if(this.formOpton.column[i].viewDisplay != false) {
          temp.push(this.formOpton.column[i])
        }
      }
      this.formOpton.column = temp
      this.dialogVisible = true
    },
    editHandle (row) {
      this.formOpton = JSON.parse(JSON.stringify(this.option))
      this.formOpton.submitBtnText = '提交'
      this.title = '编辑'
      this.optype = 'editRow'
      this.formOpton.disabled = false
      this.formOpton.submitBtn = true
      this.formOpton.emptyBtn = true
      this.rowData = JSON.parse(JSON.stringify(row))
      let temp = []
      for(let i in this.formOpton.column) {
        if(this.formOpton.column[i].editDisabled == true) {
          this.formOpton.column[i].disabled = true
        }
        if(this.formOpton.column[i].editDisplay != false) {
          temp.push(this.formOpton.column[i])
        }
      }
      this.formOpton.column = temp
      this.dialogVisible = true
    },
    delHandle (row) {
      this.optype = 'delRow'
      this.$emit('delRow', row)
    },
    // 清空多选
    clearSelect () {
      this.$refs[this.refs].clearSelection()
    },
    getTable (data) {
      for(let i in data) {
        data[i].html = ''
        for(let j in this.option.column) {
          data[i].html += `<span>${data[i][this.option.column[j].prop] ? data[i][this.option.column[j].prop] : ''} <a style="color:#1890ff;">${data[i].extend ? data[i].extend : ''}</a></span>`
        }
        if(data[i][this.option.children] && data[i][this.option.children].length > 0) {
          this.getTable(data[i][this.option.children])
        }
      }
    },
    getTableHtml (obj) {
      let str = ''
      if(obj[this.option.children]) {
        str += '<div class="table-chislren-item">'
        for(let i in obj[this.option.children]) {
         str += obj[this.option.children][i].html
          this.getTableHtml(obj[this.option.children][i])
        }
        str += '</div>'
      }
      obj.html += str
      return obj.html
    }
  },
  watch: {
    isClearSelect: {
      handler(newVal, oldVal) {
        if(newVal != 0) {
          this.clearSelect()
        }
      }
    }
  }
};
</script>
<style lang="scss">
.children-table-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: #fff;
  span{
    display: table-column;
    text-align: left;
    background: #E5E5E5;
    font-size: 14px;
    font-family: Source Han Sans CN;
    font-weight: 600;
    color: #222222;
    flex: 1;
    padding: 8px 10px;
    border-bottom: 1px solid #EBEEF5;
  } 
}
.children-table-body{
  div{
    display: flex;
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    span{
      width: 25%;
      text-align: left;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      line-height: 23px;
      padding: 6px 0;
      font-size: 12px;
      display: block;
      border-bottom: 1px solid #EBEEF5;
    }
    // div:nth-of-type(2n) {
    //   background: #FAFAFA;
    // }
  }
  // div:nth-of-type(2n) {
  //   background: #FAFAFA;
  // }
  .table-chislren-item{
    span{
      text-indent: 10px;
    }
  }
}
</style>