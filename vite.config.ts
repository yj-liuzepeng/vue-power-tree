import { defineConfig } from "vite"; // 工具函数，获取类型提示
import { resolve } from "path";

import vue from '@vitejs/plugin-vue';
// 路径函数
function pathResolve(dir) {
  return resolve(__dirname, ".", dir);
}

export default defineConfig({
    plugins:[vue()],
    resolve: {
        alias: { // 设置别名,@就代表src目录
          "@": pathResolve("src"),
        }
    },
    build: {
      lib: {
	      entry: pathResolve('packages/index.ts'), // 入口文件
	      name: 'VuePowerTree',	// 暴露的全局变量
	      fileName: (format) => `vue-power-tree.${format}.js` //  输出的包文件名
	    },
      rollupOptions: {
	      external: ['vue'], // 确保外部化处理那些不想打包进库的依赖
	      output: {
	        globals: {	// 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
	          vue: 'Vue'
	        }
	      }
	    }
    }
});