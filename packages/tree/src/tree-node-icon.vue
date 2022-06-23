<template>
  <div class="org-tree-node-icon" @click="handleExpandIconClick">
    <slot :node="node">
      <span @click="handleExpandIconClick"
        :class="['org-tree-node-btn', { 'is-leaf': node.isLeaf, 'expanded': !node.isLeaf && node.expanded }]"></span>
    </slot>
  </div>
</template>

<script lang='ts' setup>
import { inject } from 'vue';
import type { RootTreeType } from './tree.type'
const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});
const tree = inject<RootTreeType>('RootTree')
const emit = defineEmits(['node-collapse', 'node-expand']);
const handleExpandIconClick = () => {
  if (props.node.isLeaf) return
  if (props.node.expanded) {
    emit('node-collapse', props.node.data, props.node, tree)
    // props.node.collapse()
  } else {
    // props.node.expand()
    emit('node-expand', props.node.data, props.node, tree)
  }
}
</script>

<style lang='scss' scoped>
</style>