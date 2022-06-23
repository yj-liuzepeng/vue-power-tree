<template>
  <div :class="[treeType == 'org' ? 'org-tree-container' : '']">
    <div ref="el$" :class="[
      (treeType == 'org' ? 'org-tree' : 'el-tree'),
      { 'is-dragging': !!dragState.draggingNode },
      { 'is-drop-not-allow': !dragState.allowDrop },
      { 'el-tree--highlight-current': highlightCurrent },
    ]" role="tree">
      <el-tree-node v-for="child in root.childNodes" :key="getNodeKey(child)" :node="child" :props="props"
        :accordion="accordion" :render-after-expand="renderAfterExpand" :show-checkbox="showCheckbox"
        :render-content="renderContent" @node-expand="handleNodeExpand" :tree-type="treeType">
        <template v-slot="slotProps">
          <slot name="icon-node" :node="slotProps.node"></slot>
        </template>
      </el-tree-node>
      <div v-if="isEmpty" class="el-tree__empty-block">
        <span class="el-tree__empty-text">{{
            emptyText ?? 'No Data'
        }}</span>
      </div>
      <div v-show="dragState.showDropIndicator" ref="dropIndicator$" class="el-tree__drop-indicator" />
    </div>
  </div>
</template>


<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  provide,
  ref,
  watch,
} from 'vue'

// import { formItemContextKey } from '@element-plus/tokens'

import TreeStore from './model/tree-store'
import { getNodeKey as getNodeKeyUtil } from './model/util'
import ElTreeNode from './tree-node.vue'
import { useNodeExpandEventBroadcast } from './model/useNodeExpandEventBroadcast'
import { useDragNodeHandler } from './model/useDragNode'
import { useKeydown } from './model/useKeydown'
import type Node from './model/node'
import type { Component, ComponentInternalInstance, PropType } from 'vue'
import type {
  TreeComponentProps,
  TreeData,
  TreeKey,
  TreeNodeData,
} from './tree.type'

export default defineComponent({
  name: 'ElTree',
  components: { ElTreeNode },
  props: {
    data: {
      // 树形数据
      type: Array,
      default: () => [],
    },
    treeType: {
      // 树类型，普通模式：normal，组织树模式：org
      type: String,
      default: 'normal',
    },
    emptyText: {
      // 数据空时显示的文本
      type: String,
    },

    renderAfterExpand: {
      // 是否仅在父节点第一次展开后才渲染子节点
      type: Boolean,
      default: true,
    },
    // 节点的唯一标识键名，其值在整个树中应该是唯一的
    nodeKey: String,
    // 当 show-checkbox 为 true 时，节点的选中状态是否不影响其父节点和子节点
    checkStrictly: Boolean,
    // 是否展开所有节点
    defaultExpandAll: Boolean,

    expandOnClickNode: {
      // 单击节点时是否展开或折叠节点，如果为false，则仅在单击箭头图标时展开或折叠节点。
      type: Boolean,
      default: true,
    },
    // 单击节点时是否选中或取消选中节点，如果为false，则只能通过单击复选框来选中或取消选中节点
    checkOnClickNode: Boolean,
    checkDescendants: {
      type: Boolean,
      default: false,
    },
    autoExpandParent: {
      // 子节点展开时是否展开父节点
      type: Boolean,
      default: true,
    },
    // 默认选择的节点
    defaultCheckedKeys: Array as PropType<
      TreeComponentProps['defaultCheckedKeys']
    >,
    // 默认展开的节点
    defaultExpandedKeys: Array as PropType<
      TreeComponentProps['defaultExpandedKeys']
    >,
    // 最初选择的节点？？？
    currentNodeKey: [String, Number] as PropType<string | number>,
    // 渲染内容函数
    renderContent: Function,

    showCheckbox: {
      // 显示复选框
      type: Boolean,
      default: false,
    },
    draggable: {
      // 拖动
      type: Boolean,
      default: false,
    },
    // 此函数将在拖动节点之前执行。如果返回false，则不能拖动节点
    allowDrag: Function,
    // 此函数将在拖放节点之前执行。如果返回false，则不能将拖动节点拖放到目标节点。
    //  type 有三个可能的值：'prev'（在目标节点之前插入拖动节点）、'inner'（将拖动节点插入目标节点） 和'next'（在目标节点之后插入拖动节点）
    allowDrop: Function,
    props: {
      // 配置
      type: Object as PropType<TreeComponentProps['props']>,
      default: () => ({
        children: 'children',
        label: 'label',
        disabled: 'disabled',
      }),
    },
    lazy: {
      // 懒加载
      type: Boolean,
      default: false,
    },
    // 高亮显示
    highlightCurrent: Boolean,
    // 加载子树数据的方法，仅在lazy为真时有效
    load: Function as PropType<TreeComponentProps['load']>,
    // 使用过滤方法时，该函数将在每个节点上执行。如果返回 false，树节点将被隐藏。
    filterNodeMethod: Function as PropType<
      TreeComponentProps['filterNodeMethod']
    >,
    // 是否一次只能展开同一层级中的一个节点，手风琴
    accordion: Boolean,
    indent: {
      // 相邻级别中节点的水平缩进（以像素为单位）
      type: Number,
      default: 18,
    },
    // 节点图标
    icon: [String, Object] as PropType<string | Component>,
  },
  emits: [
    'check-change', // 当节点的选中状态改变时触发
    'current-change', // 当前节点更改时触发
    'node-click', // 节点点击
    'node-contextmenu', // 右键单击节点时触发
    'node-collapse', // 当前节点关闭时触发
    'node-expand', // 当前节点打开时触发
    'check', // 单击节点的复选框后触发
    'node-drag-start', // 拖拽开始触发
    'node-drag-end', // 拖拽结束触发
    'node-drop', // 拖放节点后触发
    'node-drag-leave', // 当拖动节点离开节点时触发
    'node-drag-enter', // 当拖动节点进入另一个节点时触发
    'node-drag-over', // 拖动节点时触发（如 mouseover 事件）
  ],
  setup(props, ctx) {
    // const ns = useNamespace('tree')
    // console.log(ns.is('focusable'))
    const store = ref<TreeStore>(
      new TreeStore({
        key: props.nodeKey,
        data: props.data,
        lazy: props.lazy,
        props: props.props,
        load: props.load,
        currentNodeKey: props.currentNodeKey,
        checkStrictly: props.checkStrictly,
        checkDescendants: props.checkDescendants,
        defaultCheckedKeys: props.defaultCheckedKeys,
        defaultExpandedKeys: props.defaultExpandedKeys,
        autoExpandParent: props.autoExpandParent,
        defaultExpandAll: props.defaultExpandAll,
        filterNodeMethod: props.filterNodeMethod,
      })
    )

    store.value.initialize()

    const root = ref<Node>(store.value.root)
    const currentNode = ref<Node>(null)
    const el$ = ref()
    const dropIndicator$ = ref()
    // const el$ = ref<Nullable<HTMLElement>>(null)
    // const dropIndicator$ = ref<Nullable<HTMLElement>>(null)

    const { broadcastExpanded } = useNodeExpandEventBroadcast(props)

    const { dragState } = useDragNodeHandler({
      props,
      ctx,
      el$,
      dropIndicator$,
      store,
    })

    useKeydown({ el$ }, store)
    // 空
    const isEmpty = computed(() => {
      const { childNodes } = root.value
      return (
        !childNodes ||
        childNodes.length === 0 ||
        childNodes.every(({ visible }) => !visible)
      )
    })
    // 监听默认选择的节点变化
    watch(
      () => props.defaultCheckedKeys,
      (newVal) => {
        store.value.setDefaultCheckedKey(newVal)
      }
    )
    // 监听展开节点的变化
    watch(
      () => props.defaultExpandedKeys,
      (newVal) => {
        store.value.setDefaultExpandedKeys(newVal)
      }
    )
    // 监听（deep)树数据改变
    watch(
      () => props.data,
      (newVal) => {
        store.value.setData(newVal)
      },
      { deep: true }
    )

    watch(
      () => props.checkStrictly,
      (newVal) => {
        store.value.checkStrictly = newVal
      }
    )
    // 过滤节点
    const filter = (value) => {
      if (!props.filterNodeMethod)
        throw new Error('[Tree] filterNodeMethod is required when filter')
      store.value.filter(value)
    }
    // 获取节点唯一标识
    const getNodeKey = (node: Node) => {
      return getNodeKeyUtil(props.nodeKey, node.data)
    }
    // 获取节点路径？？？ 暂不了解
    const getNodePath = (data: TreeKey | TreeNodeData) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in getNodePath')
      const node = store.value.getNode(data)
      if (!node) return []
      const path = [node.data]
      let parent = node.parent
      while (parent && parent !== root.value) {
        path.push(parent.data)
        parent = parent.parent
      }
      return path.reverse()
    }

    // 获取当前选中的节点（复选框）
    const getCheckedNodes = (
      leafOnly?: boolean,
      includeHalfChecked?: boolean
    ): TreeNodeData[] => {
      return store.value.getCheckedNodes(leafOnly, includeHalfChecked)
    }
    // 获取当前选中的节点的key数组
    const getCheckedKeys = (leafOnly?: boolean): TreeKey[] => {
      return store.value.getCheckedKeys(leafOnly)
    }
    // 获取当前选择（高亮）的节点
    const getCurrentNode = (): TreeNodeData => {
      const currentNode = store.value.getCurrentNode()
      return currentNode ? currentNode.data : null
    }
    // 获取当前选择（高亮）的节点key值
    const getCurrentKey = (): any => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in getCurrentKey')
      const currentNode = getCurrentNode()
      return currentNode ? currentNode[props.nodeKey] : null
    }
    // 设置选中的节点数组
    const setCheckedNodes = (nodes: Node[], leafOnly?: boolean) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedNodes')
      store.value.setCheckedNodes(nodes, leafOnly)
    }
    // 设置选中的节点key数组
    const setCheckedKeys = (keys, leafOnly?: boolean) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCheckedKeys')
      store.value.setCheckedKeys(keys, leafOnly)
    }
    //  设置节点被选中
    const setChecked = (
      data: TreeKey | TreeNodeData,
      checked: boolean,
      deep: boolean
    ) => {
      store.value.setChecked(data, checked, deep)
    }
    // 获取当前半选的节点数组
    const getHalfCheckedNodes = (): TreeNodeData[] => {
      return store.value.getHalfCheckedNodes()
    }
    // 获取半选的节点key数组
    const getHalfCheckedKeys = (): TreeKey[] => {
      return store.value.getHalfCheckedKeys()
    }
    // 设置当前节点
    const setCurrentNode = (node: Node, shouldAutoExpandParent = true) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentNode')
      store.value.setUserCurrentNode(node, shouldAutoExpandParent)
    }
    // 设置当前节点key
    const setCurrentKey = (key: TreeKey, shouldAutoExpandParent = true) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in setCurrentKey')
      store.value.setCurrentNodeKey(key, shouldAutoExpandParent)
    }
    // 获取节点 by data or key
    const getNode = (data: TreeKey | TreeNodeData): Node => {
      return store.value.getNode(data)
    }
    // 移除节点
    const remove = (data: TreeNodeData | Node) => {
      store.value.remove(data)
    }
    // 添加节点
    const append = (
      data: TreeNodeData,
      parentNode: TreeNodeData | TreeKey | Node
    ) => {
      store.value.append(data, parentNode)
    }
    // 往某个节点前添加
    const insertBefore = (
      data: TreeNodeData,
      refNode: TreeKey | TreeNodeData
    ) => {
      store.value.insertBefore(data, refNode)
    }
    // 往某个节点后添加
    const insertAfter = (
      data: TreeNodeData,
      refNode: TreeKey | TreeNodeData
    ) => {
      store.value.insertAfter(data, refNode)
    }
    // 节点展开事件
    const handleNodeExpand = (
      nodeData: TreeNodeData,
      node: Node,
      instance: ComponentInternalInstance
    ) => {
      broadcastExpanded(node)
      ctx.emit('node-expand', nodeData, node, instance)
    }
    // 更新子节点
    const updateKeyChildren = (key: TreeKey, data: TreeData) => {
      if (!props.nodeKey)
        throw new Error('[Tree] nodeKey is required in updateKeyChild')
      store.value.updateChildren(key, data)
    }

    provide('RootTree', {
      ctx,
      props,
      store,
      root,
      currentNode,
      instance: getCurrentInstance(),
    } as any)

    // provide(formItemContextKey, undefined)

    return {

      // ref
      store,
      root,
      currentNode,
      dragState,
      el$,
      dropIndicator$,

      // computed
      isEmpty,

      // methods
      filter,
      getNodeKey,
      getNodePath,
      getCheckedNodes,
      getCheckedKeys,
      getCurrentNode,
      getCurrentKey,
      setCheckedNodes,
      setCheckedKeys,
      setChecked,
      getHalfCheckedNodes,
      getHalfCheckedKeys,
      setCurrentNode,
      setCurrentKey,

      getNode,
      remove,
      append,
      insertBefore,
      insertAfter,
      handleNodeExpand,
      updateKeyChildren,
    }
  },
})
</script>
<style src="../style/base.css">
</style>
<style src="../style/tree.scss">
</style>