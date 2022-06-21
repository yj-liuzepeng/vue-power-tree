<script lang="ts">
import { defineComponent, h, inject } from 'vue'


import type { ComponentInternalInstance } from 'vue'
import type { RootTreeType } from './tree.type'

export default defineComponent({
  name: 'ElTreeNodeContent',
  props: {
    node: {
      type: Object,
      required: true,
    },
    treeType: {
      // 树类型，普通模式：normal，组织树模式：org
      type: String,
      default: 'normal',
    },
    renderContent: Function,
  },
  setup(props) {

    const nodeInstance = inject<ComponentInternalInstance>('NodeInstance')
    const tree = inject<RootTreeType>('RootTree')

    return () => {
      const node = props.node
      const { data, store } = node
      return props.renderContent
        ? props.renderContent(h, { _self: nodeInstance, node, data, store })
        : tree.ctx.slots.default
          ? tree.ctx.slots.default({ node, data })
          : h('span', { class: props.treeType == 'org'  ? 'org-tree-node-label-inner' :'el-tree-node__label' }, [node.label])
      // : h('span', { class: 'el-tree-node__label' }, [node.label])
    }
  },
})
</script>
