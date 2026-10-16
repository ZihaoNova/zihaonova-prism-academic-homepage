# Zihao Huang PRISM 学术主页

[English](README.md)

本仓库是浙江农林大学讲师 **Zihao Huang** 的 PRISM 备用学术主页，基于 Next.js、Tailwind CSS 和 TypeScript。

Pages 公开地址：<https://zihaonova.github.io/zihaonova-prism-academic-homepage/>。

HugoIO 保持独立：本仓库不会替代或修改该主页、其仓库及部署。

## 内容位置

- 站点信息与导航：`content/config.toml`；首页结构：`content/about.toml`。
- 简介、动态与简历：`content/bio.md`、`content/news.toml`、`content/cv.md`。
- 论文：`content/publications.bib`；研究与工具：`content/research.toml`、`content/tooling.toml`。
- 奖项与学术服务：`content/awards.toml`、`content/services.toml`。
- 中文内容：`content_zh/`；缺少本地化文件时回退至 `content/`。
- 个人、研究与论文资源：`public/profile/`、`public/research/`、`public/papers/`。

## 本地开发

使用 Node.js 22 和 `package.json` 固定的 pnpm 11.25.0。在仓库根目录运行，确保未设置 `NEXT_PUBLIC_BASE_PATH`，以根路径开发：

```powershell
pnpm install --frozen-lockfile
pnpm run dev
```

打开 <http://localhost:3000/>。生成并检查本地根路径静态导出：

```powershell
pnpm run test:node
pnpm run build
pnpm run verify:export
```

## GitHub Pages

`.github/workflows/deploy.yml` 会在推送至 `main` 后自动构建、验证并部署，也支持手动触发。工作流使用 Node.js 22、固定版本的 pnpm、冻结锁文件安装及下述 Pages 基础路径。静态文件输出至 `out/`。

在 PowerShell 中验证 Pages 导出：

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/zihaonova-prism-academic-homepage'
pnpm run build
pnpm run verify:export
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

## 致谢与许可

本主页改编自 Joey Liu 及贡献者的 [PRISM](https://github.com/xyjoey/PRISM)，遵循 [MIT 许可证](LICENSE)。
