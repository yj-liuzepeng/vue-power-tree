<!--
 * @Author: lzp
 * @Date: 2022-06-15 18:09:08
 * @Description: file content
-->
<template>
  <vue-power-tree :data="data" :props="defaultProps" draggable show-checkbox tree-type="org" @node-click="handleNodeClick"
    default-expand-all >
    </vue-power-tree>
</template>

<script lang="ts" setup>
import VuePowerTree from '../dist/vue-power-tree.es.js'
import '../dist/style.css'
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
