# 心动时刻 Landing Page

这是一个用于市场验证的Landing Page，用于测试「心动时刻」AI智能匹配恋爱APP的市场需求。

## 快速部署

### 方法1：使用npx部署到Vercel（推荐）

```bash
# 在landing-page目录下执行
npx vercel

# 按提示操作：
# 1. 选择部署范围（个人或团队）
# 2. 确认项目名称
# 3. 等待部署完成
# 4. 获得在线访问地址
```

### 方法2：使用GitHub Pages

```bash
# 1. 创建GitHub仓库
# 2. 推送代码
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/xindong-landing.git
git push -u origin main

# 3. 启用GitHub Pages
# Settings → Pages → Source: main → Save
```

### 方法3：使用Netlify

```bash
# 方法A：拖拽部署
# 访问 https://app.netlify.com/drop
# 拖拽index.html文件

# 方法B：CLI部署
npx netlify-cli deploy --prod
```

## 本地预览

```bash
# 方法1：Python服务器
python3 -m http.server 8000

# 方法2：Node.js服务器
npx serve

# 然后访问 http://localhost:8000 或 http://localhost:3000
```

## 配置Google Analytics

1. 访问 https://analytics.google.com
2. 创建新媒体资源
3. 获取跟踪ID（格式：G-XXXXXXXXXX）
4. 在index.html中替换`GA_MEASUREMENT_ID`

## 文件说明

- `index.html` - Landing Page主文件
- `vercel.json` - Vercel部署配置
- `package.json` - 项目配置
- `server/` - 后端API示例（可选）

## 验证目标

- 访问量 ≥ 1,000
- 注册转化率 ≥ 10%
- 付费转化率 ≥ 5%
- CAC < ¥50

## 支持

如有问题，请查看：
- [快速启动指南](../QUICK_START.md)
- [部署指南](../landing-page/README.md)
- [推广计划](../PROMOTION_PLAN.md)