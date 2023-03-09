<template>
  <div class="test-view-detail">
    <el-row class="strategyType-info" v-if="modelData.riskType == 'EXPERT_MODEL'">
      <span>执行规则：</span>
      <span>{{testData.strategyType ? '覆盖型决策' : '漏斗型决策'}}</span>
    </el-row>
    <div class="design-cont">
      <!-- 图例 -->
      <div class="color-items-show">
        <p v-for="item in colorBar" :key="item.label">
          <span :style="'background:'+item.color"></span>
          <span :style="'color:'+item.text">{{item.label}}</span>
        </p>
      </div>
      <div id="container"></div>
    </div>
    <el-dialog
      :title="settitle"
      append-to-body
      v-if="paramDialogVisible"
      :visible.sync="paramDialogVisible"
      :before-close="handleCloseParamDialog">
      <zebra-form size="mini" :option="ruleFormOption" :formData="ruleForm">
      </zebra-form>
    </el-dialog>
  </div>
</template>
<script>
import G6 from '@antv/g6'
const BaseConfig = {
  nameFontSize: 10,
  childCountWidth: 22,
  itemPadding: 16,
  nameMarginLeft: 0,
  rootPadding: 18,
  minWidth: 120
};
const minWidth = 60
// 长文本处理
const fittingString = (str, maxWidth, fontSize) => {
  const ellipsis = '...';
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return;
    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize;
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth >= (maxWidth - 2 * ellipsisLength )){
      res = `${str.substr(0, i)}${ellipsis}`;
      return
    }
  });
  return res;
};
const tooltip = new G6.Tooltip({
  // offsetX and offsetY include the padding of the parent container
  // offsetX 与 offsetY 需要加上父容器的 padding
  offsetX: 16 + 10,
  offsetY: 24 + 10,
  // the types of items that allow the tooltip show up
  // 允许出现 tooltip 的 item 类型
  itemTypes: ['node'],
  // 过滤显示的node节点
  shouldBegin: (evt) => {
    let {item} = evt
    let model = item.getModel()
    if(model.nodeErrors && model.nodeErrors.length > 0) {
      return true
    }else {
      return false
    }
  },
  // custom the tooltip's content
  // 自定义 tooltip 内容
  getContent: (e) => {
    const outDiv = document.createElement('div');
    outDiv.style.width = 'fit-content';
    //outDiv.style.padding = '0px 0px 20px 0px';
    let model = e.item.getModel()
    let htmlStr = ''
    if(model.nodeErrors && model.nodeErrors.length > 0) {
      htmlStr = model.nodeErrors.join("<br>")
    }
    outDiv.innerHTML = htmlStr;
    return outDiv;
  },
});
export default {
  name: 'test-view-detail',
  props: {
    modelData: {
      type: Object
    },
    rowData: {
      type: Object
    }
  },
  data(){
    return {
      testData: {}, // 右侧树数据结构
      depthInfo: {}, // 层级节点信息
      treeData: [],
      graphData: {},
      graph: null,
      fontColorList: {
        executedColor: '#169bd5',
        notExcutedColor: '#7f7f7f',
        passColor: '#04F21C',
        notpassColor: '#EC808D'
      },
      colorBar: [
        {label: '项目', color: '#BBDDF9', text: '#356C9A'},
        {label: '规则集', color: '#CBE5B5', text: '#5F8736'},
        {label: '风控集', color: '#CBC6EE', text: '#5B60A7'},
        {label: '规则', color: '#B9CFF4', text: '#2F5A9B'},
        {label: '未执行', color: '#7f7f7f', text: '#7f7f7f'}
      ],
      actNode: {}, // 当前节点
      settitle: '', // 节点名称
      paramDialogVisible: false,
      ruleForm: {}, // 规则
      ruleFormOption: {
        btnHide: true,
        labelWidth: '75px',
        disabled: true,
        column: [
          {
            label: '规则名称',
            prop: 'name'
          },
          {
            label: '规则内容',
            prop: 'remark',
            type: 'textarea',
            rows: 5
          },
          {
            label: '命中结果',
            prop: 'hitResult',
            type: 'radio',
            display: this.modelData.riskType == 'EXPERT_MODEL' ? true : false,
            defaultValue: true,
            dicData: [
              {label: '通过', value: true},
              {label: '不通过', value: false}
            ]
          }
        ]
      },
    }
  },
  methods: {
    // 获取左侧树形结构
    getTreeData () {
      if(this.rowData && this.rowData.modelJson) {
        let obj = JSON.parse(this.rowData.modelJson)
        this.treeData = [obj]
        this.graphData = {}
        this.testData = obj
        this.formatTestData()
        if(this.graphData.children.length > 0) {
          this.drawGraph()
        }
      }
    },
    // 自定义节点和边
    styleGraph () {
      let _this = this
      let graph;
      const ERROR_COLOR = '#F5222D';
      const getNodeConfig = (node) => {
        let config = {
          basicColor: '#5B8FF9',
          fontColor: '#5B8FF9',
          borderColor: '#5B8FF9',
          bgColor: '#C6E5FF',
        };
        switch (node.datatype) {
          case 'risk_package': {
            config = {
              basicColor: '#BBDDF9',
              fontColor: '#356C9A',
              borderColor: '#BBDDF9',
              bgColor: '#BBDDF9',
            };
            break;
          }
          case 'strategy': {
            config = {
              basicColor: '#CBE5B5',
              fontColor: '#5F8736',
              borderColor: '#CBE5B5',
              bgColor: '#CBE5B5',
            };
            break;
          }
          case 'risk_list': {
            config = {
              basicColor: '#CBC6EE',
              fontColor: '#5B60A7',
              borderColor: '#CBC6EE',
              bgColor: '#CBC6EE',
            };
            break;
          }
          case 'rule': {
            config = {
              basicColor: '#B9CFF4',
              fontColor: '#2F5A9B',
              borderColor: '#B9CFF4',
              bgColor: '#B9CFF4',
            };
            break;
          }
          default:
            break;
        }
        // 评分表 权重判断 不可为0 和应为100
        if(_this.modelData.riskType == 'EVALUATION_FORM') {
          if(node.weights == 0) {
            config.basicColor = ERROR_COLOR
            // config = {
            //   basicColor: ERROR_COLOR,
            //   fontColor: '#FFF',
            //   borderColor: ERROR_COLOR,
            //   bgColor: ERROR_COLOR,
            // }
          }
        }
        return config;
      };

      const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
        return [
          ['M', x - r, y],
          ['a', r, r, 0, 1, 0, r * 2, 0],
          ['a', r, r, 0, 1, 0, -r * 2, 0],
          ['M', x - r + 4, y],
          ['L', x - r + 2 * r - 4, y],
        ];
      };
      const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
        return [
          ['M', x - r, y],
          ['a', r, r, 0, 1, 0, r * 2, 0],
          ['a', r, r, 0, 1, 0, -r * 2, 0],
          ['M', x - r + 4, y],
          ['L', x - r + 2 * r - 4, y],
          ['M', x - r + r, y - r + 4],
          ['L', x, y + r - 4],
        ];
      };
      const nodeBasicMethod = {
        createNodeBox: (group, config, w, h, isRoot, data) => {
          /* 最外面的大矩形 */
          const container = group.addShape('rect', {
            attrs: {
              x: 0,
              y: 0,
              width: w,
              heigh: h,
            },
            name: 'big-rect-shape',
          });
          if (!isRoot) {
            /* 左边的小圆点 */
            // group.addShape('circle', {
            //   attrs: {
            //     x: 3 - 15,
            //     y: h / 2,
            //     r: 4,
            //     fill: '#C6D9E8',
            //   },
            //   name: 'left-dot-shape',
            // });
          }
          /* 矩形 */
          let tpFillColor = data.executed ? config.bgColor: _this.fontColorList.notExcutedColor
          let tpStrokeColor = data.executed ? config.borderColor: _this.fontColorList.notExcutedColor
          group.addShape('rect', {
            attrs: {
              x: 3,
              y: 0,
              width: w - 19,
              height: isRoot ? (1.5 * h) : h,
              fill: tpFillColor,
              stroke: tpStrokeColor,
              radius: 2,
              cursor: 'pointer',
            },
            name: 'rect-shape',
          });

          /* 左边的粗线 */
          group.addShape('rect', {
            attrs: {
              x: 3,
              y: 0,
              width: 3,
              height: h,
              fill: data.executed ?  config.basicColor : _this.fontColorList.notExcutedColor,
              radius: 1.5,
            },
            name: 'left-border-shape',
          });
          return container;
        },
        /* 生成树上的 marker */
        createNodeMarker: (group, collapsed, x, y) => {
          group.addShape('circle', {
            attrs: {
              x,
              y,
              r: 13,
              fill: 'rgba(47, 84, 235, 0.05)',
              opacity: 0,
              zIndex: -2,
            },
            name: 'collapse-icon-bg',
          });
          group.addShape('marker', {
            attrs: {
              x,
              y,
              r: 7,
              symbol: collapsed ? EXPAND_ICON : COLLAPSE_ICON,
              stroke: 'rgba(0,0,0,0.25)',
              fill: 'rgba(0,0,0,0)',
              lineWidth: 1,
              cursor: 'pointer',
            },
            name: 'collapse-icon',
          });
        },
        afterDraw: (cfg, group) => {
          /* 操作 marker 的背景色显示隐藏 */
          const icon = group.find((element) => element.get('name') === 'collapse-icon');
          if (icon) {
            const bg = group.find((element) => element.get('name') === 'collapse-icon-bg');
            icon.on('mouseenter', () => {
              bg.attr('opacity', 1);
              graph.get('canvas').draw();
            });
            icon.on('mouseleave', () => {
              bg.attr('opacity', 0);
              graph.get('canvas').draw();
            });
          }
        },
        setState: (name, value, item) => {
          const hasOpacityClass = [
            'ip-cp-line',
            'ip-cp-bg',
            'ip-cp-icon',
            'ip-cp-box',
            'ip-box',
            'collapse-icon-bg',
          ];
          const group = item.getContainer();
          const childrens = group.get('children');
          graph.setAutoPaint(false);
          if (name === 'emptiness') {
            if (value) {
              childrens.forEach((shape) => {
                if (hasOpacityClass.indexOf(shape.get('name')) > -1) {
                  return;
                }
                shape.attr('opacity', 0.4);
              });
            } else {
              childrens.forEach((shape) => {
                if (hasOpacityClass.indexOf(shape.get('name')) > -1) {
                  return;
                }
                shape.attr('opacity', 1);
              });
            }
          }
          graph.setAutoPaint(true);
        },
      };
      // 卡片
      G6.registerNode('card-node', {
        draw: (cfg, group) => {
          const config = getNodeConfig(cfg);
          const isRoot = cfg.datatype === 'risk_package';
          /* the biggest rect */
          const container = nodeBasicMethod.createNodeBox(group, config, 200, 64, isRoot, cfg);

          /* name */
          let labeltxt = fittingString(cfg.label, BaseConfig.minWidth, BaseConfig.nameFontSize)
          group.addShape('text', {
            attrs: {
              text: labeltxt,
              x: 19,
              y: isRoot ? 30 : 19,
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'left',
              textBaseline: 'middle',
              fill: cfg.executed ? config.fontColor : '#fff',
              cursor: 'pointer',
            },
            name: 'name-text-shape',
          });

          /* the description text */
          let ttx = ""
          if(this.modelData.riskType == 'EXPERT_MODEL') {
            if(cfg.paramObjList && cfg.paramObjList instanceof Array) {
              ttx = this.formatParamString(cfg.paramObjList, 'text')
            }
            ttx = fittingString(ttx, BaseConfig.minWidth, BaseConfig.nameFontSize)
          }else{
            if(isRoot) {
              ttx = '总分'+ (cfg.score ? cfg.score : 100)
            }else{
              ttx = '权重占比' + (cfg.weights ? cfg.weights : 0) + '%'
            }
          }
          group.addShape('text', {
            attrs: {
              text: ttx,
              x: 19,
              y: isRoot ? 60 : (cfg.datatype == 'rule' ? 38 : 45),
              fontSize: 12,
              textAlign: 'left',
              textBaseline: 'middle',
              fill: cfg.executed ? config.fontColor : '#fff',
              cursor: 'pointer',
            },
            name: 'bottom-text-shape',
          });

          // 显示 结果或得分
          let txs = ''
          let txsColor = ''
          if(this.modelData.riskType == 'EXPERT_MODEL') {
            if(cfg.datatype == 'rule') {
              if(cfg.riskNodeValue) {
                txs = '通过'
                txsColor = _this.fontColorList.passColor
              }else{
                txs = '不通过'
                txsColor = _this.fontColorList.notpassColor
              }
            }
          }else{
            txsColor = _this.fontColorList.executedColor
            if(isRoot) {
              txs =  cfg.riskNodeValue ? ('模型得分' + cfg.riskNodeValue + '分') : '0分'
            }else{
              if(cfg.datatype == 'rule') {
                txs =  cfg.riskNodeValue ? ('规则得分' + cfg.riskNodeValue + '分') : '0分'
              }
            }
          }
          if(txs) {
            group.addShape('text', {
              attrs: {
                text: txs,
                x: 19,
                y: isRoot ? 80 : 55,
                fontSize: 12,
                textAlign: 'left',
                textBaseline: 'middle',
                fill: txsColor ? txsColor : config.fontColor,
                cursor: 'pointer',
              },
              name: 'bottom-text-shape',
            });
          }

          const hasChildren = cfg.children && cfg.children.length > 0;
          // if (hasChildren) {
          //   nodeBasicMethod.createNodeMarker(group, cfg.collapsed, 200, 32);
          // }
          return container;
        },
      });
      // 折线
      G6.registerEdge('hvh', {
        draw(cfg, group) {
          const startPoint = cfg.startPoint;
          const endPoint = cfg.endPoint;
          const shape = group.addShape('path', {
            attrs: {
              stroke: '#C6D9E8',
              path: [
                //  x: -5  -25  -25  -10
                ['M', startPoint.x - 20, startPoint.y + 32],
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x  , startPoint.y + 32], // 三分之一处
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x  , endPoint.y + 32], // 三分之二处
                ['L', endPoint.x + 5, endPoint.y + 32],
              ],
            },
            // must be assigned in G6 3.3 and later versions. it can be any value you want
            name: 'path-shape',
          });
          return shape;
        },
      });
    },
    // 初始化
    initGraph () {
      const width = document.getElementById('container').scrollWidth;
      const height = document.getElementById('container').scrollHeight || 800;
      this.graph = new G6.TreeGraph({
        container: 'container',
        width,
        height,
        plugins: [tooltip], // 插件设置
        fitCenter: true,
        defaultNode: {
          type: 'card-node',
          size: [200, 64],
          anchorPoints: [
            [0, 1],
            [1, 1],
          ]
        },
        defaultEdge: {
          type: 'hvh',
          sourceAnchor: 1,
          targetAnchor: 7
        },
        layout: {
          type: 'compactBox',
          direction: 'LR',
          getId: function getId(d) {
            return d.id;
          },
          getHeight: function getHeight() {
            return 16;
          },
          getWidth: function getWidth() {
            return 16;
          },
          getVGap: function getVGap() {
            return 64;
          },
          getHGap: function getHGap() {
            return 200;
          },
        },
        modes: {
          default: [
          'drag-canvas',
          'zoom-canvas',
        ],
          // default: [
          //   // 点击选中节点
          //   'click-select',
          //   'drag-canvas',
          //   'zoom-canvas',
          // ],
        },
      });
      let _this = this
      window.onresize = function () { // 定义窗口大小变更通知事件
        if($(".design-cont")) {
          let w = $(".design-cont").width()
          let h = $(".design-cont").height()
          if(w && h) {
            _this.graph.changeSize(w, h)
            _this.graph.fitCenter()
            // _this.graph.fitView()
          }
        }
      }
    },
    // 绘图
    drawGraph () {
      if(this.graphData.children && this.graphData.children.length > 0) {
        this.formartData(this.graphData.children)
      }
      this.graph.data(this.graphData);
      this.graph.render();
      this.graph.fitView();
      let container = document.getElementById('container');
      if (typeof window !== 'undefined') {
        window.onresize = () => {
          if (!this.graph || this.graph.get('destroyed')) return;
          if (!container || !container.scrollWidth || !container.scrollHeight) return;
          this.graph.changeSize(container.scrollWidth, container.scrollHeight);
        }
      }

      // 点击节点
      this.graph.on('node:click', (evt) => {
        const { item } = evt;
        let model = item.getModel()
        // this.graph.setItemState(item, 'selected', true);
        // 处理点击节点的逻辑
        let data = Object.create(model)
        this.actNode = data
        // console.log(this.actNode)
        this.actNodeInfo = model
        this.settitle = data.name
        // 规则
        if(model.datatype == 'rule') {
          // 规则赋值
          let ruleTemp = {
            name: model.name,
            remark: model.note
          }
          this.ruleForm = ruleTemp
          this.paramDialogVisible = true
        }
      });
    },
    // 格式化数据格式
    formatTestData () {
      if(this.testData.name) {
        this.graphData.label = this.testData.name
        this.graphData.name = this.testData.name
      }
      if(this.testData.expression) {
        this.graphData.tootip = this.testData.expression
        this.graphData.expression = this.testData.expression
      }
      if(this.testData.type) {
        this.graphData.datatype = this.testData.type
      }
      if(this.testData.id)  {
        this.graphData.dataid = this.testData.id
      }
      if(this.testData.operator) {
        this.graphData.operator = this.testData.operator
      }
      if(this.testData.paramObjList) {
        this.graphData.paramObjList = JSON.parse(this.testData.paramObjList)
      }
      if(this.testData.score) {
        this.graphData.score = this.testData.score
        this.allNum = this.testData.score
      }
      if(this.testData.riskNodeValue) {
        this.graphData.riskNodeValue = this.testData.riskNodeValue
      }
      if(this.testData.executed) {
        this.graphData.executed = this.testData.executed
      }
      if(this.testData.nodeErrors) {
        this.graphData.nodeErrors = this.testData.nodeErrors
      }
      this.graphData.children = []
      this.formattingGraphData(this.testData.childList, this.graphData.children)
    },
    // 解析数据结构
    formattingGraphData (data, children) {
      for(let i in data) {
        let obj = {
          label: '',
          children: [],
          operator: '',
          bindStatus: false,
          hitResult: false,
          projectId: '', // 项目Id
          strategyType: false, // 当前项目的决策类型,默认为true覆盖性决策,否则为 漏斗形
          weights: 0,
          voList: [],
          executed: false
        }
        if(data[i].id) {
          if(!this.depthInfo[data[i].type]) {
            this.depthInfo[data[i].type] = []
          }
          // 不存在已有id
          if(this.depthInfo[data[i].type].indexOf(data[i].id) == -1) {
            obj.dataid = data[i].id
            // obj.id = data[i].id
            this.depthInfo[data[i].type].push(data[i].id)

            if(data[i].name) {
              obj.label = data[i].name
              obj.name = data[i].name
            }
            if(data[i].superId) {
              obj.superId = data[i].superId
            }
            if(data[i].expression) {
              obj.tootip = data[i].expression
              obj.expression = data[i].expression
            }
            if(data[i].remark) {
              obj.note = data[i].remark
            }
            if(data[i].type) {
              obj.datatype = data[i].type
            }
            if(data[i].paramObjList) {
              obj.paramObjList = JSON.parse(data[i].paramObjList)
            }
            if(data[i].operator) {
              obj.operator = data[i].operator
            }
            if(data[i].bindStatus) {
              obj.bindStatus = data[i].bindStatus
            }
            if(data[i].hitResult) {
              obj.hitResult = data[i].hitResult
            }
            if(data[i].projectId) {
              obj.projectId = data[i].projectId
            }
            if(data[i].strategyType) {
              obj.strategyType = data[i].strategyType
            }
            if(data[i].weights) {
              obj.weights = data[i].weights
            }
            if(data[i].riskNodeValue) {
              obj.riskNodeValue = data[i].riskNodeValue
            }
            if(data[i].executed) {
              obj.executed = data[i].executed
            }
            if(data[i].nodeErrors) {
              obj.nodeErrors = data[i].nodeErrors
            }
            if(data[i].voList && data[i].voList.length > 0) {
              obj.voList = data[i].voList
            }else{
              if(data[i].childList) {
                let temp = []
                for(let t in data[i].childList) {
                  temp.push({
                    id: data[i].childList[t].id,
                    weights: 0
                  })
                }
                obj.voList = temp
              }
            }
            children.push(obj)
            if(data[i].childList) {
              this.formattingGraphData(data[i].childList, obj.children)
            }
          }
        }
      }
    },
    // 长文本处理
    formartData (list) {
      for(let i in list) {
        // list[i].label && (list[i].label = fittingString(list[i].label, BaseConfig.minWidth, BaseConfig.nameFontSize))
        if(list[i].children && list[i].children.length > 0) {
          this.formartData(list[i].children)
        }
      }
    },
    // 上下级关系
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
    // 关闭 规则节点详情
    handleCloseParamDialog () {
      this.paramDialogVisible = false
    }
  },
  created () {
    this.styleGraph()
  },
  mounted () {
    this.initGraph()
    // 拉取树形结构
    this.getTreeData()
  },
}
</script>
<style lang="scss" scoped>
.test-view-detail{
  position: relative;
  .strategyType-info{
    position: absolute;
    left: 10px;
    top: 10px;
    display: flex;
    align-items: center;
  }
  .design-cont{
    position: relative;
    .color-items-show{
      position: absolute;
      top: 30px;
      left: 5px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      p{
        display: flex;
        align-items: center;
        margin: 0;
        margin-bottom: 5px;
        span{
          width: 50px;
          height: 20px;
          font-size: 12px;
          line-height: 20px;
          text-align: left;
          margin-left: 5px;
        }
        span:nth-of-type(1) {
          height: 10px;
          width: 25px;
        }
      }
    }
  }
}
</style>
