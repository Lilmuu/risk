<template>
  <PageHeader :title="'流程设计'" style="padding: 0 30px">
    <div v-if="easyFlowVisible" style="height: calc(100vh - 60px);">
      <el-row>
        <!--顶部工具菜单-->
        <el-col :span="24">
          <div class="ef-tooltar">
<!--            <el-button type="text" icon="el-icon-plus" size="large" @click="zoomAdd"></el-button>-->
<!--            <el-divider direction="vertical"></el-divider>-->
<!--            <el-button type="text" icon="el-icon-minus" size="large" @click="zoomSub"></el-button>-->
            <span style="margin-left: 30px; font-size: 14px">决策流名称：{{ data.name }}</span>
            <span style="margin-left: 30px; font-size: 14px">关联事件：{{ data.eventName }}</span>
<!--            <el-input v-model="data.name" size="mini" style="width: 20%"/>-->
            <span style="margin-left: 30px; font-size: 14px">决策流备注：{{ data.remark }}</span>
<!--            <el-input v-model="data.remark" size="mini" style="width: 30%"/>-->
            <div style="float: right;margin-right: 5px">
              <el-button size="mini" @click="handleGoBack">返回</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      <div style="display: flex;height: calc(100% - 47px);">
<!--        <div style="width: 230px;border-right: 1px solid #dce3e8;">-->
<!--          <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>-->
<!--        </div>-->
        <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
          <template v-for="node in data.nodeList">
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
        <!-- 右侧表单 -->
        <div v-show="rightMenu" style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
          <flow-node-form ref="nodeForm" :isSee="true" :groupList="groupList"></flow-node-form>
        </div>
      </div>
      <!-- 流程数据详情 -->
      <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
      <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
    </div>
  </PageHeader>

</template>

<script>
import { findIndex } from 'lodash'
import PageHeader from "@/components/page-header/PageHeader";
import { guid } from "@/util/util";
import draggable from 'vuedraggable'
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
import './jsplumb'
import { easyFlowMixin } from './mixins'
import flowNode from './node'
import nodeMenu from './node_menu'
import FlowInfo from './info'
import FlowHelp from './help'
import FlowNodeForm from './node_form'
// import lodash from 'lodash'
import { getDataA } from './data_A'
import { getDataB } from './data_B'
import { getDataC } from './data_C'
import { getDataD } from './data_D'
import { getDataE } from './data_E'
import { ForceDirected } from './force-directed'
import {getAllList} from "../../policygroup/api";
import {addProject, editProject, getProjectById} from "../api";

export default {
  data() {
    return {
      groupList: [],
      isEdit: false,
      rightMenu: false,
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 控制流程数据显示与隐藏
      flowInfoVisible: false,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      // 数据
      data: {},
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
      zoom: 0.5
    }
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp, PageHeader
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
  created() {
    // console.log(this.$route.query)
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      getProjectById(this.$route.query.id).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          const arr = []
          data.lineList.forEach(item => {
            const obj = { id: item.id, from: item.fromNo, to: item.toNo, data: JSON.parse(item.data), label: JSON.parse(item.data).label }
            arr.push(obj)
          })
          data.lineList = [...arr]
          data.nodeList.forEach(item => {
            item.data = JSON.parse(item.data)
            item.viewOnly = true
          })
          this.dataReload(data)
        }
      })
      this.getList()
    })
  },
  methods: {
    handleGoBack() {
      this.$router.go(-1)
    },
    //   获取数据
    getList (page) {
      // 分页参数
      let obj = {
        current: 1,
        size: 1000000,
        riskNodeType: 'STRATEGY_GROUP'
      }
      getAllList(obj).then(res => {
        if (res.data && res.data.code == 0) {
          const data = JSON.parse(JSON.stringify(res.data.data))
          this.groupList = [...data.records].map(item => {
            item.label = item.name
            item.value = item.no
            return item
          })
        }
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
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel(),
          })
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
    clickNode(node) {
      this.rightMenu = true
      this.activeElement.type = 'node'
      this.activeElement.nodeId = node.id
      this.activeElement.name = node.name
      this.$refs.nodeForm.nodeInit(this.data, node.id)
    },
    // 是否具有该线
    hasLine(from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine(from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu(nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    // 流程数据信息
    dataInfo() {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
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
        this.data.eventName = this.$route.query.eventName
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    // 模拟载入数据dataA
    dataReloadA() {
      this.dataReload(getDataA())
    },
    // 模拟载入数据dataB
    dataReloadB() {
      this.dataReload(getDataB())
    },
    // 模拟载入数据dataC
    dataReloadC() {
      this.dataReload(getDataC())
    },
    // 模拟载入数据dataD
    dataReloadD() {
      this.dataReload(getDataD())
    },
    // 模拟加载数据dataE，自适应创建坐标
    dataReloadE() {
      let dataE = getDataE()
      // let tempData = lodash.cloneDeep(dataE)
      let tempData = JSON.parse(JSON.stringify(dataE))
      let data = ForceDirected(tempData)
      this.dataReload(data)
      this.$message({
        message: '力导图每次产生的布局是不一样的',
        type: 'warning'
      });
    },
    zoomAdd() {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
  }
}
</script>
