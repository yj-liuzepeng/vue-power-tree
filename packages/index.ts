/*
 * @Author: lzp
 * @Date: 2022-06-17 10:38:06
 * @Description: file content
 */

import Tree from './tree/src/tree.vue'
import type { App,Plugin } from 'vue'

type SFCWithInstall<T> = T & Plugin

Tree.install = (app: App): void => {
  app.component(Tree.name, Tree)
}

const _Tree = Tree as SFCWithInstall<typeof Tree>

export default _Tree
export const VuePowerTree = _Tree