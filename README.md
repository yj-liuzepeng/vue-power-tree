# vue-power-tree

## 内容列表

- [介绍](#介绍)
- [安装](#安装)
- [使用](#使用)
- [相关仓库](#相关仓库)
- [维护者](#维护者)

## 介绍

本插件在element-plus树形组件基础上，进行了二次封装。适用于vue3项目，在具备了element-plus 的Tree组件的所有功能的基础上，又增加了**组织树**展示效果，并同时支持拖拽，及自定义组织树的展开收起样式

![npm](https://img-blog.csdnimg.cn/img_convert/16748ef14013d0f2b347849f454708ea.png)

![npm](https://liuzepeng.com/drag.png)

![npm](https://liuzepeng.com/zdy.png)

## 安装

```bash
# use npm
npm install vue-power-tree

# use yarn
yarn add vue-power-tree
```

## 使用

```js
# vue全局引用
import { createApp } from "vue"
import App from "./App.vue"
import VuePowerTree from "vue-power-tree"
import "vue-power-tree/dist/style.css"
const app = createApp(App)
app.use(VuePowerTree)
# 局部引用
import VuePowerTree from "vue-power-tree"
import "vue-power-tree/dist/style.css"

<vue-power-tree :data="data"/>
```

**vue中使用示例**

```vue
<template>
  <vue-power-tree :data="data" :props="defaultProps" draggable show-checkbox tree-type="org"
    @node-click="handleNodeClick" default-expand-all>
    <!-- 自定义展开收起样式 -->
    <template v-slot:icon-node="slotProps">
      <div v-if="slotProps.node.expanded" class="minus">
        -</div>
      <div v-else class="plus">
        +
      </div>
    </template>
  </vue-power-tree>
</template>

<script lang="ts" setup>
import VuePowerTree from "vue-power-tree"
import "vue-power-tree/dist/style.css"

interface Tree {
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
}

const data: Tree[] = [
  {
    id: 0,
    label: '主活动',
    children: [
      {
        id: 2,
        label: '子活动1',
        children: [
          {
            id: 5,
            label: '客群规则1'
          },
          {
            id: 6,
            label: '客群规则2'
          }

        ]
      },
      {
        id: 3,
        label: '子活动2',
        children: [
          {
            id: 7,
            label: '客群规则3'
          },
          {
            id: 8,
            label: '客群规则4'
          }
        ]
      },
      {
        id: 4,
        label: '子活动3'
      },
      {
        id: 9,
        label: '子活动4'
      }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label',
}
</script>

<style>
.minus,
.plus {
  border: 1px solid red;
  background: #fff;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
```

**本插件支持所有的element-plus的Tree组件功能，[可参照](https://element-plus.gitee.io/zh-CN/component/tree.html#%E5%B1%9E%E6%80%A7)，同时扩展了 tree-type属性 控制树形显示**

#### 1. 属性

| 属性                  | 说明                                                         | 类型                                                         | 可选值 | 默认值 |
| :-------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----- | :----- |
| data                  | 展示数据                                                     | array                                                        | —      | —      |
| tree-type             | 树显示方式，普通树形（element树），组织树显示 tree-type='org' | string                                                       |        | normal |
| empty-text            | 内容为空的时候展示的文本                                     | string                                                       | —      | —      |
| node-key              | 每个树节点用来作为唯一标识的属性，整棵树应该是唯一的         | string                                                       | —      | —      |
| props                 | 配置选项，具体看下表                                         | object                                                       | —      | —      |
| render-after-expand   | 是否在第一次展开某个树节点后才渲染其子节点                   | boolean                                                      | —      | true   |
| load                  | 加载子树数据的方法，仅当 lazy 属性为true 时生效              | function(node, resolve)，`node`为当前点击的节点，`resolve`为数据加载完成的回调(必须调用) | —      | —      |
| render-content        | 树节点的内容区的渲染 Function                                | Function(h, `{ node, data, store }`)                         | —      | —      |
| highlight-current     | 是否高亮当前选中节点，默认值是 false。                       | boolean                                                      | —      | false  |
| default-expand-all    | 是否默认展开所有节点                                         | boolean                                                      | —      | false  |
| expand-on-click-node  | 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。 | boolean                                                      | —      | true   |
| check-on-click-node   | 是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。 | boolean                                                      | —      | false  |
| auto-expand-parent    | 展开子节点的时候是否自动展开父节点                           | boolean                                                      | —      | true   |
| default-expanded-keys | 默认展开的节点的 key 的数组                                  | array                                                        | —      | —      |
| show-checkbox         | 节点是否可被选择                                             | boolean                                                      | —      | false  |
| check-strictly        | 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false | boolean                                                      | —      | false  |
| default-checked-keys  | 默认勾选的节点的 key 的数组                                  | array                                                        | —      | —      |
| current-node-key      | 当前选中的节点                                               | string, number                                               | —      | —      |
| filter-node-method    | 对树节点进行筛选时执行的方法， 返回 `false` 则表示这个节点会被隐藏 | Function(value, data, node)                                  | —      | —      |
| accordion             | 是否每次只打开一个同级树节点展开                             | boolean                                                      | —      | false  |
| indent                | 相邻级节点间的水平缩进，单位为像素                           | number                                                       | —      | 16     |
| icon                  | 自定义图标组件                                               | string / Component                                           | -      | -      |
| lazy                  | 是否懒加载子节点，需与 load 方法结合使用                     | boolean                                                      | —      | false  |
| draggable             | 是否开启拖拽节点功能                                         | boolean                                                      | —      | false  |
| allow-drag            | 判断节点能否被拖拽 如果返回 `false` ，节点不能被拖动         | Function(node)                                               | —      | —      |
| allow-drop            | 拖拽时判定目标节点能否成为拖动目标位置。 如果返回 `false` ，拖动节点不能被拖放到目标节点。 `type` 参数有三种情况：'prev'、'inner' 和 'next'，分别表示放置在目标节点前、插入至目标节点和放置在目标节点后 | Function(draggingNode, dropNode, type)                       | —      | —      |

#### 2. Props

| Props    | 说明                                                     | 类型                         | 可选值 | 默认值 |
| :------- | :------------------------------------------------------- | :--------------------------- | :----- | :----- |
| label    | 指定节点标签为节点对象的某个属性值                       | string, function(data, node) | —      | —      |
| children | 指定子树为节点对象的某个属性值                           | string                       | —      | —      |
| disabled | 指定节点选择框是否禁用为节点对象的某个属性值             | string, function(data, node) | —      | —      |
| isLeaf   | 指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效 | string, function(data, node) | —      | —      |
| class    | 自定义节点类名                                           | string, function(data, node) | —      | —      |

#### 3. 方法

`Tree` 组件有以下方法，均返回当前选中的节点数组

| 方法                | 描述                                                         | 参数                                                         |
| :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- |
| filter              | 过滤所有树节点，过滤后的节点将被隐藏                         | 接收一个参数并指定为 filter-node-method 属性的第一个参数     |
| updateKeyChildren   | 为节点设置新数据，只有当设置 `node-key` 属性的时候才可用     | (key, data) 接收两个参数: 1. 节点的 key 2. 新数据            |
| getCheckedNodes     | 如果节点可以被选中，(`show-checkbox` 为 `true`), 本方法将返回当前选中节点的数组 | (leafOnly, includeHalfChecked) 接收两个布尔类型参数: 1. 默认值为 `false`. 若参数为 `true`, 它将返回当前选中节点的子节点 2. 默认值为 `false`. 如果参数为 `true`, 返回值包含半选中节点数据 |
| setCheckedNodes     | 设置目前勾选的节点，使用此方法必须提前设置 `node-key` 属性   | 要选中的节点构成的数组                                       |
| getCheckedKeys      | 若节点可用被选中 (`show-checkbox` 为 `true`), 它将返回当前选中节点 key 的数组 | (leafOnly) 接收一个布尔类型参数，默认为 `false`. 如果参数是 `true`, 它只返回当前选择的子节点数组。 |
| setCheckedKeys      | 设置目前选中的节点，使用此方法必须设置 `node-key` 属性       | (keys, leafOnly) 接收两个参数: 1. 一个需要被选中的多节点 key 的数组 2. 一个布尔类型参数，默认为 `false`. 如果参数是 `true`, 它只返回当前选择的子节点数组。 |
| setChecked          | 设置节点是否被选中, 使用此方法必须设置 `node-key` 属性       | (key/data, checked, deep) 接收三个参数: 1. 要选中的节点的 key 或者数据 2. 一个布尔类型参数表明是否选中. 3. 一个布尔类型参数表明是否递归选中子节点 |
| getHalfCheckedNodes | 如果节点可用被选中 (`show-checkbox` 为 `true`), 它将返回当前半选中的节点组成的数组 | -                                                            |
| getHalfCheckedKeys  | 若节点可被选中(`show-checkbox` 为 `true`)，则返回目前半选中的节点的 key 所组成的数组 | -                                                            |
| getCurrentKey       | 返回当前被选中节点的数据 (如果没有则返回 null)               | —                                                            |
| getCurrentNode      | 返回当前被选中节点的数据 (如果没有则返回 null)               | —                                                            |
| setCurrentKey       | 通过 key 设置某个节点的当前选中状态，使用此方法必须设置 `node-key ` 属性 | (key, shouldAutoExpandParent=true) 1. 待被选节点的 key， 如果为 `null`, 取消当前选中的节点 2. 是否自动展开父节点 |
| setCurrentNode      | 设置节点为选中状态，使用此方法必须设置 `node-key `属性       | (node, shouldAutoExpandParent=true) 1. 待被选中的节点 2. 是否展开父节点 |
| getNode             | 根据 data 或者 key 拿到 Tree 组件中的 node                   | (data) 节点的 data 或 key                                    |
| remove              | 删除 Tree 中的一个节点，使用此方法必须设置 node-key 属性     | (data) 要删除的节点的 data 或者 node 对象                    |
| append              | 为 Tree 中的一个节点追加一个子节点                           | (data, parentNode) 1. 要追加的子节点的 data 2. 父节点的 data, key 或 node |
| insertBefore        | 在 Tree 中给定节点前插入一个节点                             | (data, refNode) 1. 要增加的节点的 data 2. 参考节点的 data, key 或 node |
| insertAfter         | 在 Tree 中给定节点后插入一个节点                             | (data, refNode) 1. 要增加的节点的 data 2. 参考节点的 data, key 或 node |

#### 4. 事件

| 事件名           | 说明                                                  | 回调参数                                                     |
| :--------------- | :---------------------------------------------------- | :----------------------------------------------------------- |
| node-click       | 当节点被点击的时候触发                                | 三个参数：对应于节点点击的节点对象， TreeNode `节点` 属性，事件对象 |
| node-contextmenu | 当某一节点被鼠标右键点击时会触发该事件                | 共四个参数，依次为：event、传递给 `data` 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身。 |
| check-change     | 当复选框被点击的时候触发                              | 共三个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、节点本身是否被选中、节点的子树中是否有被选中的节点 |
| check            | 点击节点复选框之后触发                                | 共两个参数，依次为：传递给 data 属性的数组中该节点所对应的对象、树目前的选中状态对象，包含 checkedNodes、checkedKeys、halfCheckedNodes、halfCheckedKeys 四个属性 |
| current-change   | 当前选中节点变化时触发的事件                          | 共两个参数，依次为：当前节点的数据，当前节点的 Node 对象     |
| node-expand      | 节点被展开时触发的事件                                | 共三个参数，依次为：传递给 `data` 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身 |
| node-collapse    | 节点被关闭时触发的事件                                | 共三个参数，依次为：传递给 `data` 属性的数组中该节点所对应的对象、节点对应的 Node、节点组件本身 |
| node-drag-start  | 节点开始拖拽时触发的事件                              | 共两个参数，依次为：被拖拽节点对应的 Node、event             |
| node-drag-enter  | 拖拽进入其他节点时触发的事件                          | 共三个参数，依次为：被拖拽节点对应的 Node、所进入节点对应的 Node、event |
| node-drag-leave  | 拖拽离开某个节点时触发的事件                          | 共三个参数，依次为：被拖拽节点对应的 Node、所离开节点对应的 Node、event |
| node-drag-over   | 在拖拽节点时触发的事件（类似浏览器的 mouseover 事件） | 共三个参数，依次为：被拖拽节点对应的 Node、当前进入节点对应的 Node、event |
| node-drag-end    | 拖拽结束时（可能未成功）触发的事件                    | 共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点（可能为空）、被拖拽节点的放置位置（before、after、inner）、event |
| node-drop        | 拖拽成功完成时触发的事件                              | 共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event |

#### 5. 插槽

| 插槽名    | 说明                                                         |
| :-------- | :----------------------------------------------------------- |
| —         | 自定义树节点的内容， 自定义树节点的内容， 参数为 ` { node, data }` |
| icon-node | 组织树形态下，自定义展开收起样式，可参考上面 vue中使用示例   |

## 相关仓库

- [element-plus-tree](https://element-plus.gitee.io/zh-CN/component/tree.html) - 饿了么Tree组件
- [vue-power-tree](https://github.com/yj-liuzepeng/vue-power-tree)

## 维护者

[@liuzepeng](https://www.liuzepeng.com)

## 其他
欢迎访问github，star一下
也欢迎提出issue，作者会及时完善，感谢
