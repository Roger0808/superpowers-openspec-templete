// 构建前版本号递增脚本
// 每次 npm run build 自动执行

import { readFileSync, writeFileSync } from 'fs'

const versionFile = 'src/version.ts'

const content = readFileSync(versionFile, 'utf-8')
const match = content.match(/VERSION = ['"]([\d.]+)['"]/)

if (match) {
  const currentVersion = parseFloat(match[1])
  const newVersion = (currentVersion + 0.001).toFixed(3)
  const newContent = content.replace(
    /export const VERSION = ['"][\d.]+['"]/,
    `export const VERSION = '${newVersion}'`
  )
  writeFileSync(versionFile, newContent)
  console.log(`Version updated: ${match[1]} → ${newVersion}`)
}
