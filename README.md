# Material Icons 子集化工具使用指南

## 目錄
1. [工具簡介](#工具簡介)
2. [先備知識](#先備知識)
3. [環境準備](#環境準備)
4. [安裝步驟](#安裝步驟)
5. [使用方式](#使用方式)
6. [常見問題](#常見問題)
7. [注意事項](#注意事項)

## 工具簡介

這個工具可以幫助我們優化 Material Icons 字體檔案的大小。它會分析專案中實際使用到的圖示，然後生成一個只包含這些圖示的較小字體檔案，可以大幅減少載入時間。

主要功能：
- 支援 Rounded、Outlined、Sharp 三種風格的圖示
- 自動掃描專案中使用的圖示
- 生成優化後的字體檔案
- 產生使用報告
- 比較不同版本的變化

## 先備知識

### 基本概念
- **字體子集化**：從完整的字體檔案中只保留需要的部分，以減少檔案大小
- **Material Icons**：Google 提供的圖示字體，包含多種風格（Rounded、Outlined、Sharp）

### 使用 Material Icons 的方式
在 HTML 中使用圖示：
```html
<!-- Rounded 風格 -->
<span class="ms-round">home</span>

<!-- Outlined 風格 -->
<span class="ms-outline">search</span>

<!-- Sharp 風格 -->
<span class="ms-sharp">menu</span>
```

## 環境準備

需要安裝以下軟體：
1. Node.js（[下載連結](https://nodejs.org/)）
    - 用於執行腳本
    - 建議使用 LTS 版本
2. Python（[下載連結](https://www.python.org/downloads/)）
    - 用於字體處理
    - 請選擇 Python 3.x 版本

安裝確認：
```bash
# 確認 Node.js 安裝
node --version

# 確認 Python 安裝
python3 --version
```

## 安裝步驟

1. 取得專案檔案：
   ```bash
   # 將專案複製到本機
   git clone [專案網址]
   cd [專案資料夾]
   ```

2. 安裝必要套件：
   ```bash
   # 安裝 Node.js 套件
   npm install

   # 安裝 Python 套件
   python3 -m pip install fonttools brotli
   ```

3. 準備字體檔案：
   - 將原始字體檔案放在 `assets/webfont/original/` 資料夾中
   - 檔案名稱必須是：
     - MaterialSymbolsRounded.woff2
     - MaterialSymbolsOutlined.woff2
     - MaterialSymbolsSharp.woff2

## 使用方式

### 基本使用

1. 生成單一風格的子集：
   ```bash
   # Rounded 風格
   npm run build:font:rounded

   # Outlined 風格
   npm run build:font:outlined

   # Sharp 風格
   npm run build:font:sharp
   ```

2. 生成所有風格的子集：
   ```bash
   npm run build:font:all
   ```

3. 比較版本變化：
   ```bash
   # Rounded 風格的變化
   npm run font:compare:rounded
   ```

### 檔案位置
- 原始字體：`assets/webfont/original/`
- 優化後的字體：`assets/webfont/subset/`
- 報告檔案：`assets/webfont/reports/`

## 常見問題

Q: 執行時出現 "找不到字體檔案" 的錯誤？
A: 請確認字體檔案已放在正確位置，且檔名完全符合要求。

Q: 執行後沒有生成子集檔案？
A: 可能是沒有在專案中使用任何圖示，請確認 HTML 中有使用正確的 class 名稱。

Q: 報告顯示的時間不正確？
A: 報告使用台灣時區，如果顯示時間不正確，請確認系統時區設定。

## 注意事項

1. 檔案命名：
   - 務必使用正確的檔案名稱
   - 不要手動修改 subset 資料夾中的檔案

2. CSS 設定：
   - 開發時使用原始字體
   - 部署時才使用子集字體
   - 可以在 CSS 中註解切換

3. 版本控制：
   - 建議將原始字體加入版本控制
   - 子集檔案可以不需要加入
   - 報告檔案建議加入以追蹤變化

4. 效能考量：
   - 建議在完成一定程度的開發後才執行子集化
   - 不需要每次修改都執行
   - 可以在部署前作為建置流程的一部分

## 更多資源

- [Material Icons 官方文件](https://fonts.google.com/icons)
- [字體子集化說明](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/webfont-optimization)
- [專案技術文件]()

如有任何問題，請聯繫專案負責人或在 Issue 中提出。
