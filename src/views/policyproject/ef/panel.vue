<template>
  <PageHeader :title="'流程设计'" style="padding: 0 30px">
    <div v-if="easyFlowVisible" style="height: calc(100vh - 60px);">
      <el-row>
        <!--顶部工具菜单-->
        <el-col :span="24">
          <div class="ef-tooltar">
<!--            <el-button type="text" icon="el-icon-delete" size="large" @click="deleteElement" :disabled="!this.activeElement.type"></el-button>-->
<!--            <el-divider direction="vertical"></el-divider>-->
<!--            <el-button type="text" icon="el-icon-plus" size="large" @click="zoomAdd"></el-button>-->
<!--            <el-divider direction="vertical"></el-divider>-->
<!--            <el-button type="text" icon="el-icon-minus" size="large" @click="zoomSub"></el-button>-->
            <span style="margin-left: 20px; font-size: 14px">决策流名称：</span>
            <el-input v-model="data.name" size="mini" style="width: 18%"/>
            <span style="margin-left: 20px; font-size: 14px">关联事件：</span>
            <el-select filterable size="small" v-model="data.eventId" style="width: 18%" @change="$forceUpdate()">
              <el-option
                v-for="(item, key) in eventsList"
                :key="key"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <span style="margin-left: 20px; font-size: 14px">决策流备注：</span>
            <el-input v-model="data.remark" size="mini" style="width: 22%"/>
            <div style="float: right;margin-right: 5px">
              <el-button v-if="isEdit" type="primary" :loading="loadingBtn1" size="mini" @click="handleSubmit(true,1)">发布为新版本</el-button>
              <el-button type="primary" size="mini" :loading="loadingBtn2" @click="handleSubmit(false,2)">发布并验证</el-button>
              <el-button size="mini" @click="handleGoBack">返回</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      <div style="display: flex;height: calc(100% - 47px);">
        <div style="width: 180px;border-right: 1px solid #dce3e8;">
          <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
        </div>
        <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
          <template v-for="node in data.nodeList">
            <flow-node
              :id="node.id"
              :key="node.id"
              :node="node"
              :activeElement="activeElement"
              @handleContextMenu="handleContextMenu"
              @changeNodeSite="changeNodeSite"
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
          <flow-node-form ref="nodeForm" :groupList="groupList" @getCoverType="getCoverType" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"></flow-node-form>
        </div>
      </div>
      <!-- 流程数据详情 -->
      <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
      <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
    </div>
    <div class="context-menu" :style="displayStyle"><div class="context-menu-text" @click="deleteElement">删除</div></div>
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
import {addProject, editProject, getProjectById, releaseProject,eventData} from "../api";
export default {
  data() {
    return {
      coverTypeTemp: undefined,
      tempNo: '',
      displayStyle: 'display: none;',
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
      zoom: 1,
      eventsList:'',
      loadingBtn1:false,
      loadingBtn2:false
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
        el.onmouseenter = (e) => {
        }
        el.onmouseleave = (e) => {
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
    if (this.$route.query.id) {
      this.isEdit = true
    }
    const that = this
    window.addEventListener('mouseup', function() {
      that.displayStyle = 'display: none;'
    });
  },
  mounted() {
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
        // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      if (this.isEdit) {
        // console.log(this.$route.query.id)
        getProjectById(this.$route.query.id).then(res => {
          if (res.data && res.data.code == 0) {
            const data = JSON.parse(JSON.stringify(res.data.data))
            this.tempNo = data.groupNo
            this.coverTypeTemp = data.coverType
            this.$refs.nodeForm.setCoverType(data.coverType)
            const arr = []
            data.lineList.forEach(item => {
              const obj = { id: item.id, from: item.fromNo, to: item.toNo, data: JSON.parse(item.data), label: JSON.parse(item.data).label }
              arr.push(obj)
            })
            data.lineList = [...arr]
            data.nodeList.forEach(item => {
              item.data = JSON.parse(item.data)
            })
            this.dataReload(data)
          }
        })
      } else {
        this.dataReload(getDataD())
      }
      this.getList()
    })
    
    },
  methods: {
    async getEventsList(){
      const res = await eventData()
      this.eventsList = res.data.data.map(el => {
        return {
          value:el.id,
          label:el.eventName
        }
      })
      if(this.$route.query.eventId){
        for(const key in this.eventsList){
          if(this.$route.query.eventId == this.eventsList[key].value){
            return this.data.eventId = this.$route.query.eventId
          }else{
            this.data.eventId = this.$route.query.eventName
          }
        }
      }
    },
    scrollFunc(e) {
      e = e || window.event;
      if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) { //当滑轮向上滚动时
          this.zoomAdd()
        }
        if (e.wheelDelta < 0) { //当滑轮向下滚动时
          this.zoomSub()
        }
      } else if (e.detail) {  //Firefox滑轮事件
        if (e.detail> 0) { //当滑轮向下滚动时
          this.zoomSub()
        }
        if (e.detail< 0) { //当滑轮向上滚动
          this.zoomAdd()
        }
      }
    },
    handleEnter() {
      const str = navigator.userAgent.indexOf('Firefox') ? 'DOMMouseScroll' : 'onmousewheel'
      document.getElementById('efContainer').addEventListener(str, this.scrollFunc, false);
      //Safari与Chrome属于同一类型
      document.getElementById('efContainer').onmousewheel = this.scrollFunc;
    },
    handleLeave() {
      const str = navigator.userAgent.indexOf('Firefox') ? '' : 'onmousewheel'
      document.getElementById('efContainer').removeEventListener(str, this.scrollFunc, false);
    },
    // 返回
    handleGoBack() {
      this.$router.go(-1)
    },
    getCoverType(type) {
      this.coverTypeTemp = type
    },
    // 提交
    handleSubmit(isRelease,status) {
      status == 1 ? this.loadingBtn1 = true : this.loadingBtn2 = true
      let bool = true
      this.data.nodeList.forEach((item, key) => {
        if (item.type === 'JUDGE') {
          const index = findIndex(this.data.lineList, ['from', item.no])
          const tempNo = findIndex(this.data.nodeList, ['no', this.data.lineList[index].from])
          if (this.data.nodeList[tempNo] && this.data.nodeList[tempNo].type === 'JUDGE') {
            const arr = this.data.lineList.filter(item => {
              if (item.label !== '') {
                return item
              }
            })
            let obj = {}
            arr.forEach(item => {
              if (item.from === this.data.lineList[index].from) {
                obj[String(item.label)] = item.to
              }
            })
            this.data.nodeList[tempNo].data.mapping = obj
          }
          if (this.data.nodeList[tempNo] && (this.data.lineList.length === 0 || this.data.lineList[index].label === '')) {
            this.$message.warning('存在判断条件为空')
            bool = false
          }
        }
      })
      if (this.data.name === '') {
        this.$message.warning('决策流名称不能为空')
        status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
        return false
      }
      if (!bool) {
        status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
        return false
      }
      const arr = []
      this.data.lineList.forEach(item => {
        const obj = { id: item.id, fromNo: item.from, toNo: item.to, data: JSON.stringify({ label: item.label }) }
        arr.push(obj)
      })
      const params = JSON.parse(JSON.stringify(this.data))
      params.nodeList.forEach(item => {
        item.data = JSON.stringify(item.data)
      })
      params.lineList = [...arr]
      params.coverType = this.coverTypeTemp
      if (this.isEdit) {
        params.id = this.$route.query.id
        if (isRelease) {
          params.groupNo = this.tempNo
          releaseProject(params).then(res => {
            if (res.data && res.data.code == 0) {
              status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
              this.$message.success('发布成功')
              this.handleGoBack()
            }
          })
          .catch(() => {
            status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
          })
        } else {
          // return false
          editProject(params).then(res => {
            if (res.data && res.data.code == 0) {
              status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
              this.$message.success('修改成功')
              this.handleGoBack()
            }
          })
          .catch(() => {
            status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
          })
        }
      } else {
        addProject(params).then(res => {
          if (res.data && res.data.code == 0) {
            status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
            this.$message.success('新增成功')
            this.handleGoBack()
          }
        })
        .catch(() => {
            status == 1 ? this.loadingBtn1 = false : this.loadingBtn2 = false
          })
      }
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
            // this.activeElement.type = 'line'
            // this.activeElement.sourceId = conn.sourceId
            // this.activeElement.targetId = conn.targetId // 删除改为鼠标右键操作
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
              // console.log(this.data)
          })

          // 删除连线回调
          this.jsPlumb.bind("connectionDetached", (evt) => {
              this.deleteLine(evt.sourceId, evt.targetId)
          })

          // 改变线的连接节点
          this.jsPlumb.bind("connectionMoved", (evt) => {
              this.changeLine(evt.originalSourceId, evt.originalTargetId)
          })

          // 连线右击
          this.jsPlumb.bind("contextmenu", (evt) => {
            let x = 0, y = 0
            document.oncontextmenu = function(e) {
              x = e.clientX
              y = e.clientY
              e.preventDefault()
            }
            setTimeout(() => {
              this.activeElement.type = 'line'
              this.activeElement.sourceId = evt.sourceId
              this.activeElement.targetId = evt.targetId
              this.displayStyle = `display: inline;position: fixed;left: ${x + 10}px;top: ${y + 10}px`
            }, 0)
          })

          // 连线
          this.jsPlumb.bind("beforeDrop", (evt) => {
              let from = evt.sourceId
              let to = evt.targetId
            let judgeBool = false
            let endBool = false
            this.data.nodeList.forEach(item => {
              if (item.id === from && item.type !== 'JUDGE') {
                this.data.lineList.forEach(item => {
                  if (item.from === from) {
                    judgeBool = true
                  }
                })
              }
            })
            this.data.nodeList.forEach(item => {
              if (item.id === from && item.type === 'END') {
                endBool = true
              }
            })
            if (judgeBool) {
              this.$message.error('该节点不能连接多个节点')
              return false
            }
            if (endBool) {
              this.$message.error('结束节点不能连接其他节点')
              return false
            }
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
              connector: line.connector ? line.connector : undefined,
              // connector: 'Flowchart',
              anchors: line.anchors ? line.anchors : undefined,
              paintStyle: line.paintStyle ? line.paintStyle : {strokeWidth: 2, stroke: '#acafb3'},
              // paintStyle: {strokeWidth: 2, stroke: '#333'},
          }
          this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
          this.loadEasyFlowFinish = true
      })
    },
    // 设置连线条件
    setLineLabel(from, to, label) {
        var conn = this.jsPlumb.getConnections({
            source: from,
            target: to
        })[0]
        if (!label || label === '') {
            conn.removeClass('flowLabel')
            conn.addClass('emptyFlowLabel')
        } else {
            conn.addClass('flowLabel')
        }
        conn.setLabel({
            label: label,
        })
        this.data.lineList.forEach(function (line) {
            if (line.from == from && line.to == to) {
                line.label = label
            }
        })

    },
    // 删除激活的元素
    deleteElement() {
        if (this.activeElement.type === 'node') {
          // if (this.activeElement.name === '开始') {
          //   this.$message.warning('开始节点禁止删除！')
          //   return false
          // }
            this.deleteNode(this.activeElement.nodeId, this.activeElement.name)
        } else if (this.activeElement.type === 'line') {
            this.$confirm('确定删除所点击的线吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
              this.rightMenu = false
                var conn = this.jsPlumb.getConnections({
                    source: this.activeElement.sourceId,
                    target: this.activeElement.targetId
                })[0]
                this.jsPlumb.deleteConnection(conn)
            }).catch(() => {
            })
        }
    },
    // 删除线
    deleteLine(from, to) {
        this.data.lineList = this.data.lineList.filter(function (line) {
            if (line.from == from && line.to == to) {
                return false
            }
            return true
        })
    },
    // 改变连线
    changeLine(oldFrom, oldTo) {
        this.deleteLine(oldFrom, oldTo)
    },
    // 改变节点的位置
    changeNodeSite(data) {
        for (var i = 0; i < this.data.nodeList.length; i++) {
            let node = this.data.nodeList[i]
            if (node.id === data.nodeId) {
                node.data.left = data.left
                node.data.top = data.top
            }
        }
    },
    // 节点右击事件
    handleContextMenu(data) {
      if (data.node.type !== 'START') {
        this.activeElement.type = 'node'
        this.activeElement.nodeId = data.node.id
        this.activeElement.name = data.node.name
        this.displayStyle = `display: inline;position: fixed;left: ${data.x + 10}px;top: ${data.y + 10}px`
      }
    },
    // 删除节点
    handleDeleteNode() {},
    /**
     * 拖拽结束后添加新的节点
     * @param evt
     * @param nodeMenu 被添加的节点对象
     * @param mousePosition 鼠标拖拽结束的坐标
     */
    addNode(evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
      let efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX, top = screenY
      // 计算是否拖入到容器中
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$message.error("请把节点拖入到画布中")
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      // 居中
      left -= 85
      top -= 16
      var nodeId = guid(new Date().getTime())
      // 动态生成名字
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
          let node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      var node = {
        id: nodeId,
        no: nodeId,
        name: nodeName,
        remark: nodeMenu.remark,
        type: nodeMenu.type,
        data: {
          binding: '',
          left: left + 'px',
          top: top + 'px',
          ico: nodeMenu.ico,
        },
        // state: 'success'
      }
      const arr = [...this.data.nodeList]
      const findStart = arr.findIndex(function (item) {
        return item.type === 'START'
      })
      const findEnd = arr.findIndex(function (item) {
        return item.type === 'END'
      })
      if (node.type === 'START' && findStart !== -1) {
        this.$message.error('开始节点已存在！')
        return false
      }
      if (node.type === 'END' && findEnd !== -1) {
        this.$message.error('结束节点已存在！')
        return false
      }
      this.data.nodeList.push(node)
      /**
       * 这里可以进行业务判断、是否能够添加该节点
       */
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log('拖拽结束: ', el)
          }
        })
      })
    },
    /**
     * 删除节点
     * @param nodeId 被删除节点的ID
     */
    deleteNode(nodeId, name) {
      this.$confirm('确定要删除节点 ' + name + ' ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(() => {
        /**
         * 这里需要进行业务判断，是否可以删除
         */
        this.data.nodeList = this.data.nodeList.filter(function (node) {
          if (node.id === nodeId) {
            // 伪删除，将节点隐藏，否则会导致位置错位
            // node.show = false
            return false
          }
          return true
        })
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(nodeId);
          this.rightMenu = false
        })
      }).catch(() => {
      })
      return true
    },
    clickNode(node) {
      this.rightMenu = true
      // this.activeElement.type = 'node'
      // this.activeElement.nodeId = node.id
      // this.activeElement.name = node.name // 删除改为鼠标右键操作
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
    repaintEverything() {
      this.jsPlumb.repaint()
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
      console.log(1111)
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        // data = lodash.cloneDeep(data)
        data = JSON.parse(JSON.stringify(data))
        this.easyFlowVisible = true
        data.eventId && delete data.eventId
        this.data = data
        this.getEventsList()
        this.$nextTick(() => {
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
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
      this.zoom = this.zoom + 0.01
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub() {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.01
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
  }
}
</script>

<style lang="scss">
.context-menu{
  border: 1px solid #E0E3E7;
  border-radius: 2px;
  background: #fff;
  font-size:12px;
  cursor: pointer;
  .context-menu-text{
    text-align: center;
    width: 40px;
    height: 18px;
    line-height: 18px;
    padding: 2px 6px;
  }:hover{
     background-color: #2d8cf0;
     color: #ffffff;
   }
}
</style>
