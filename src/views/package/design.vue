<template>
  <div class="design-form">
    <PageHeader title="项目设计">
      <div style="height:20px;margin:0;padding:0;"></div>
      <zebra-form size="mini" :option="option" :defalutFormData="rowData" style="margin-left:30px;">
        <template slot="modelForm">
          <el-cascader
            v-model="modelVal"
            :options="modelTree"
            :props="{ expandTrigger: 'hover' }"
            @change="modelTreeHandleChange">
          </el-cascader>
        </template>
      </zebra-form>
    </PageHeader>
    <div class="design-form-box">
      <div class="design-form-item tab-item">
        <el-row>
          <zebra-button type="primary" size="mini" :disabled="currentTreeNode.type == 'rule' || !currentTreeNode.type" @click="addTree('add')">添加</zebra-button>
          <!-- <zebra-button type="primary" size="mini" :disabled="currentTreeNode.type == 'risk_package' || !currentTreeNode.type" @click="addTree('edit')">重命名</zebra-button> -->
          <zebra-button type="primary" size="mini" :disabled="currentTreeNode.type == 'risk_package' || !currentTreeNode.type" @click="deleteTree">删除</zebra-button>
          <zebra-button type="primary" size="mini" :disabled="currentTreeNode.type == 'risk_package' || !currentTreeNode.type || (currentTreeNode.id == currentTreeNodeList[0].data.id)" @click="sortHandle('up')" :loading="uploading">上升</zebra-button>
          <zebra-button type="primary" size="mini" :disabled="currentTreeNode.type == 'risk_package' || !currentTreeNode.type || (currentTreeNode.id == currentTreeNodeList[currentTreeNodeList.length-1].data.id)" @click="sortHandle('down')" :loading="downloading">下降</zebra-button>
        </el-row>
        <el-tree :data="treeData" :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
      </div>
      <div class="design-cont">
        <div id="container"></div>
        <!-- 图例 -->
        <div class="color-items-show">
          <p v-for="item in colorBar" :key="item.label">
            <span :style="'background:'+item.color"></span>
            <span :style="'color:'+item.text">{{item.label}}</span>
          </p>
        </div>
      </div>
    </div>
    <!-- 条件填写 -->
    <el-dialog
      :title="settitle"
      append-to-body
      v-if="paramDialogVisible"
      :visible.sync="paramDialogVisible"
      :before-close="handleCloseParamDialog">
      <zebra-tab :active="activeTab" :option="tabOption" @tab-click="tabClick">
        <!-- 总分设置 -->
        <template slot="allsource">
          <el-row style="display:flex;align-items:center;">
            <span style="margin-right:10px;">模型总分</span>
            <el-input-number size="mini" v-model="allNum" :min="0" label="模型总分"></el-input-number>
          </el-row>
        </template>
        <!-- 下级关系 -->
        <template slot="subrelation">
          <!-- 专家模型---下级关系 -->
          <div class="param-list-box" v-if="rowData.riskType == 'EXPERT_MODEL'">
            <div class="param-list-item" v-for="(item, index) in paramObjList" :key="'paramItem'+index">
              <el-row style="width: 100%;display: flex;align-items: center;margin-bottom:10px;">
                <el-select size="mini" v-model="item.operator" placeholder="请选择" v-if="index > 0" style="width:100%;">
                  <el-option
                    v-for="o in operatorList"
                    :key="o.value+'group-'+index"
                    :label="o.label"
                    :value="o.value">
                  </el-option>
                </el-select>
                <zebra-button size="mini" @click="delOneGroup(index)" v-if="index > 0" style="margin-left:10px;">删除</zebra-button>
              </el-row>
              <div class="param-list-item-left">
                <div class="param-list-item-right-item">
                  <!-- <span style="margin: 0 10px;" v-if="item.list.length > 1">(</span> -->
                  <div v-for="(it, ix) in item.list" :key="'items'+ix" class="param-list-item-right-item-div">
                    <!-- <span style="width:70px;" v-if="it.type == 'variable'">{{actNode.datatype == 'strategy' ? '风控集' :(actNode.datatype == 'risk_list' ? '规则' : '规则集')}}：</span> -->
                    <!-- <el-input size="mini" v-model="it.str"></el-input> -->
                    <el-select size="mini" v-model="it.str" :placeholder="'请选择'+(actNode.datatype == 'strategy' ? '风控集' :(actNode.datatype == 'risk_list' ? '规则' : '规则集'))" v-if="it.type == 'variable'" @change="selectedGroup">
                      <el-option
                        v-for="ig in groupList"
                        :key="ig.value"
                        :disabled="hadSelect.indexOf(ig.value) > -1"
                        :label="ig.label"
                        :value="ig.value">
                      </el-option>
                    </el-select>
                    <el-select size="mini" v-model="it.operator" placeholder="判断符" v-if="it.type == 'operator'">
                      <el-option
                        v-for="ig in operatorList"
                        :key="it.str + ix +ig.value"
                        :label="ig.label"
                        :value="ig.value">
                      </el-option>
                    </el-select>
                    <!-- <zebra-button size="mini" v-if="ix > 0 && it.type == 'variable'" @click="delOneItem(item, ix)" style="margin-left:10px;">删除</zebra-button> -->
                    <!-- <span v-if="it.type == 'operator'" style="margin: 0 10px;">{{it.operator == '&' ? '且' : it.operator == '|' ? '或' :  it.operator}}</span> -->
                    <zebra-button size="mini" @click="delOneItem(item, index, ix)" v-if="it.type == 'operator' || (it.type == 'variable' && ix == item.list.length-1)">删除</zebra-button>
                  </div>
                  <!-- <span v-if="item.list.length > 1">)</span> -->
                </div>
              </div>
              <!-- <div class="param-list-item-right">
                <span v-if="index == 0">关系：</span>
                <zebra-button size="mini" @click="delOneGroup(index)">删除组</zebra-button>
              </div> -->
              <el-row class="param-list-item-btn">
                <!-- <zebra-button size="mini" @click="addOneItem(item, '(')" :disabled="enabledHandle(item, '(')">(</zebra-button>
                <zebra-button size="mini" @click="addOneItem(item, 'str')" :disabled="enabledHandle(item, 'str')">规则集</zebra-button>
                <zebra-button size="mini" @click="addOneItem(item, '&')" :disabled="enabledHandle(item, 'operator')">且</zebra-button>
                <zebra-button size="mini" @click="addOneItem(item, '|')" :disabled="enabledHandle(item, 'operator')">或</zebra-button>
                <zebra-button size="mini" @click="addOneItem(item, ')')" :disabled="enabledHandle(item, ')')">)</zebra-button> -->
                <zebra-button size="mini" @click="addOneItem(item)">添加</zebra-button>
              </el-row>
            </div>
            <zebra-button size="mini" @click="addOneGroup">添加一组</zebra-button>
            <section class="param-string-section">
              <h4>关系式</h4>
              <div v-html="formatParamString(paramObjList, 'html')"></div>
            </section>
          </div>
          <!-- 评分表---下级权重 -->
          <div class="weight-list-box" v-if="rowData.riskType == 'EVALUATION_FORM'">
            <!-- 分配方式 -->
            <el-radio-group v-model="weightType" class="risk-radio-item" @change="weightTypeChange">
              <el-radio :label="true">平均分配</el-radio>
              <el-radio :label="false">手动填写</el-radio>
            </el-radio-group>
            <div v-for="(item, index) in groupList" :key="item.value" class="weight-list-box-item">
              <p>{{item.label}}</p>
              <el-input-number v-model="voList[index].weights" size="mini" :min="0" :max="100" :precision="0"  :disabled="weightType" label="权重比例" @change="validateWeight"></el-input-number>
              <span class="err-item" v-if="voList[index].weights == 0">权重不能为0</span>
            </div>
            <p class="weight-list-box-item">
              <span class="err-item" style="margin-left:0;" v-if="weightsAllError">下级权重总和不为100</span>
            </p>
          </div>
        </template>
        <!-- 规则集属性 -->
        <template slot="strategy">
          <zebra-form size="mini" :option="strategyFormOption" :formData="strategyForm"></zebra-form>
        </template>
        <!--风控的规则属性 -->
        <template slot="risk">
          <zebra-form size="mini" :option="riskFormOption" :formData="riskForm"></zebra-form>
        </template>
        <!-- 风控集----执行规则 -->
        <template slot="strategyType">
          <el-radio-group v-model="strategyType" class="risk-radio-item">
            <el-radio :label="false">
              <span>漏斗型决策</span>
              <section>该决策方式会按照规则顺序进行判断，一旦输出结果，则不会继续进行后续的规则判断以节约资源</section>
            </el-radio>
            <el-radio :label="true">
              <span>覆盖型决策</span>
              <section>该决策方式会完整的进行所有的决策集判断，最后统计决策集输出的结果。数目从而得出最终的决策结果（决策结果数目可自由配置）</section>
            </el-radio>
          </el-radio-group>
        </template>
        <!--规则选择 -->
        <template slot="rule">
          <zebra-form size="mini" :option="ruleFormOption" :formData="ruleForm">
            <template slot="queryWordForm">
              <el-row style="display:flex;align-items:center;">
                <el-input size="mini" v-model="queryWord" placeholder="请输入您需要的中文名或参数名"></el-input>
                <zebra-button size="mini" style="margin-left:10px;" type='primary' @click="remoteMethod">搜索</zebra-button>
              </el-row>
            </template>
          </zebra-form>
          <!-- <el-row style="display:flex;align-items:center;">
            <span class="el-form-item__label" style="width:91px;">参数名</span>
            <el-input size="mini" v-model="queryWord" placeholder="请输入您需要的中文名或参数名"></el-input>
            <zebra-button size="mini" style="margin-left:10px;" type='primary' @click="remoteMethod">搜索</zebra-button>
          </el-row> -->
          <zebra-table v-if="searchResult.length > 0" :page="page" :option="searchOption" :data="searchResult" @row-click="rowClick" @on-load="remoteMethod"></zebra-table>
        </template>
        <!--规则的规则属性 -->
        <template slot="ruleset" v-if="false">
          <zebra-form size="mini" :option="rulesetFormOption" :formData="rulesetForm">
            <template slot="opratorForm">
              <el-select v-model="rulesetForm.oprator" placeholder="请选择判断符" size="mini">
                <el-option
                  v-for="item in opList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                  <el-tooltip class="item" effect="dark" :content="item.info" placement="right">
                    <span>{{item.label}}</span>
                  </el-tooltip>
                </el-option>
              </el-select>
            </template>
            <template slot="valueForm">
              <!-- 单个  区分数字 字符 -->
              <el-input v-if="['lt', 'gt', 'eq', 'neq', 'contain'].indexOf(rulesetForm.oprator) > -1 && ['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) == -1" v-model="vmodel" @blur="setFormValue"></el-input>
              <el-input-number :precision="2" v-if="['lt', 'gt', 'eq', 'neq', 'contain'].indexOf(rulesetForm.oprator) > -1 && ['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) > -1" v-model="vmodel" @blur="setFormValue"></el-input-number>
              <span class="el-form-item__error" v-if="['lt', 'gt', 'eq', 'neq', 'contain'].indexOf(rulesetForm.oprator) > -1 && (vmodel == '' && vmodel == null && vmodel == undefined)">值不能为空</span>
              <!-- 两个 区分数字  字符 -->
              <el-row v-if="rulesetForm.oprator == 'between' && ['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) == -1" style="display: flex;">
                <el-input v-model="startValue" @blur="setValueHandle"></el-input>~<el-input v-model="endValue" @blur="setValueHandle"></el-input>
              </el-row>
              <el-row v-if="rulesetForm.oprator == 'between' && ['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) > -1" style="display: flex;">
                <el-input-number :precision="2" v-model="startValue" @blur="setValueHandle"></el-input-number>~<el-input-number :precision="2" v-model="endValue" @blur="setValueHandle"></el-input-number>
              </el-row>
              <!-- 范围多个  区分数字 字符 -->
              <el-row v-if="rulesetForm.oprator == 'in'">
                <div v-for="(item, index) in valueList" :key="'value'+item + index" style="margin-bottom:10px;display:flex;align-items:center;">
                  <el-input v-model="item.value" v-if="['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) == -1" @blur="setValueOfList"></el-input>
                  <el-input-number :precision="2" v-model="item.value" v-if="['Integer', 'Long', 'Double'].indexOf(rulesetForm.tool) > -1" @blur="setValueOfList"></el-input-number>
                  <zebra-button size="mini" @click="deleteItemOfValue(index, item)" style="margin-left: 10px;">删除</zebra-button>
                </div>
                <zebra-button size="mini" @click="addItemOfValue">添加</zebra-button>
              </el-row>
            </template>
          </zebra-form>
        </template>
      </zebra-tab>
      <span slot="footer" class="dialog-footer" style="display:flex;justify-content:center;">
        <zebra-button v-if="rowData.riskType == 'EVALUATION_FORM' && activeTab == 'subrelation'" :disabled="weightsAllError" size="mini" type="primary" :loading="subLoading" @click="paramSubmit">确 定</zebra-button>
        <zebra-button v-else size="mini" type="primary" :loading="subLoading" @click="paramSubmit">确 定</zebra-button>
        <zebra-button size="mini" @click="handleCloseParamDialog">取 消</zebra-button>
      </span>
    </el-dialog>
    <!-- 选项栏 -->
    <el-dialog
      append-to-body
      v-if="treeVisible"
      :visible.sync="treeVisible"
      width="30%"
      title="添加"
      :before-close="handleCloseTree">
      <zebra-form size="mini" :option="treeOption" :formData="treeForm" :defalutFormData="treeForm" @submit="submitHandle"></zebra-form>
    </el-dialog>
  </div>
</template>
<script>
import G6 from '@antv/g6'
import PageHeader from '@/components/page-header/PageHeader'
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
    if(model.tootip) {
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
    let htmlStr = model.tootip
    outDiv.innerHTML = htmlStr;
    return outDiv;
  },
});
// import {testDataDemo} from './const'
import {
  packageLeftTree, addTreeItem, deleteTreeItem, sortTreeItem, selectOtherpackage, updateProject,
  searchkeyWord, editRule, modelList, getAccountList, getOprator
} from './api'
export default {
  name: 'design-form',
  components: {PageHeader},
  props: {
    rowData: {
      type: Object
    }
  },
  data(){
    return {
      modelTree: [], // 其他风控模型
      modelVal: [],
      testData: {}, // 右侧树数据结构
      detailInfoForm: {},
      option: {
        btnHide: true,
        labelWidth: 'auto',
        inline: false,
        isSearch: true,
        column: [
          {
            label: '项目名称',
            prop: 'name',
            disabled: true,
            span: 6
          },
          {
            label: '风控阶段',
            prop: 'phase',
            disabled: true,
            span: 6
          },
          {
            label: '选用其他项目风控模型',
            prop: 'model',
            span: 6,
            formSlot: true,
          },
          {
            label: '备注',
            prop: 'remark',
            type: 'input',
            disabled: true,
            span: 6
          }
        ]
      },
      defaultProps: {
        children: 'childList',
        label: 'name'
      },
      treeData: [],
      graphData: {},
      graph: null,
      backColor: '#409EFF',
      paramDialogVisible: false, // 下级关系设置
      operatorList: [
        {label: '且', value: '&'},
        {label: '或', value: '|'}
      ],
      // 条件
      paramObjList: [
        {
          operator: '',
          list: [
            {
              type: 'variable',
              str: '',
              text: ''
            }
          ]
        }
      ],
      // 选择的节点
      actNode: {},
      actNodeInfo: {},
      // 规则集列表
      groupList: [],
      treeVisible: false, // 选项栏
      // 选项栏  表单
      treeForm: {
        superId: '',
        type: '',
        name: ''
      },
      treeOption: {
        submitLoading: false,
        cancal: false,
        column: [
          {
            label: '上级选项',
            prop: 'superId',
            type: 'select',
            dicData: [],
            disabled: true,
            display: true
          },
          {
            label: '选项名',
            prop: 'name',
            display: true
          }
        ]
      },
      tabOption: {}, // tab配置
      activeTab: '',
      // 项目配置
      projectOption: {
        column: [
          {
            label: '总分数设置',
            name: 'allsource'
          },
          {
            label: '执行规则',
            name: 'strategyType'
          },
          {
            label: '下级关系设置',
            name: 'subrelation'
          }
        ]
      },
      // 规则集配置
      strategyOption: {
        column: [
          {
            label: '规则集属性设置',
            name: 'strategy'
          },
          {
            label: '下级关系设置',
            name: 'subrelation'
          }
        ]
      },
      strategyForm: {
        name: '',
        remark: ''
      },
      strategyFormOption: {
        btnHide: true,
        column: [
          // {
          //   label: '所属上级',
          //   prop: 'parentId',
          //   type: 'select',
          //   dicData: []
          // },
          {
            label: '规则集名称',
            prop: 'name',
            maxlength: 50,
            showwordlimit: true
          },
          // {
          //   label: '执行顺序',
          //   prop: 'sort',
          //   type: 'inputNumber'
          // },
          {
            label: '备注',
            prop: 'remark',
            type: 'textarea'
          }
        ]
      },
      // 风控集配置
      riskOption: {
        column: [
          {
            label: '风控集属性设置',
            name: 'risk'
          },
          // {
          //   label: '执行规则',
          //   name: 'strategyType'
          // },
          {
            label: '下级关系设置',
            name: 'subrelation'
          }
        ]
      },
      riskForm: {},
      riskFormOption: {
        btnHide: true,
        column: [
          // {
          //   label: '所属上级',
          //   prop: 'parentId',
          //   type: 'select',
          //   dicData: []
          // },
          {
            label: '风控规则组名称',
            prop: 'name',
            maxlength: 50,
            showwordlimit: true
          },
          // {
          //   label: '执行顺序',
          //   prop: 'sort',
          //   type: 'inputNumber'
          // },
          {
            label: '备注',
            prop: 'remark',
            type: 'textarea'
          }
        ]
      },
      strategyType: false, // 执行规则---当前项目的决策类型,true覆盖性决策,否则为 漏斗形 默认false
      // 规则配置
      ruleParameter: '', // 规则设置-参数搜索
      searchLoading: false, // 远程搜索loading
      searchOption: {
        addBtn: false,
        menu: false,
        page: true,
        highlightCurrentRow: true,
        column: [
          {
            label: '数据类型',
            prop: 'type'
          },
          {
            label: '接口名',
            prop: 'apiName'
          },
          {
            label: '参数名',
            prop: 'key'
          },
          {
            label: '说明',
            prop: 'info'
          },
          {
            label: '价格',
            prop: 'price'
          },
          {
            label: '示例值',
            prop: 'reference'
          }
        ]
      },
      searchResult: [], // 搜索结果
      ruleOption: {
        column: [
          {
            label: '规则选择',
            name: 'rule'
          },
          // {
          //   label: '规则属性设置',
          //   name: 'ruleset',
          //   // disabled: true
          // }
        ]
      },
      ruleForm: {}, // 规则
      ruleFormOption: {
        btnHide: true,
        labelWidth: '75px',
        column: [
          {
            label: '规则名称',
            prop: 'name',
            maxlength: 50,
            showwordlimit: true
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
            display: this.rowData.riskType == 'EXPERT_MODEL' ? true : false,
            defaultValue: true,
            dicData: [
              {label: '通过', value: true},
              {label: '不通过', value: false}
            ]
          },
          // 2021-02-22 最新版本
          // {
          //   label: '数据源',
          //   prop: 'secretName',
          //   type: 'select',
          //   dicUrl: '/mgr/risk/api/secret/list',
          //   props: {
          //     label: 'systemName',
          //     value: 'shortName'
          //   }
          // },
          // {
          //   label: '参数名',
          //   prop: 'queryWord',
          //   formSlot: true
          // },
          // --end
          // {
          //   label: '客户来源',
          //   prop: 'account',
          //   type: 'select',
          //   dicData: [],
          //   props: {
          //     label: 'secretName',
          //     value: 'id'
          //   }
          // }
        ]
      },
      rulesetForm: {
        oprator: '',
        value: '',
        tool: '字符串'
      }, // 规则属性
      rulesetFormOption: {
        btnHide: true,
        labelWidth: '75px',
        column: [
          {
            label: '判断条件',
            prop: 'oprator',
            type: 'select',
            // dicUrl: '/mgr/risk/design/operator',
            dicData: [],
            formSlot: true
          },
          {
            label: '值',
            prop: 'value',
            formSlot: true,
            display: false,
            rules: [
              // { required: true, message: '值不能为空', trigger: 'change' },
            ]
          },
          // {
          //   label: '处理器',
          //   prop: 'tool',
          //   type: 'select',
          //   dicUrl: '/mgr/risk/design/processing/type'
          // },
          {
            label: '结果',
            prop: 'isPass',
            type: 'radio',
            dicData: [
              {label: '通过', value: true},
              {label: '不通过', value: false}
            ]
          },
        ]
      },
      currentTreeNode: {}, // 当前的树节点
      currentTreeNodeList: [], // 当前树节点所在层级的所有节点
      currentTreeNodeChildren: [], // 当前树节点的children
      submitType: '', // 左侧树提交方法类型 添加  重命名  删除  修改顺序
      treeNodeType: '', // 左侧树需提交的数据类型
      depthInfo: {}, // 层级节点信息
      colorBar: [
        {label: '项目', color: '#BBDDF9', text: '#356C9A'},
        {label: '规则集', color: '#CBE5B5', text: '#5F8736'},
        {label: '风控集', color: '#CBC6EE', text: '#5B60A7'},
        {label: '规则', color: '#B9CFF4', text: '#2F5A9B'}
      ],
      queryWord: '', // 参数搜索
      ruleRowData: {}, // 规则选择行
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20, // 每页显示多少条
      },
      startValue: '',
      endValue: '',
      vmodel: '',
      valueList: [],
      hadSelect: [],
      settitle: '',
      subLoading: false,
      opList: [],
      uploading: false,
      downloading: false,
      voList: [], // 评分表 修改下级节点的权重
      weightsAllError: true, // 下级权重总和校验
      allNum: 100, // 总分，默认100
      weightType: '',
      currentParent: null, // 当前节点的父节点
    }
  },
  created () {
    this.getModelList()
    // 拉取树形结构
    this.getTreeData()
    this.styleGraph()
    // 获取判断符列表
    this.getOpratorHandle()
  },
  methods: {
    // 获取左侧树形结构
    async getTreeData () {
      await packageLeftTree(this.rowData.id).then(res => {
        if(res.data.code == 0 && res.data.data) {
          this.depthInfo = {}
          this.treeData = [res.data.data]
          this.graphData = {}
          this.testData = res.data.data
          this.formatTestData()
          if(this.graphData.children.length > 0) {
            this.drawGraph()
          }
          // if(!this.testData || JSON.stringify(this.testData) == '{}') {
          //   this.graphData = {}
          //   this.testData = this.treeData[0]
          //   this.formatTestData()
          //   this.drawGraph()
          // }
        }
      })
    },
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
      if(this.testData.strategyType != null && this.testData.strategyType != undefined) {
        this.graphData.strategyType = this.testData.strategyType
        this.strategyType = this.testData.strategyType
      }
      if(this.testData.allocation === false) {
        this.graphData.allocation = this.testData.allocation
      }else{
        this.graphData.allocation = true
      }
      // if(this.testData.voList) {
      //   this.graphData.voList = this.testData.voList
      // }
      if(this.testData.score) {
        this.graphData.score = this.testData.score
        this.allNum = this.testData.score
      }
      this.graphData.children = []
      this.formattingGraphData(this.testData.childList, this.graphData.children)
    },
    // 选项栏，点击
    handleNodeClick (data, node, dom) {
      this.currentTreeNode = data
      this.currentTreeNodeList = node.parent.childNodes
      this.currentTreeNodeChildren = node.childNodes
      this.currentParent = node.parent
    },
    // 返回
    back () {
      this.$emit('close', true)
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
        if(_this.rowData.riskType == 'EVALUATION_FORM') {
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
        createNodeBox: (group, config, w, h, isRoot) => {
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
          group.addShape('rect', {
            attrs: {
              x: 3,
              y: 0,
              width: w - 19,
              height: isRoot ? (1.5 * h) : h,
              fill: config.bgColor,
              stroke: config.borderColor,
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
              fill: config.basicColor,
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
          const container = nodeBasicMethod.createNodeBox(group, config, 200, 64, isRoot);

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
              fill: config.fontColor,
              cursor: 'pointer',
            },
            name: 'name-text-shape',
          });

          /* the description text */
          let ttx = ""
          if(this.rowData.riskType == 'EXPERT_MODEL') {
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
              y: isRoot ? 60 : 45,
              fontSize: 12,
              textAlign: 'left',
              textBaseline: 'middle',
              fill: config.fontColor,
              cursor: 'pointer',
            },
            name: 'bottom-text-shape',
          });

          const hasChildren = cfg.children && cfg.children.length > 0;
          // if (hasChildren) {
          //   nodeBasicMethod.createNodeMarker(group, cfg.collapsed, 200, 32);
          // }
          return container;
        },
        // afterDraw: nodeBasicMethod.afterDraw,
        // setState: nodeBasicMethod.setState,
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

      G6.registerNode('treeNode', {
        draw: (cfg, group) => {
          const { id, label, collapsed, selected, children, depth, operator } = cfg;
          if(cfg.datatype) {
            switch (cfg.datatype) {
              case 'risk_package' : this.backColor = '#BBDDF9';break;
              case 'strategy' : this.backColor = '#CBE5B5';break;
              case 'risk_list' : this.backColor = '#CBC6EE';break;
              case 'rule' : this.backColor = '#B9CFF4';break;
              default : ;break;
            }
          }
          const rootNode = depth === 0;
          // console.log(rootNode)
          const hasChildren = children && children.length !== 0;

          const {
            childCountWidth,
            itemPadding,
            selectedIconWidth,
            nameMarginLeft,
            rootPadding,
            nameFontSize
          } = BaseConfig;

          let width = 0;
          const height = 20;
          const x = 0;
          const y = -height / 2;

          // 名称文本
          let text = group.addShape('text', {
            attrs: {
              text: label || operator,
              x: x,
              y,
              textAlign: 'center',
              textBaseline: 'center',
              fontFamily: 'PingFangSC-Regular'
            },
            cursor: 'pointer',
            name: 'name-text-shape',
          });
          const textWidth = text.getBBox().width;
          width = textWidth + itemPadding
          if(!label && operator) {
            width = childCountWidth
          }else{
            width = minWidth + itemPadding// width < minWidth ? minWidth : width;
          }
          // width = width < minWidth ? minWidth : width;
          const keyShapeAttrs = {
            x,
            y,
            width,
            height,
            radius: 4,
          };

        // keyShape根节点选中样式
          if (rootNode && selected) {
            keyShapeAttrs.fill = '#e8f7ff';
            keyShapeAttrs.stroke = '#e8f7ff';
          }
          const keyShape = group.addShape('rect', {
            attrs: keyShapeAttrs,
            name: 'root-key-shape-rect-shape',
          });

          const mainX = x;
          const mainY = -height + 10;

          // 底部横线
          if(hasChildren) {
            let xx = 0
            let childww = (minWidth + itemPadding) / 2
            console.log(label, operator, children.length)
            if(operator) {
              if(children.length > 1) {
                childww = -3
              }else{
                childww = 0 // minWidth + itemPadding
              }
              if(depth > 1) {
                xx = minWidth * 2
              }
            }
            if(label) {
              if(depth > 1) {
                xx = width
              }
            }
            // if(depth < 2) {
            //   childww = 0
            // }else{
            //   if(!label) {
            //     childww = 0
            //   }
            //   if(!operator && children.length > 1) {
            //     childww = 0
            //   }
            // }
            // group.addShape('path', {
            //   attrs: {
            //     path: [
            //       ['M', x - xx, (mainY + height) / 2 + nameFontSize],
            //       ['L', width + childww, (mainY + height) / 2 + nameFontSize], // width + childCountWidth + rootPadding
            //     ],
            //     stroke: this.backColor,
            //     lineWidth: 1,
            //   },
            //   name: 'node-path-shape',
            // });
          }

          let nameColor = '#fff';
          if (selected) {
            nameColor = '#40A8FF';
          }

          let childOpratorX = 0
          if(depth > 0) {
            childOpratorX = minWidth + itemPadding
          }
          if(operator && label) {
            // 文字背景框
            group.addShape('rect', {
              attrs: {
                x: mainX,
                y: (mainY + height) / 2,
                width: width,
                height,
                radius: 3,
                fill: this.backColor,
                cursor: 'pointer',
              },
              name: 'main-shape',
            });
            // 名称
            group.addShape('text', {
              attrs: {
                text: label,
                x: mainX + width / 2,
                y: mainY + height + nameFontSize / 2 + 1,
                textAlign: 'center',
                textBaseline: 'middle',
                fill: nameColor,
                fontSize: nameFontSize,
                fontFamily: 'PingFangSC-Regular',
                cursor: 'pointer',
              },
              name: 'root-text-shape',
            });
          }else{
            // 关系表达式
            if (operator && !label) {
              // console.log(operator, depth)
              let cnum = 1
              if(depth <= 1) {
                cnum = 0
              }else if(depth > 1 && depth < 5) {
                cnum = Math.ceil(depth / 2)
              }else if(depth >= 5 && depth < 7){
                cnum = Math.floor(depth / 2) + 1
              }else{
                cnum = Math.ceil(depth / 2) + 2
              }
              const childCountHeight = 12;
              const childCountX = width - childCountWidth;
              const childCountY = -childCountHeight / 2;
              group.addShape('rect', {
                id: id + 'operator',
                attrs: {
                  width: childCountWidth,
                  height: 12,
                  stroke: '#409EFF',
                  fill: '#fff',
                  x: mainX - childCountWidth / 2 - minWidth * cnum,
                  y: childCountY + (height + nameFontSize) / 2,
                  radius: 6,
                  cursor: 'pointer',
                },
                name: 'child-count-rect-shape',
              });
              group.addShape('text', {
                attrs: {
                  text: `${operator}`,
                  fill: '#409EFF',
                  x: mainX - minWidth * cnum,
                  y: childCountY + nameFontSize + height / 2 + 2,
                  fontSize: nameFontSize,
                  width: childCountWidth,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  cursor: 'pointer',
                },
                name: 'child-count-text-shape',
              })
            }else if(!operator && label){
              // console.log(label, depth)
              let cnum = 0
              if(depth % 2 == 0) {
                if(depth < 4) {
                  cnum = 1
                }else{
                  cnum = Number.parseInt(depth / 2)
                  if(depth > 6) {
                    cnum = Math.ceil(depth / 2) + 1
                  }
                }
              }else{
                cnum = 1.5
                if(depth > 3) {
                  cnum = 2.5
                }
              }
              // 文字背景框
              group.addShape('rect', {
                attrs: {
                  x: mainX - childOpratorX * cnum,
                  y: (mainY + height) / 2,
                  width: width,
                  height,
                  radius: 3,
                  fill: this.backColor,
                  cursor: 'pointer',
                },
                name: 'main-shape',
              });
              // 名称
              group.addShape('text', {
                attrs: {
                  text: label,
                  x: mainX - childOpratorX * cnum + width / 2,
                  y: mainY + height + nameFontSize / 2 + 1,
                  textAlign: 'center',
                  textBaseline: 'middle',
                  fill: nameColor,
                  fontSize: nameFontSize,
                  fontFamily: 'PingFangSC-Regular',
                  cursor: 'pointer',
                },
                name: 'root-text-shape',
              });
            }
          }
          return keyShape;
        },
      });

      G6.registerEdge('smooth', {
        draw(cfg, group) {
          const { startPoint, endPoint, style, children, source, target, id, depth } = cfg;
          const {
            childCountWidth,
            itemPadding,
            selectedIconWidth,
            nameMarginLeft,
            rootPadding,
            nameFontSize
          } = BaseConfig;
          const height = 20
          let count = (children && children.length) ? children.length : 1
          let diffY = target.getModel().y + (height + nameFontSize) / 2
          let xx = (minWidth + childCountWidth) / 2
          let yy = 0
          let sww = 0
          let txx = endPoint.x
          if(source._cfg.model.depth > 0 && source._cfg.model.depth < 3) {
            xx += minWidth * (source._cfg.model.depth - 2) + itemPadding
          }
          if(source._cfg.model.depth >= 3 && source._cfg.model.depth < 5) {
            xx += -(minWidth * (source._cfg.model.depth - 2) + itemPadding) * 2
          }
          if(source._cfg.model.depth >= 5 && source._cfg.model.depth < 7) {
            xx += -(minWidth * Math.ceil(source._cfg.model.depth / 2)) - (minWidth + itemPadding) / 2
          }
          if(source._cfg.model.depth >= 7 && source._cfg.model.depth < 9) {
            xx += -(minWidth * (Math.ceil(source._cfg.model.depth / 2) + 2))
          }
          if(source._cfg.children && source._cfg.children.length > 1 && source._cfg.model.depth > 0) {
            txx = startPoint.x + xx + minWidth
          }
          let path = [
            ['M', startPoint.x + childCountWidth, yy]
          ];
          if(source._cfg.children && source._cfg.children.length > 1) {
            // console.log(source._cfg.model.label, source._cfg.model.operator, source._cfg.model.depth)
            yy = startPoint.y
            path = [
              ['M', startPoint.x + xx, yy],
              ['L', startPoint.x + xx, diffY],
              ['L', txx, diffY],
            ];
          }

          const shape = group.addShape('path', {
            attrs: {
              stroke: '#409EFF',
              path
            },
            name: 'smooth-path-shape',
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
        // plugins: [tooltip], // 插件设置
        fitCenter: true,
        defaultNode: {
          type: 'card-node',
          size: [200, 64],
          anchorPoints: [
            [0, 1],
            [1, 1],
          ],
          // type: 'treeNode',
          // anchorPoints: [
          //   [0, 0.5],
          //   [1, 0.5],
          // ],
        },
        defaultEdge: {
          // type: 'polyline'
          // type: 'cubic-horizontal',
          type: 'hvh',
          sourceAnchor: 1,
          targetAnchor: 7
          // type: 'smooth',
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
          // type: 'compactBox',
          // direction: 'LR',
          // getId: function getId(d) {
          //   return d.id;
          // },
          // getHeight: function getHeight() {
          //   return 16;
          // },
          // getWidth: function getWidth(d) {
          //   console.log(d)
          //   const labelWidth = (d.label && G6.Util.getTextSize(d.label, BaseConfig.nameFontSize)[0]) || 10;
          //   const width = BaseConfig.itemPadding + labelWidth + BaseConfig.rootPadding + BaseConfig.childCountWidth;
          //   // const width = BaseConfig.itemPadding + minWidth + BaseConfig.rootPadding + BaseConfig.childCountWidth;
          //   return width;
          // },
          // getVGap: function getVGap() {
          //   return 15;
          // },
          // getHGap: function getHGap() {
          //   return 30;
          // },
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
      // 格式化文本
      // this.graphData.label && (this.graphData.label = fittingString(this.graphData.label, BaseConfig.minWidth, BaseConfig.nameFontSize));
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
        if(model.paramObjList && model.paramObjList instanceof Array) {
          if(this.rowData.riskType == 'EXPERT_MODEL') {
            this.hadSelect = []
            for(let i in model.paramObjList) {
              if(model.paramObjList[i].list) {
                for(let j in model.paramObjList[i].list) {
                  if(model.paramObjList[i].list[j].str) {
                    this.hadSelect.push(model.paramObjList[i].list[j].str)
                  }
                }
              }
            }
          }
          // 下级权重
          if(this.rowData.riskType == 'EVALUATION_FORM') {
            this.voList = model.paramObjList
            this.validateWeight()
          }
        }
        // 项目层级
        if(model.datatype == 'risk_package') {
          this.tabOption.column = this.projectOption.column
          if(this.rowData.riskType == 'EVALUATION_FORM') {
            this.tabOption.column = [
              {
                label: '总分数设置',
                name: 'allsource'
              },
              {
                label: '下级关系设置',
                name: 'subrelation'
              }
            ]
          }else{
            this.tabOption.column = [
              {
                label: '执行规则',
                name: 'strategyType'
              },
              {
                label: '下级关系设置',
                name: 'subrelation'
              }
            ]
            // 执行规则
            if(model.strategyType) {
              this.strategyType = model.strategyType
            }else{
              this.strategyType = false
            }
          }
          this.getGroupList('risk_package', model.dataid)
          if(model.score) {
            this.allNum = model.score
          }
        }
        // 规则集
        if(model.datatype == 'strategy') {
          this.tabOption.column = this.strategyOption.column
          this.strategyForm.name = model.name
          this.strategyForm.remark = model.note
          this.getGroupList('strategy', model.dataid)
        }
        // 风控集
        if(model.datatype == 'risk_list') {
          this.tabOption.column = this.riskOption.column
          let obj = {
            name: model.name,
            remark: model.note
          }
          this.riskForm = obj
          this.getGroupList('risk_list', model.dataid)
          // // 执行规则
          // if(model.strategyType) {
          //   this.strategyType = model.strategyType
          // }
        }
        // 规则
        if(model.datatype == 'rule') {
          // 规则赋值
          let ruleTemp = {
            name: model.name,
            remark: model.note,
            hitResult: model.hitResult
          }
          console.log(model)
          console.log(this.rowData.riskType)
          this.ruleForm = ruleTemp
          console.log(this.ruleForm)

          this.tabOption.column = this.ruleOption.column
          this.getGroupList('rule', model.dataid)
        }else{
          if(item.getModel().paramObjList) {
            this.paramObjList = item.getModel().paramObjList
          }
        }

        // 区分 专家模型和评分表
        for(let i in this.tabOption.column) {
          if(this.tabOption.column[i].name == 'subrelation') {
            // 专家模型
            if(this.rowData.riskType == 'EXPERT_MODEL') {
              this.tabOption.column[i].label = '下级关系设置'
            }
            // 评分表
            if(this.rowData.riskType == 'EVALUATION_FORM') {
              this.tabOption.column[i].label = '下级权重设置'
            }
          }
        }

        // 下级权重设置，初始化 及 校验
        if(this.rowData.riskType == 'EVALUATION_FORM') {
          let temp = []
          let obj = {}
          for(let o in this.voList) {
            obj[this.voList[o].id] = this.voList[o].weights
          }
          for(let i in this.groupList) {
            temp.push({
              id: this.groupList[i].value,
              weights: obj[this.groupList[i].value] ? obj[this.groupList[i].value] : 0
            })
          }
          this.voList = temp
          this.weightType = model.allocation
          this.weightTypeChange(model.allocation)
        }

        if(model.datatype) {
          this.activeTab = this.tabOption.column[0].name
          // 设置下级关系
          this.paramDialogVisible = true
        }
      });
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
    // 关闭条件弹框
    handleCloseParamDialog () {
      this.paramDialogVisible = false
      this.paramObjList = []
      this.valueList = []
      this.startValue = ""
      this.endValue = ""
      this.rulesetForm = {}
      this.vmodel = ""
      this.searchResult = []
    },
    // 提交条件
    paramSubmit () {
      if(this.actNodeInfo.datatype == 'rule') {
        if(this.activeTab == 'rule') {
          // this.ruleOption.column[1].disabled = false
          // this.activeTab = 'ruleset'

          // 2021-02-22 新版本
          this.actNode.remark = this.ruleForm.remark
          this.actNode.name = this.ruleForm.name
          this.graph.updateItem(this.actNode.id, this.actNode)
          let tob = {
            id: this.actNodeInfo.dataid,
            type: this.actNodeInfo.datatype,
            name: this.ruleForm.name,
            remark: this.ruleForm.remark,
            superId: this.actNodeInfo.superId,
          }
          if(this.rowData.riskType == 'EXPERT_MODEL') {
            tob.hitResult = this.ruleForm.hitResult
          }
          this.subLoading = true
          editRule(tob).then(res => {
            if(res.data.code == 0) {
              this.$message.success('保存成功')
              this.handleCloseParamDialog()
              this.getTreeData()
              this.subLoading = false
            }
          }).catch(e => {
            this.subLoading = false
          })
        }else{
          let tp = JSON.parse(JSON.stringify(this.rulesetForm))
          if(['lt', 'gt', 'eq', 'neq', 'contain'].indexOf(tp.oprator) > -1) {
            tp.value = this.vmodel
          }
          if(this.ruleRowData && JSON.stringify(this.ruleRowData) != '{}') {
            tp.rule = this.ruleRowData
          }
          tp.ruleForm = this.ruleForm
          tp.ruleForm.customer = this.treeData[0].customer
          tp.queryWord = this.queryWord
          this.actNode.paramObjList = JSON.stringify(tp)
          this.graph.updateItem(this.actNode.id, this.actNode)
          let tob = {
            id: this.actNodeInfo.dataid,
            type: this.actNodeInfo.datatype,
            paramObjList: JSON.stringify(tp),
            name: this.ruleForm.name,
            apiName: this.ruleRowData.apiName,
            superId: this.actNodeInfo.superId
          }
          this.subLoading = true
          editRule(tob).then(res => {
            if(res.data.code == 0) {
              this.$message.success('保存成功')
              this.handleCloseParamDialog()
              this.getTreeData()
              this.subLoading = false
            }
          })
        }
      }else{
        this.actNode.paramObjList = this.paramObjList
        if(this.actNodeInfo.datatype == 'strategy') {
          this.actNode.note = this.strategyForm.remark
          this.actNode.name = this.strategyForm.name
        }
        if(this.actNodeInfo.datatype == 'risk_list') {
          this.actNode.note = this.riskForm.remark
          this.actNode.name = this.riskForm.name
          // this.actNode.strategyType = this.strategyType
        }
        if(this.rowData.riskType == 'EVALUATION_FORM') {
          this.actNode.voList = this.voList
          this.actNode.allocation = this.weightType
        }
        this.graph.updateItem(this.actNode.id, this.actNode)
        let tob = {
          id: this.actNodeInfo.dataid,
          expression: '', // this.formatParamString(this.paramObjList), // jsonExpression
          remark: this.actNodeInfo.note,
          type: this.actNodeInfo.datatype,
          paramObjList: JSON.stringify(this.paramObjList),
          name: this.actNode.name,
        }
        // 项目节点 设置总分
        if(this.actNodeInfo.datatype == 'risk_package') {
          tob.score = this.allNum
          tob.strategyType = this.strategyType
          this.actNode.strategyType = this.strategyType
        }
        if(this.rowData.riskType == 'EVALUATION_FORM') {
          tob.voList = this.voList
          tob.allocation = this.weightType
          let str = ''
          for(let ci in this.actNodeInfo.children) {
            str += ((ci > 0 ? '&' : '') + this.actNodeInfo.children[ci].dataid)
          }
          tob.expression = str
        }else{
          tob.expression = this.formatParamString(this.paramObjList)
        }
        this.subLoading = true
        updateProject(tob).then(res => {
          if(res.data.code == 0) {
            this.$message.success('保存成功')
            this.handleCloseParamDialog()
            this.getTreeData()
            this.subLoading = false
          }
        })
      }
    },
    // 添加一项条件
    addOneItem (item, operator) {
      if(operator == '(' || operator == ')') {
        item.list.push({
          operator: operator,
          type: 'operator'
        })
      }
      if(operator == 'str') {
        item.list.push({
          str: "",
          type: 'variable'
        })
      }
      if(operator == '&' || operator == '|'){
        item.list.push({
          operator: operator,
          type: 'operator'
        })
      }
      if(!operator) {
        if(item.list.length > 0) {
          item.list.push({
            oprator: '',
            type: 'operator'
          })
          item.list.push({
            str: "",
            type: 'variable'
          })
        }else{
          item.list.push({
            str: "",
            type: 'variable'
          })
        }
      }
    },
    // 删除一项条件
    delOneItem (item, groupIndex, index) {
      if(index == item.list.length - 1) {
        item.list.splice(index-1, 2)
      }else if(item.list[index].type == "operator"){
        item.list.splice(index-1, 2)
      }
      if(item.list.length == 0) {
        this.delOneGroup(groupIndex)
      }
      // item.list.splice(index, 1)
      // // &变量  |变量
      // if(item.list[index-1].operator == '&' || item.list[index-1].operator == '|') {
      //   item.list.splice(index-1, 2)
      // }
      // // (变量)
      // if(item.list[index-1] && item.list[index+1]) {
      //   if(item.list[index-1].operator == '(' && item.list[index+1].operator == ')') {
      //     if(item.list[index+2]) {
      //       // 后面有数据  (变量)...
      //       item.list.splice(index - 1, 3)
      //     }else{
      //       // 后面无数据时删除前面的运算符   &(变量)
      //       item.list.splice(index - 2, 4)
      //     }
      //   }
      // }
      // // (变量
      // if(item.list[index-1]) {
      //   if(item.list[index-1].operator == '(') {
      //     item.list.splice(index-1, 2)
      //   }
      // }
      // // )  单独的右括号
      // if(item.list[index]) {
      //   if(item.list[index].operator == ')' && item.list[index-1].type != 'variable') {
      //     item.list.splice(index, 1)
      //   }
      // }
      this.selectedGroup()
      this.$forceUpdate()
    },
    // 添加一组
    addOneGroup () {
      this.paramObjList.push({
        operator: '',
        list: [{str: '', type: 'variable'}]
      })
    },
    // 删除一组
    delOneGroup (index) {
      this.paramObjList.splice(index, 1)
      this.selectedGroup()
    },
    // 获取规则集下拉列表
    getGroupList (type, id) {
      let temp = []
      if(type == 'risk_package') {
        for(let i in this.treeData[0].childList) {
          temp.push({
            label: this.treeData[0].childList[i].name,
            value: this.treeData[0].childList[i].id
          })
        }
        this.groupList = temp
      }else{
        let list = []
        this.getChildren(this.treeData[0].childList, type, id, list)
      }
    },

    // 添加  编辑  选项
    addTree (tp) {
      this.submitType = tp
      if(this.submitType == 'add') {
        this.treeForm.superId = this.currentTreeNode.id;
        // this.treeForm.id = this.currentTreeNode.id;
      }
      if(this.submitType == 'edit') {
        this.treeForm.id = this.currentTreeNode.id;
      }
      this.treeForm.expression = this.currentTreeNode.expression;
      this.treeOption.column.filter(item => {
        if(item.prop == 'superId') {
          item.dicData = [
            {label: this.currentTreeNode.name, value: this.currentTreeNode.id}
          ]
        }
        if(this.submitType == 'add') {
          item.display = true
        }
        if(this.submitType == 'edit') {
          item.display = true
          if(item.prop == 'superId') {
            item.display = false
          }
        }
      });
      switch (this.currentTreeNode.type) {
        case 'risk_package':
          if(this.submitType == 'add') {
            this.treeForm.type = 'strategy';
            this.treeNodeType = 'strategy'
          }else{
            this.treeForm.type = this.currentTreeNode.type
            this.treeNodeType = this.currentTreeNode.type
            this.treeForm.name = this.currentTreeNode.name
          }
          break;
        case 'strategy':
          if(this.submitType == 'add') {
            this.treeForm.type = 'risk_list';
            this.treeNodeType = 'risk_list'
          }else{
            this.treeForm.type = this.currentTreeNode.type
            this.treeNodeType = this.currentTreeNode.type
            this.treeForm.name = this.currentTreeNode.name
          }
          break;
        case 'risk_list':
          if(this.submitType == 'add') {
            this.treeForm.type = 'rule'
            this.treeNodeType = 'rule'
          }else{
            this.treeForm.type = this.currentTreeNode.type
            this.treeNodeType = this.currentTreeNode.type
            this.treeForm.name = this.currentTreeNode.name
          }
          break;
        case 'rule':
          this.treeForm.type = this.currentTreeNode.type
          this.treeNodeType = this.currentTreeNode.type
          this.treeForm.name = this.currentTreeNode.name
          break;
        default: ;break;
      }
      this.treeVisible = true
    },
    // 关闭选项
    handleCloseTree () {
      this.treeVisible = false
      this.treeForm = {
        superId: '',
        type: '',
        name: ''
      }
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
    // 逻辑按钮是否可点击
    enabledHandle (item, str) {
      // 右括号是否可点击
      if(str == ')') {
        // 左右不匹配
        let left = 0
        let right = 0
        for(let i in item.list) {
          if(item.list[i].type == 'operator') {
            if(item.list[i].operator == '(') {
              left += 1
            }
            if(item.list[i].operator == ')') {
              right += 1
            }
          }
        }
        if(left <= right) {
          return true
        }else{
          // 空括号
          if(item.list[item.list.length-1].type == 'operator' && item.list[item.list.length-1].operator == '(') {
            return true
          }else if(item.list[item.list.length-1].type == 'variable'){
            if(item.list[item.list.length-2]) {
              if(item.list[item.list.length-2].type == 'operator' && ['&', '|'].indexOf(item.list[item.list.length-2].operator) > -1) {
                return false
              }else{
                return true
              }
            }
          }else if(item.list[item.list.length-1].type == 'operator'){
            return true
          }else{}
        }

      }
      // 左括号是否可点击
      if(str == '(') {
        if(item.list[item.list.length-1].type == 'operator' || ['&', '|'].indexOf(item.list[item.list.length-1].operator) > -1) {
          return false
        }else{
          return true
        }
      }
      // 变量是否可点击
      if(str == 'str') {
        if(item.list[item.list.length-1].type == 'variable' || (item.list[item.list.length-1].type == 'operator' && item.list[item.list.length-1].operator == ')')) {
          return true
        }else{
          return false
        }
      }
      // 逻辑符号是否可点击
      if(str == 'operator') {
        if(item.list[item.list.length-1].type == 'variable' || (item.list[item.list.length-1].type == 'operator' && item.list[item.list.length-1].operator == ')')) {
          return false
        }else{
          return true
        }
      }
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
          allocation: true, // 默认平均分配
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
              // children.push(obj)
              // if(data[i].childList) {
              //   this.formattingGraphData(data[i].childList, obj.children)
              // }
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
            if(data[i].allocation === false) {
              obj.allocation = data[i].allocation
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
            // else{
            //   children.push(obj)
            //   if(data[i].childList) {
            //     this.formattingGraphData(data[i].childList, obj.children)
            //   }
            // }
            children.push(obj)
            if(data[i].childList) {
              this.formattingGraphData(data[i].childList, obj.children)
            }
          }
        }
      }
    },
    // 左侧树提交
    submitHandle (form) {
      let bool = true
      if(this.currentParent && this.currentParent.data && this.currentParent.data.allocation != undefined) {
        bool = this.currentParent.data.allocation
      }
      this.treeOption.submitLoading = true
      form.sort = this.currentTreeNodeChildren.length
      if(this.submitType == 'add') {
        addTreeItem(this.treeData[0].id, form, bool).then(res => {
          if(res.data.code == 0) {
            this.$message.success('添加成功')
            this.getTreeData()
            this.treeOption.submitLoading = false
            this.handleCloseTree()
          }
        }).catch(e => {
          this.treeOption.submitLoading = false
        })
      }
    },
    // 左侧树删除
    deleteTree () {
      deleteTreeItem(this.currentTreeNode.type, this.currentTreeNode.id).then(res => {
        if(res.data.code == 0) {
          this.$message.success('删除成功')
          this.getTreeData()
          this.handleCloseTree()
        }
      })
    },
    // 左侧树排序
    sortHandle (type) {
      let sort = -1
      let changSort = -1
      for(let i in this.currentTreeNodeList) {
        if(this.currentTreeNodeList[i].data.id == this.currentTreeNode.id) {
          sort = Number.parseInt(i)
        }
      }
      changSort = (type == 'up') ? (sort-1) : (sort+1)
      if(type == 'up') {
        this.uploading = true
      }else{
        this.downloading = true
      }
      sortTreeItem(this.currentTreeNode.type, this.currentTreeNode.id, changSort, this.currentTreeNodeList[changSort].data.id, sort).then(res => {
        if(res.data.code == 0) {
          this.$message.success((type == 'up' ? '上移' : '下移') + '成功')
          this.getTreeData()
          this.handleCloseTree()
          if(type == 'up') {
            this.uploading = false
          }else{
            this.downloading = false
          }
        }
      })
    },
    // 规则-远程搜索
    remoteMethod () {
      let query= this.queryWord
      if (query !== '') {
        this.searchLoading = true
        let obj = JSON.parse(JSON.stringify(this.ruleForm))
        obj.keyword = query
        obj.customer = this.treeData[0].customer
        obj.size = this.page.pageSize
        obj.current = this.page.currentPage
        searchkeyWord(obj).then(res => {
          if(res.data.code == 0 && res.data.data) {
            this.searchLoading = false
            this.searchResult = res.data.data.records
            this.page.currentPage = res.data.data.current
            this.page.total = res.data.data.total
          }
        })
      } else {
        this.searchResult = []
      }
    },
    // 规则-表格选择
    rowClick (data) {
      let row = data.row
      this.ruleRowData = row
      this.rulesetForm.tool = row.type
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
    // 节点显示的表达式id转name
    getLabelByValueOfTree (val, list, temp) {
      for(let i in list) {
        if(list[i].id == val) {
          temp = list[i].name
          console.log(temp)
          return temp
        }else{
          if(list[i].childList) {
            this.getLabelByValueOfTree(val, list[i].childList, temp)
          }
        }
      }
    },
    // 递归获取节点子集
    getChildren (list, type, id, tp) {
      for(let i in list) {
        if(list[i].type == type && list[i].id == id) {
          tp = list[i].childList
          let temp = []
          for(let i in tp) {
            temp.push({
              label: tp[i].name,
              value: tp[i].id
            })
        }
          this.groupList = temp
          return false
        }else{
          if(list[i].childList && list[i].childList.length > 0) {
            this.getChildren(list[i].childList, type, id, tp)
          }
        }
      }
    },
    // tab切换
    tabClick (name) {
      this.activeTab = name
    },
    // 添加一个值
    addItemOfValue () {
      this.valueList.push({
        value: ''
      })
      this.setValueOfList()
    },
    // 删除一个值
    deleteItemOfValue (index, row) {
      this.valueList.splice(index, 1)
      this.setValueOfList()
    },
    // between 设置值
    setValueHandle () {
      this.rulesetForm.value = [this.startValue, this.endValue]
    },
    // in 设置值
    setValueOfList () {
      let temp = []
      for(let i in this.valueList) {
        temp.push(this.valueList[i].value)
      }
      this.rulesetForm.value = temp
    },
    // 已选择
    selectedGroup (val) {
      this.hadSelect = []
      for(let i in this.paramObjList) {
        if(this.paramObjList[i].list && this.paramObjList[i].list.length > 0) {
          for(let j in this.paramObjList[i].list) {
            if(this.paramObjList[i].list[j].str) {
              this.hadSelect.push(this.paramObjList[i].list[j].str)
            }
          }
        }
      }
    },
    // 获取其他风控模型
    getModelList () {
      modelList().then(res => {
        if(res.data.code == 0) {
          this.modelTree = res.data.data
        }
      })
    },
    // 模型树change
    modelTreeHandleChange (val) {
      this.rowData.model = val[val.length - 1]
      this.$confirm('选择模型将会替换当前设计效果，替换后的模型会清除原有的变量绑定，确认替换？').then(_ => {
        selectOtherpackage(this.treeData[0].id, this.rowData.model).then(res => {
          if(res.data.code == 0) {
            console.log(res.data.data)
            this.getTreeData()
          }
        })
      }).catch(_ => {
        this.modelVal = []
      })
    },
    // 设置值
    setFormValue () {
      this.rulesetForm.value = this.vmodel
    },
    // 获取判断符
    getOpratorHandle () {
      getOprator().then(res => {
        if(res.data.code == 0) {
          this.opList = res.data.data
        }
      })
    },
    validateWeight () {
      let newVal = this.voList
      let total = 0
        for(let i in newVal) {
          total += newVal[i].weights
        }
        if(total == 100) {
          this.weightsAllError = false
        }else{
          this.weightsAllError = true
        }
        this.$forceUpdate()
    },
    // 权重分配方式change
    weightTypeChange (val) {
      if(this.voList.length > 0) {
        if(val) {
          let len = this.voList.length
          let average = Number.parseInt(100 / len)
          let remainder = 100 % len
          for(let i in this.voList) {
            this.voList[i].weights = average
            if(i == len - 1) {
              this.voList[i].weights = average + remainder
            }
          }
        }
      }
      this.validateWeight()
    }
  },
  mounted () {
    this.initGraph()
  },
  watch: {
    'rulesetForm.oprator': {
      handler (newVal, oldVal) {
        if(newVal) {
          if(!this.rulesetForm.value) {
            this.rulesetForm.value = []
          }
          if(newVal == 'exists' || newVal == 'nexists') {
            this.rulesetFormOption.column[1].display = false
          }else{
            this.rulesetFormOption.column[1].display = true
          }
        }else{
          this.rulesetFormOption.column[1].display = false
        }
      }
    },
    // 'ruleForm.secretName': {
    //   handler (newVal, oldVal) {
    //     if(newVal) {
    //       this.ruleForm.account = ''
    //       getAccountList(newVal).then(res => {
    //         if(res.data.code == 0) {
    //           this.ruleFormOption.column[1].dicData = res.data.data
    //         }
    //       })
    //     }
    //   }
    // }
  }
}
</script>
<style lang="scss">
.design-form{
  height: 100%;
  .el-card {
    .pageheader-top{
      .pageheader-line{
        margin-left: 20px;
      }
      .title{
        margin-left: 16px;
      }
    }
  }
}
.title-bar{
  display: flex;
  h4{
    width: 25%;
    text-align: center;
    padding: 0;
    margin: 0;
    height: 32px;
    border-right: 1px dashed #e5e5e5;
    margin-right: -1px;
  }
  div{
    flex: 1;
    display: flex;
    h4:nth-last-of-type(1){
      border: 0;
    }
  }
  >h4:nth-of-type(1) {
    width: 25%;
    border-right: 1px solid #e5e5e5;
  }
}
.design-form-box{
  display: flex;
  min-height: calc(100% - 154px);
  margin-top: 10px;
  background: #fff;
  padding: 10px;
  .design-form-item {
    width: 15%;
  }
  .tab-item{
    border-right: 1px solid #e5e5e5;
    .el-row{
      display: flex;
      // justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      .el-button{
        margin: 0;
        margin-right: 5px;
        margin-bottom: 5px;
      }
    }
  }
  .design-cont{
    flex: 1;
    position: relative;
    #container{
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .color-items-show{
      position: absolute;
      top: 0;
      left: 0;
      width: 170px;
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
  .el-tree-node__label{
    // min-width: 280px;
    width: 100%;
    white-space: pre;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.footer-btn{
  position: fixed;
  bottom: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
.weight-list-box{
  .weight-list-box-item {
    margin-top: 10px;
  }
  p{
    display: flex;
    align-items: center;
    margin: 0 0 10px 0;
    span{
      width: 100%;
    }
    .err-item{
      color: #f56c6c;
      font-size: 12px;
      line-height: 1;
      margin-left: 10px;
    }
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
.risk-radio-item{
  display: flex;
  flex-direction: column;
  .el-radio{
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .el-radio__label{
      display: flex;
      align-items: center;
    }
  }
  section{
    white-space: pre-wrap;
    color: #C0C4CC;
    line-height: 20px;
    margin-left: 10px;
  }
}
</style>
