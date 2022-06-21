<template>
  <transition name="el-collapse-transition" v-on="on">
    <slot />
  </transition>
</template>
<script lang="ts" setup>


// defineOptions({
//   name: 'ElCollapseTransition',
// })

const on = {
  beforeEnter(el) {
    if (!el.dataset) el.dataset = {}

    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom

    el.style.maxHeight = 0
    el.style.paddingTop = 0
    el.style.paddingBottom = 0
  },

  enter(el) {
    el.dataset.oldOverflow = el.style.overflow
    if (el.scrollHeight !== 0) {
      el.style.maxHeight = `${el.scrollHeight}px`
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    } else {
      el.style.maxHeight = 0
      el.style.paddingTop = el.dataset.oldPaddingTop
      el.style.paddingBottom = el.dataset.oldPaddingBottom
    }

    el.style.overflow = 'hidden'
  },

  afterEnter(el) {
    el.style.maxHeight = ''
    el.style.overflow = el.dataset.oldOverflow
  },

  beforeLeave(el) {
    if (!el.dataset) el.dataset = {}
    el.dataset.oldPaddingTop = el.style.paddingTop
    el.dataset.oldPaddingBottom = el.style.paddingBottom
    el.dataset.oldOverflow = el.style.overflow

    el.style.maxHeight = `${el.scrollHeight}px`
    el.style.overflow = 'hidden'
  },

  leave(el) {
    if (el.scrollHeight !== 0) {
      el.style.maxHeight = 0
      el.style.paddingTop = 0
      el.style.paddingBottom = 0
    }
  },

  afterLeave(el) {
    el.style.maxHeight = ''
    el.style.overflow = el.dataset.oldOverflow
    el.style.paddingTop = el.dataset.oldPaddingTop
    el.style.paddingBottom = el.dataset.oldPaddingBottom
  },
}
</script>
<style>
.collapse-transition {
  transition: 0.3s 0.2s height ease-in-out,
  0.3s 0.2s padding-top ease-in-out,
  0.3s 0.2s padding-bottom ease-in-out;
}

.el-collapse-transition-leave-active,
.el-collapse-transition-enter-active {
  transition: 0.3s 0.2s max-height ease-in-out,
  0.3s 0.2s padding-top ease-in-out,
  0.3s 0.2s padding-bottom ease-in-out;
}

</style>