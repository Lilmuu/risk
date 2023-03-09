<template>
  <PageHeader :title="'测试明细'" style="padding: 0 30px">
    <div style="height: 20px; padding: 6px 0; display: flex">
      <div style="margin-right: 20px; color: #84CF65"><i class="el-icon-circle-check">：已执行</i></div>
      <div style="margin-right: 20px; color: #E6A23C"><i class="el-icon-warning-outline">：执行异常</i></div>
      <div style="margin-right: 20px; color: #F56C6C"><i class="el-icon-circle-close">：未执行</i></div>
    </div>
    <div style="display: flex;height: calc(100vh - 79px);">
      <!--        <div style="width: 230px;border-right: 1px solid #dce3e8;">-->
      <!--          <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>-->
      <!--        </div>-->
      <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
        <template v-for="node in rowData.nodeList">
          <flow-node
            :id="node.id"
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
          >
          </flow-node>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
      </div>
      <!--右侧表单-->
      <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
        <flow-node-form ref="nodeForm" :rowData="rowData" :isSee="true"></flow-node-form>
      </div>
    </div>
  </PageHeader>
</template>

<script>
import PageHeader from "@/components/page-header/PageHeader";
import {findIndex} from "lodash";
import './ef/jsplumb'
import flowNode from './ef/node'
import flowNodeForm from './ef/detailRightForm'
import {easyFlowMixin} from "./ef/mixins";
export default {
  name: "detail",
  components: { PageHeader, flowNode, flowNodeForm },
  mixins: [easyFlowMixin],
  props: {
    rowData: {
      type: Object
    }
  },
  data() {
    return {
      data: {},
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      // 激活的元素、可能是节点、可能是连线
      activeElement: {
        // 可选值 node 、line
        type: undefined,
        // 节点ID
        nodeId: undefined,
        // 连线ID
        sourceId: undefined,
        targetId: undefined,
        name: undefined
      },
    }
  },
  directives: {
    'flowDrag': {
      bind(el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      this.dataReload(this.rowData)
      // this.dataReload(this.rowData)
    })
  },
  methods: {
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    clickNode(node) {
      this.rightMenu = true
      this.activeElement.type = 'node'
      this.activeElement.nodeId = node.id
      this.activeElement.name = node.name
      // this.$refs.nodeForm.nodeInit(this.data, node.id)
    },
    // 加载流程图
    dataReload(data) {
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        // data = lodash.cloneDeep(data)
        data = JSON.parse(JSON.stringify(data))
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    jsPlumbInit() {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true);
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          // console.log(conn.sourceId)
          // console.log(this.data.nodeList)
          const index = findIndex(this.data.nodeList, ['id', conn.sourceId])
          // console.log(this.data.nodeList[index])
          this.rightMenu = this.data.nodeList[index].type === 'JUDGE';
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          // this.$refs.nodeForm.lineInit({
          //   from: conn.sourceId,
          //   to: conn.targetId,
          //   label: conn.getLabel(),
          // })
        })
        // 连线
        this.jsPlumb.bind("connection", (evt) => {
          let from = evt.source.id
          let to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({id: guid(new Date().getTime()), from: from, to: to, label: ''})
          }
          console.log(this.data)
        })

        // 连线右击
        this.jsPlumb.bind("contextmenu", (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind("beforeDrop", (evt) => {
          let from = evt.sourceId
          let to = evt.targetId
          if (from === to) {
            this.$message.error('节点不支持连接自己')
            return false
          }
          if (this.hasLine(from, to)) {
            this.$message.error('该关系已存在,不允许重复创建')
            return false
          }
          if (this.hashOppositeLine(from, to)) {
            this.$message.error('不支持两个节点之间连线回环');
            return false
          }
          this.$message.success('连接成功')
          return true
        })

        // beforeDetach
        this.jsPlumb.bind("beforeDetach", (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },
    // 加载流程图
    loadEasyFlow() {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        let node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        // this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
        this.jsPlumb.makeSource(node.id, Object.assign(this.jsplumbSourceOptions, {}))
        // // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            stop: function (el) {
              // 拖拽节点结束后的对调
              console.log('拖拽结束: ', el)
            }
          })
        }
      }
      // 初始化连线
      for (var i = 0; i < this.data.lineList.length; i++) {
        let line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          // connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          paintStyle: line.paintStyle ? line.paintStyle : undefined,
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },
  }
}
</script>

<style scoped>

</style>
