<template>
    <div class="flow-menu" ref="tool">
<!--        <div v-for="menu  in  menuList" :key="menu.id">-->
<!--            <span class="ef-node-pmenu" @click="menu.open = !menu.open"><i :class="{'el-icon-caret-bottom': menu.open,'el-icon-caret-right': !menu.open}"></i>&nbsp;{{menu.name}}</span>-->
<!--            <ul v-show="menu.open" class="ef-node-menu-ul">-->
<!--              <draggable @end="end" @start="move" v-model="menu.children" :options="draggableOptions">-->
<!--                <li v-for="subMenu in menu.children" class="ef-node-menu-li" :key="subMenu.id" :type="subMenu.type">-->
<!--                  <i :class="subMenu.ico"></i> {{subMenu.name}}-->
<!--                </li>-->
<!--              </draggable>-->
<!--            </ul>-->
<!--        </div>-->
      <draggable @end="end" @start="move" v-model="menuList" :options="draggableOptions">
        <li v-for="subMenu in menuList" class="ef-node-menu-li" :key="subMenu.id" :type="subMenu.type">
          <i :class="subMenu.ico"></i> {{subMenu.name}}
        </li>
      </draggable>
    </div>
</template>
<script>
    import draggable from 'vuedraggable'

    var mousePosition = {
        left: -1,
        top: -1
    }

    export default {
        data() {
            return {
                activeNames: '1',
                // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
                draggableOptions: {
                    preventOnFilter: false,
                    sort: false,
                    disabled: false,
                    ghostClass: 'tt',
                    // 不使用H5原生的配置
                    forceFallback: true,
                    // 拖拽的时候样式
                    // fallbackClass: 'flow-node-draggable'
                },
                // 默认打开的左侧菜单的id
                defaultOpeneds: ['1', '2'],
                menuList: [
                  {
                    id: '10',
                    name: '开始',
                    type: 'START',
                    ico: 'el-icon-video-play',
                    remark: '',
                    // 自定义覆盖样式
                    style: {}
                    // data: {
                    //   left: '18px',
                    //   top: '223px',
                    // },
                    // state: 'success'
                  },
                  {
                    data: {},
                    id: '11',
                    type: 'JUDGE',
                    name: '判断工具',
                    ico: 'el-icon-rank',
                    remark: '',
                    // 自定义覆盖样式
                    style: {}
                  }, {
                    data: {},
                    id: '12',
                    type: 'STRATEGY',
                    name: '规则集',
                    ico: 'el-icon-bank-card',
                    // 自定义覆盖样式
                    style: {}
                  },
                  {
                    data: {},
                    id: '21',
                    type: 'VARIABLE',
                    name: '额度计算',
                    remark: '',
                    ico: 'el-icon-set-up',
                    // 自定义覆盖样式
                    style: {}
                  }, {
                    data: {},
                    id: '22',
                    type: 'END',
                    name: '结束',
                    ico: 'el-icon-s-help',
                    // 自定义覆盖样式
                    style: {}
                  }
                ],
                nodeMenu: {}
            }
        },
        components: {
            draggable
        },
        created() {
            /**
             * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
             * @param event
             */
            if (this.isFirefox()) {
                document.body.ondrop = function (event) {
                    // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
                    mousePosition.left = event.layerX
                    mousePosition.top = event.clientY - 50
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        },
        methods: {
            // 根据类型获取左侧菜单对象
            getMenuByType(type) {
                for (let i = 0; i < this.menuList.length; i++) {
                  if (this.menuList[i].type === type) {
                    return this.menuList[i]
                  }
                }
            },
            // 拖拽开始时触发
            move(evt, a, b, c) {
                var type = evt.item.attributes.type.nodeValue
                this.nodeMenu = this.getMenuByType(type)
            },
            // 拖拽结束时触发
            end(evt, e) {
              console.log(this.nodeMenu)
                this.$emit('addNode', evt, this.nodeMenu, mousePosition)
            },
            // 是否是火狐浏览器
            isFirefox() {
                var userAgent = navigator.userAgent
                if (userAgent.indexOf("Firefox") > -1) {
                    return true
                }
                return false
            }
        }
    }
</script>
