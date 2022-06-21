<template>
  <div v-show="node.visible" ref="node$" :class="[
  
    (treeType == 'org' ? 'org-tree-node' : 'el-tree-node'),
    {'collapsed': !expanded},
    { 'is-expanded': expanded },
    { 'is-leaf': expanded && treeType == 'org' },
    { 'is-current': node.isCurrent },
    { 'is-hidden': !node.visible },
    { 'is-focusable': !node.disabled },
    { 'is-checked': !node.disabled && node.checked },
    getNodeClass(node),
  ]" role="treeitem" tabindex="-1" :aria-expanded="expanded" :aria-disabled="node.disabled"
    :aria-checked="node.checked" :draggable="tree.props.draggable" :data-key="getNodeKey(node)"
    @click.stop="handleClick" @contextmenu="handleContextMenu" @dragstart.stop="handleDragStart"
    @dragover.stop="handleDragOver" @dragend.stop="handleDragEnd" @drop.stop="handleDrop">
    <!-- 组织树 -->
    <div class="org-tree-node-label" v-if="treeType == 'org'">
      <node-icon v-if="node.childNodes && node.childNodes.length > 0" :node="node">
       <!-- <slot name="node-icon-slot"></slot> -->
        <!-- <template #node-icon>
          <div
          v-if="node.expanded"
          style="border: 1px solid red; background: #fff;width: 20px; height: 20px; display: flex; align-items: center; justify-content: center"
        >-</div>
        <div
          v-else
          style="border: 1px solid red; background: #fff; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center"
        >
          +
        </div>
      </template> -->
      </node-icon>
      <node-content :node="node" :render-content="renderContent" :tree-type="treeType" />
    </div>
    <!-- 普通树 -->
    <div class="el-tree-node__content" v-else :style="{ paddingLeft: (node.level - 1) * tree.props.indent + 'px' }">
      <el-icon v-if="tree.props.icon || CaretRight" :class="[
        'el-tree-node__expand-icon',
        { 'is-leaf': node.isLeaf },
        {
          expanded: !node.isLeaf && expanded,
        },
      ]" @click.stop="handleExpandIconClick">
        <component :is="tree.props.icon || CaretRight" />
      </el-icon>
      <el-checkbox v-if="showCheckbox" :model-value="node.checked" :indeterminate="node.indeterminate"
        :disabled="!!node.disabled" @click.stop @change="handleCheckChange" />
      <el-icon v-if="node.loading" class="el-tree-node__loading-icon is-loading">
        <loading />
      </el-icon>
      <node-content :node="node" :render-content="renderContent" :tree-type="treeType" />
    </div>

    <!-- 过渡效果 -->
    <div v-if="treeType == 'org'">
      <div v-if="(!renderAfterExpand || childNodeRendered) && node.childNodes.length > 0" v-show="expanded"
        :class="treeType == 'org' ? 'org-tree-node-children' : 'el-tree-node__children'" role="group"
        :aria-expanded="expanded">
        <el-tree-node v-for="child in node.childNodes" :key="getNodeKey(child)" :render-content="renderContent"
          :render-after-expand="renderAfterExpand" :show-checkbox="showCheckbox" :node="child" :accordion="accordion"
          :props="props" @node-expand="handleChildNodeExpand" :tree-type="treeType" />
      </div>
    </div>
    <div v-else>
      <collapse-transition>
        <div v-if="(!renderAfterExpand || childNodeRendered) && node.childNodes.length > 0" v-show="expanded"
          :class="treeType == 'org' ? 'org-tree-node-children' : 'el-tree-node__children'" role="group"
          :aria-expanded="expanded">
          <el-tree-node v-for="child in node.childNodes" :key="getNodeKey(child)" :render-content="renderContent"
            :render-after-expand="renderAfterExpand" :show-checkbox="showCheckbox" :node="child" :accordion="accordion"
            :props="props" @node-expand="handleChildNodeExpand" :tree-type="treeType" />
        </div>
      </collapse-transition>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  provide,
  ref,
  watch,
} from 'vue'
import { isFunction, isString } from '@vue/shared'
// 依赖组件
import CollapseTransition from './components/collapse-transition.vue'
import { ElCheckbox, ElIcon } from 'element-plus'
import 'element-plus/es/components/checkbox/style/css'
import 'element-plus/es/components/icon/style/css'

import { CaretRight, Loading } from '@element-plus/icons-vue'
import NodeContent from './tree-node-content.vue'
import NodeIcon from './tree-node-icon.vue'
import { getNodeKey as getNodeKeyUtil } from './model/util'
import { useNodeExpandEventBroadcast } from './model/useNodeExpandEventBroadcast'
import { dragEventsKey } from './model/useDragNode'
import Node from './model/node'

import type { ComponentInternalInstance, PropType } from 'vue'

import type { RootTreeType, TreeNodeData, TreeOptionProps } from './tree.type'

export default defineComponent({
  name: 'ElTreeNode',
  components: {
    CollapseTransition,
    ElCheckbox,
    NodeContent,
    NodeIcon,
    ElIcon,
    CaretRight,
    Loading,
  },
  props: {
    node: {
      type: Node,
      default: () => ({}),
    },
    treeType: {
      // 树类型，普通模式：normal，组织树模式：org
      type: String,
      default: 'normal',
    },
    props: {
      type: Object as PropType<TreeOptionProps>,
      default: () => ({}),
    },
    accordion: Boolean,
    renderContent: Function,
    renderAfterExpand: Boolean,
    showCheckbox: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['node-expand'],
  setup(props, ctx) {


    const { broadcastExpanded } = useNodeExpandEventBroadcast(props)
    const tree = inject<RootTreeType>('RootTree')
    const expanded = ref(false)
    const childNodeRendered = ref(false)
    const oldChecked = ref<boolean>(null)
    const oldIndeterminate = ref<boolean>(null)
    const node$ = ref()
    const dragEvents = inject(dragEventsKey)
    const instance = getCurrentInstance()

    provide('NodeInstance', instance)
    if (!tree) {
      console.warn('Tree', "Can not find node's tree.")

    }

    if (props.node.expanded) {
      expanded.value = true
      childNodeRendered.value = true
    }

    const childrenKey = tree.props['children'] || 'children'
    watch(
      () => {
        const children = props.node.data[childrenKey]
        return children && [...children]
      },
      () => {
        props.node.updateChildren()
      }
    )

    watch(
      () => props.node.indeterminate,
      (val) => {
        handleSelectChange(props.node.checked, val)
      }
    )

    watch(
      () => props.node.checked,
      (val) => {
        handleSelectChange(val, props.node.indeterminate)
      }
    )

    watch(
      () => props.node.expanded,
      (val) => {
        nextTick(() => (expanded.value = val))
        if (val) {
          childNodeRendered.value = true
        }
      }
    )

    const getNodeKey = (node: Node): any => {
      return getNodeKeyUtil(tree.props.nodeKey, node.data)
    }

    const getNodeClass = (node: Node) => {
      const nodeClassFunc = props.props.class
      if (!nodeClassFunc) {
        return {}
      }
      let className
      if (isFunction(nodeClassFunc)) {
        const { data } = node
        className = nodeClassFunc(data, node)
      } else {
        className = nodeClassFunc
      }

      if (isString(className)) {
        return { [className]: true }
      } else {
        return className
      }
    }

    const handleSelectChange = (checked: boolean, indeterminate: boolean) => {
      if (
        oldChecked.value !== checked ||
        oldIndeterminate.value !== indeterminate
      ) {
        tree.ctx.emit('check-change', props.node.data, checked, indeterminate)
      }
      oldChecked.value = checked
      oldIndeterminate.value = indeterminate
    }

    const handleClick = (e: MouseEvent) => {
      const store = tree.store.value
      store.setCurrentNode(props.node)
      tree.ctx.emit(
        'current-change',
        store.currentNode ? store.currentNode.data : null,
        store.currentNode
      )
      tree.currentNode.value = props.node

      if (tree.props.expandOnClickNode) {
        handleExpandIconClick()
      }

      if (tree.props.checkOnClickNode && !props.node.disabled) {
        handleCheckChange(null, {
          target: { checked: !props.node.checked },
        })
      }
      tree.ctx.emit('node-click', props.node.data, props.node, instance, e)
    }

    const handleContextMenu = (event: Event) => {
      if (tree.instance.vnode.props['onNodeContextmenu']) {
        event.stopPropagation()
        event.preventDefault()
      }
      tree.ctx.emit(
        'node-contextmenu',
        event,
        props.node.data,
        props.node,
        instance
      )
    }

    const handleExpandIconClick = () => {
      if (props.node.isLeaf) return
      if (expanded.value) {
        tree.ctx.emit('node-collapse', props.node.data, props.node, instance)
        props.node.collapse()
      } else {
        props.node.expand()
        ctx.emit('node-expand', props.node.data, props.node, instance)
      }
    }

    const handleCheckChange = (value, ev) => {
      props.node.setChecked(ev.target.checked, !tree.props.checkStrictly)
      nextTick(() => {
        const store = tree.store.value
        tree.ctx.emit('check', props.node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys(),
        })
      })
    }

    const handleChildNodeExpand = (
      nodeData: TreeNodeData,
      node: Node,
      instance: ComponentInternalInstance
    ) => {
      broadcastExpanded(node)
      tree.ctx.emit('node-expand', nodeData, node, instance)
    }

    const handleDragStart = (event: DragEvent) => {
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragStart({ event, treeNode: props })
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragOver({
        event,
        treeNode: { $el: node$.value, node: props.node },
      })
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
    }

    const handleDragEnd = (event: DragEvent) => {
      if (!tree.props.draggable) return
      dragEvents.treeNodeDragEnd(event)
    }

    return {

      node$,
      tree,
      expanded,
      childNodeRendered,
      oldChecked,
      oldIndeterminate,
      getNodeKey,
      getNodeClass,
      handleSelectChange,
      handleClick,
      handleContextMenu,
      handleExpandIconClick,
      handleCheckChange,
      handleChildNodeExpand,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
      CaretRight,
    }
  },
})
</script>
