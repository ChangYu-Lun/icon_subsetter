const fs = require('fs');
// 這是 Node.js 的內建模組 (File System)
// 用於檔案系統操作例如：讀取檔案、寫入檔案、建立檔案、複製檔案等

const path = require('path');
// 這是 Node.js 的內建模組
// 用於處理檔案路徑
// 可以解決跨平台路徑問題（Windows 用 \，Unix 用 /）

const glob = require('glob');
// 這是我們用 npm install 安裝的外部套件
// 用於尋找符合特定模式的檔案
// 支援萬用字元（例如 **/*.html）

const cheerio = require('cheerio');
// 這是我們用 npm install 安裝的外部套件
// 用於解析 HTML，類似於 Node.js 版的 jQuery

const { exec } = require('child_process');
// 這是 Node.js 的內建模組
// 用於執行外部命令（例如執行 Python 指令）
// 從 child_process 模組中解構出 exec 函數

const util = require('util');
// 這是 Node.js 的內建模組
// 提供各種實用工具函數
// 在這裡主要用於將回調函數轉換為 Promise

const execAsync = util.promisify(exec);
// 將 exec 函數轉換為支援 async/await 的版本
// 讓我們可以使用更現代的 Promise 語法

// 定義字體類型設定
const FONT_TYPES = {
  rounded: {
      file: 'MaterialSymbolsRounded.woff2',
      cssClass: 'ms-round',
      name: 'Rounded'
  },
  outlined: {
      file: 'MaterialSymbolsOutlined.woff2',
      cssClass: 'ms-outline',
      name: 'Outlined'
  },
  sharp: {
      file: 'MaterialSymbolsSharp.woff2',
      cssClass: 'ms-sharp',
      name: 'Sharp'
  }
};

// 確保必要的目錄存在
function ensureDirectories() {
  const directories = [
      './assets/webfont/original',
      './assets/webfont/subset',
      './assets/webfont/reports'
  ];
  
  directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
      }
  });
}

// 檢查指定的字體檔案是否存在
function checkFontExists(fontType) {
  const fontPath = `./assets/webfont/original/${FONT_TYPES[fontType].file}`;
  if (!fs.existsSync(fontPath)) {
      throw new Error(`找不到字體檔案：${fontPath}`);
  }
}

// 生成使用報告
function generateUsageReport(fontType, usedIcons, allFiles, originalSize, subsetSize) {
  const now = new Date();
  const timestamp = now.toLocaleString('zh-TW', { 
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
  });
  const version = timestamp.replace(/[/:\s]/g, '-');
  
  // 收集每個圖示在哪些檔案中使用
  const iconUsage = {};
  allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file);
      
      usedIcons.forEach(icon => {
          if (content.includes(icon)) {
              if (!iconUsage[icon]) {
                  iconUsage[icon] = [];
              }
              iconUsage[icon].push(fileName);
          }
      });
  });

  const report = {
      timestamp,
      version,
      fontType,
      fontName: FONT_TYPES[fontType].file,
      stats: {
          totalIcons: usedIcons.size,
          fileSize: subsetSize,
          originalSize: originalSize,
          compressionRatio: `${((1 - subsetSize / originalSize) * 100).toFixed(2)}%`,
          filesScanned: allFiles.length
      },
      icons: Array.from(usedIcons),
      iconUsage,
      fileTypes: [...new Set(allFiles.map(f => path.extname(f)))]
  };

  // 儲存報告
  const reportPath = path.join(
      './assets/webfont/reports', 
      `subset-report-${fontType}-${version}.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// 顯示報告摘要
function displayReportSummary(report) {
  console.log(`\n=== ${FONT_TYPES[report.fontType].name} 字體子集化報告摘要 ===`);
  console.log(`時間: ${report.timestamp}`);
  console.log(`\n統計資訊:`);
  console.log(`- 使用的圖示數量: ${report.stats.totalIcons}`);
  console.log(`- 原始檔案大小: ${(report.stats.originalSize / 1024).toFixed(2)}KB`);
  console.log(`- 子集檔案大小: ${(report.stats.fileSize / 1024).toFixed(2)}KB`);
  console.log(`- 壓縮比例: ${report.stats.compressionRatio}`);
  console.log(`- 掃描的檔案數: ${report.stats.filesScanned}`);
  console.log(`- 檔案類型: ${report.fileTypes.join(', ')}`);
  console.log('\n使用的圖示:');
  report.icons.forEach(icon => {
      console.log(`- ${icon} (使用於: ${report.iconUsage[icon].join(', ')})`);
  });
}

// 比較兩個報告
function compareReports(oldReport, newReport) {
  if (oldReport.fontType !== newReport.fontType) {
      throw new Error('無法比較不同類型的字體報告');
  }

  const comparison = {
      fontType: newReport.fontType,
      timespan: {
          from: oldReport.timestamp,
          to: newReport.timestamp
      },
      icons: {
          added: newReport.icons.filter(icon => !oldReport.icons.includes(icon)),
          removed: oldReport.icons.filter(icon => !newReport.icons.includes(icon)),
          unchanged: newReport.icons.filter(icon => oldReport.icons.includes(icon))
      },
      stats: {
          sizeChange: newReport.stats.fileSize - oldReport.stats.fileSize,
          sizeChangePercent: ((newReport.stats.fileSize - oldReport.stats.fileSize) / oldReport.stats.fileSize * 100).toFixed(2),
          iconCountChange: newReport.stats.totalIcons - oldReport.stats.totalIcons
      },
      usage: {
          newFiles: Object.keys(newReport.iconUsage).filter(icon => !oldReport.iconUsage[icon]),
          removedFiles: Object.keys(oldReport.iconUsage).filter(icon => !newReport.iconUsage[icon])
      }
  };
  
  return comparison;
}

// 顯示比較結果
function displayComparison(comparison) {
  console.log(`\n=== ${FONT_TYPES[comparison.fontType].name} 字體子集化報告比較 ===`);
  console.log(`比較時間範圍：${comparison.timespan.from} → ${comparison.timespan.to}`);
  
  console.log('\n圖示變更：');
  if (comparison.icons.added.length > 0) {
      console.log('✅ 新增圖示：', comparison.icons.added.join(', '));
  }
  if (comparison.icons.removed.length > 0) {
      console.log('❌ 移除圖示：', comparison.icons.removed.join(', '));
  }
  
  console.log('\n檔案大小變更：');
  const sizeChangeKB = (comparison.stats.sizeChange / 1024).toFixed(2);
  const direction = comparison.stats.sizeChange > 0 ? '增加' : '減少';
  console.log(`${direction} ${Math.abs(sizeChangeKB)}KB (${comparison.stats.sizeChangePercent}%)`);
  
  console.log('\n圖示數量變更：', comparison.stats.iconCountChange);
}

// 取得最近的兩個報告
function getLatestReports(fontType) {
  const reports = fs.readdirSync('./assets/webfont/reports')
      .filter(file => file.startsWith(`subset-report-${fontType}`))
      .map(file => ({
          path: path.join('./assets/webfont/reports', file),
          time: fs.statSync(path.join('./assets/webfont/reports', file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
  
  if (reports.length < 2) {
      return null;
  }
  
  return {
      oldReport: JSON.parse(fs.readFileSync(reports[1].path, 'utf-8')),
      newReport: JSON.parse(fs.readFileSync(reports[0].path, 'utf-8'))
  };
}

// 主要的子集化函數
async function createIconSubset(fontType) {
  try {
      const fontConfig = FONT_TYPES[fontType];
      const FONT_PATH = `./assets/webfont/original/${fontConfig.file}`;
      const OUTPUT_PATH = `./assets/webfont/subset/${fontConfig.file}`;
      
      // 確保字體檔存在
      checkFontExists(fontType);
      
      // 用於存儲找到的 icon 名稱
      const usedIcons = new Set();
      
      // 支援多種檔案類型
      const filePatterns = [
          './**/*.html',
          './**/*.aspx',
          './**/*.php',
          './**/*.jsx',
          './**/*.tsx',
          './**/*.vue',
          './**/*.cshtml',
          './**/*.razor'
      ];
      
      // 排除 node_modules
      const allFiles = filePatterns.reduce((acc, pattern) => {
          return acc.concat(glob.sync(pattern, { ignore: 'node_modules/**' }));
      }, []);
      
      // 掃描檔案尋找圖示
      allFiles.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');
          
          // 檢查對應的 class
          const classMatches = content.match(new RegExp(`class=["'].*?${fontConfig.cssClass}.*?["']\\s*>([^<]+)`, 'g'));
          if (classMatches) {
              classMatches.forEach(match => {
                  const iconName = match.match(/>([^<]+)/)?.[1]?.trim();
                  if (iconName) usedIcons.add(iconName);
              });
          }
          
          // HTML 相關檔案使用 cheerio 解析
          if (file.match(/\.(html|aspx|php|cshtml|razor)$/)) {
              try {
                  const $ = cheerio.load(content);
                  $(`span.${fontConfig.cssClass}, i.${fontConfig.cssClass}`).each((i, elem) => {
                      const iconName = $(elem).text().trim();
                      if (iconName) usedIcons.add(iconName);
                  });
              } catch (error) {
                  console.warn(`解析文件 ${file} 時發生錯誤：`, error);
              }
          }
      });

      // 如果沒有找到任何圖示，提前結束
      if (usedIcons.size === 0) {
          console.log(`沒有找到任何使用 ${fontConfig.name} 字體的圖示！`);
          return;
      }

      // 生成子集字體
      const iconList = Array.from(usedIcons).join(',');
      const originalSize = fs.statSync(FONT_PATH).size;
      
      await execAsync(`pyftsubset "${FONT_PATH}" \
          --unicodes=$(python3 -c "print(','.join(hex(ord(c))[2:] for c in '${iconList}'))") \
          --flavor=woff2 \
          --output-file="${OUTPUT_PATH}"`);
          
      const subsetSize = fs.statSync(OUTPUT_PATH).size;
      
      // 生成並顯示報告
      const report = generateUsageReport(fontType, usedIcons, allFiles, originalSize, subsetSize);
      displayReportSummary(report);
      
  } catch (error) {
      console.error('執行過程中發生錯誤：', error);
  }
}

// 主程式
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const fontType = args[1]?.replace('--type=', '') || 'rounded';

  // 確保是有效的字體類型
  if (!FONT_TYPES[fontType]) {
      console.error(`無效的字體類型：${fontType}`);
      console.log('可用的字體類型：', Object.keys(FONT_TYPES).join(', '));
      return;
  }

  // 確保目錄存在
  ensureDirectories();

  if (command === '--compare') {
      const reports = getLatestReports(fontType);
      if (reports) {
          const comparison = compareReports(reports.oldReport, reports.newReport);
          displayComparison(comparison);
      } else {
          console.log(`需要至少兩個 ${FONT_TYPES[fontType].name} 字體的報告才能進行比較。`);
      }
  } else {
      await createIconSubset(fontType);
  }
}

// 執行主程式
main();