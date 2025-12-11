# Entorno - 你的 AI 西语私教

这是一个基于 React + Tailwind CSS + Google Gemini API 开发的西班牙语场景化学习应用。

## 🚀 如何发布到手机 (Deploy)

### 第一步：推送到 GitHub
1. 在 Bolt 编辑器顶部，点击 **"Repository"** 或 **"Connect to GitHub"**。
2. 选择 **"Create Repository"**，这会将代码保存到你的 GitHub 账户。

### 第二步：部署到 Vercel
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)。
2. 点击 **"Add New..."** -> **"Project"**。
3. 选择 **"Continue with GitHub"** 并导入刚才创建的 `entorno` 仓库。

### 第三步：配置 API Key (重要！)
在 Vercel 的部署页面 (Configure Project) 中，你必须设置 API Key，否则 AI 无法回复。
1. 找到 **Environment Variables** (环境变量) 区域。
2. 添加变量：
   - **Key**: `API_KEY`
   - **Value**: `你的_Google_Gemini_API_Key`
   *(可以在 [Google AI Studio](https://aistudio.google.com/app/apikey) 免费获取)*
3. 点击 **Deploy**。

---

## ✨ 功能特性
- **场景化生成**: 输入任何场景，生成 A2 水平对话。
- **互动学习**: 点击单词查看释义和原型。
- **真人级发音**: 每一句话、每一个单词都可朗读。
- **单词本**: 收藏生词，随时复习。
- **AI 对话**: 模拟真实语境进行自由对话练习。
