# 鍛語 TANGO

> 日语语法互动学习应用，基于 Tae Kim's Japanese Grammar Guide 中文版

**Live**: https://bkmashiro.github.io/tango/

---

## 功能

- **结构化课程** — Tae Kim 语法指南完整内容（词汇、例句、语法规则、注意事项）
- **假名发音** — 点击假名表字符即可听到标准发音（228 个音频文件）
- **单词复习 SRS** — 基于 SM-2 算法的间隔重复，自动安排复习时间
- **进度追踪** — 记录已读章节，首页展示全局进度条
- **离线优先** — 所有进度存储于 IndexedDB，无需账号，无需联网
- **深色主题**

## 数据来源

| 来源 | 说明 | 许可 |
|------|------|------|
| [Tae Kim's Grammar Guide](http://www.guidetojapanese.org/learn/grammar) | 原始英文内容 | CC BY-NC-SA 2.5 |
| [pizzamx/jpgramma](https://github.com/pizzamx/jpgramma) | 中文翻译 HTML 源文件 | CC BY-NC-SA 2.5 |

当前数据：**55 课** · **3155 词** · **1186 例句**

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript
- **路由**: Vue Router (hash mode)
- **存储**: Dexie.js (IndexedDB)
- **数据解析**: Python 3 + BeautifulSoup4
- **部署**: GitHub Pages

## 本地开发

```bash
git clone https://github.com/bkmashiro/tango.git
cd tango
npm install
npm run dev
```

## 重新解析数据

```bash
# 克隆 jpgramma 源文件（parse.py 在此目录）
git clone https://github.com/pizzamx/jpgramma ../jpgramma

cd ../jpgramma
python3 parse.py

cp data/lessons.json ../tango/public/lessons.json
```

## 部署

```bash
bash deploy.sh
```

将构建产物推送到 `gh-pages` 分支（需要 GPG 签名密钥）。

## 结构

```
src/
├── components/blocks/   # 8 种内容块组件 + InlineRenderer
├── views/               # HomeView / LessonView / ReviewView
└── stores/
    ├── data.ts          # 课程数据（响应式）
    └── db.ts            # IndexedDB via Dexie

public/
├── audio/               # 228 个音频文件 (.mp3 + .ogg)
└── lessons.json         # 解析后的课程数据
```

## 许可证

代码：MIT  
内容：CC BY-NC-SA 2.5（原作者版权）
