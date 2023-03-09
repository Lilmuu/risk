<template>
  <div class="rule-manage-info">
    <zebra-form :option="infoOption" :formData="detailInfo"></zebra-form>
    <h4>已选择规则明细</h4>
    <zebra-table :page="page" :option="ruleOption" :data="tableData"></zebra-table>
  </div>
</template>
<script>
export default {
  name: 'rule-manage-info',
  props: {
    detailInfo: {
      type: Object
    }
  },
  data(){
    return {
      info: {},
      infoOption: {
        disabled: true,
        btnHide: true,
        labelWidth: 'auto',
        column: [
          {
            label: '风控规则组名称',
            prop: 'name',
            span: 6
          },
          {
            label: '风控规则组类型',
            prop: 'type',
            span: 6
          },
          {
            label: '项目',
            prop: 'projectName', // ??????????????????
            span: 6
          },
          {
            label: '接口名称',
            prop: 'api',
            span: 6
          },
          {
            label: '数据源',
            prop: 'datasource', // ??????????????????????
            span: 12
          },
          {
            label: '数据名称',
            prop: 'dataname', // ??????????????
            span: 12
          },
          {
            label: '备注',
            prop: 'note',
            type: 'textarea'
          }
        ]
      },
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10, // 每页显示多少条
        pageSizes: [10, 20, 50, 100, 200, 500, 1000],
      },
      tableData: [{}],
      ruleOption: {
        addBtn: false,
        menu: false,
        align: 'center',
        menuAlign: 'center',
        page: true,
        column: [
          {
            label: '数据源',
            prop: 'datasource'
          },
          {
            label: '规则明细',
            prop: 'rule'
          },
          {
            label: '判断符',
            prop: 'judge'
          },
          {
            label: '数据类型',
            prop: 'type'
          },
          {
            label: '价格',
            prop: 'price'
          },
          {
            label: '值',
            prop: 'value'
          },
          {
            label: '结果',
            prop: 'result'
          },
          {
            label: '优先级',
            prop: 'sort'
          }
        ]
      }
    }
  }
}
</script>
<style lang="scss" scoped>

</style>