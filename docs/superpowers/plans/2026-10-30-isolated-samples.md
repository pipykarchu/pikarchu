# Isolated Samples Implementation Plan

> Execute inline; the user has approved implementation and publication.

**Goal:** 五个无需模型额度、不会改动正式数据的交互样品。
**Architecture:** 五个静态 HTML 入口，共享响应式样式、本地状态模块及控制器。CSP 禁止网络连接，存储按应用隔离，回答使用预设示例。
**Tech Stack:** HTML / CSS / JavaScript modules / Node tests / GitHub Pages。

## Global Constraints
正式站、正式数据和访问权限不变；全部虚拟数据；不连接模型；独立存储键；重置仅删除当前样品。

## Tasks
- [x] 1. 创建 sample-state.mjs：初始化、安全恢复、存储与重置、利润计算、测验、挖矿操作。node --test tests/codex-samples.test.mjs 验证关键数据行为。
- [x] 2. 创建 sample.js、sample.css、五个 index.html：表单、导航、反馈、模拟问答、确认重置和手机布局。node --check 检查脚本。
- [x] 3. 修改 content/projects.json，仅替换五个条目的展示与入口，移除正式站链接；其余项目不变。
- [ ] 4. 原子提交到个人站仓库，等待 Pages 发布成功；验证线上资源与 CSP，确认正式站权限未变。
