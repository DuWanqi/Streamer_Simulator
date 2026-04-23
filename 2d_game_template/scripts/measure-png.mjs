import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import PNG from 'pngjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'assets', '直播间UI挖空真.png');
const buf = readFileSync(filePath);
const png = PNG.PNG.sync.read(buf);
const { width: w, height: h, data } = png;
const n = w * h;

console.log(`图片尺寸: ${w} x ${h}px`);
console.log('正在分析透明区域...\n');

// Union-Find
const parent = new Int32Array(n).map((_, i) => i);
const rank = new Uint8Array(n);
function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
function union(a, b) { a = find(a); b = find(b); if (a === b) return; if (rank[a] < rank[b]) [a, b] = [b, a]; parent[b] = a; if (rank[a] === rank[b]) rank[a]++; }

// 标记透明像素并4-连通合并
const isT = new Uint8Array(n);
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (data[i * 4 + 3] < 128) {
      isT[i] = 1;
      if (x > 0 && isT[i - 1]) union(i, i - 1);
      if (y > 0 && isT[i - w]) union(i, i - w);
    }
  }
}

// 分组计算包围盒
const map = {};
for (let i = 0; i < n; i++) {
  if (!isT[i]) continue;
  const root = find(i);
  if (!map[root]) map[root] = { minX: w, minY: h, maxX: 0, maxY: 0, count: 0 };
  const r = map[root];
  const x = i % w, y = (i - x) / w;
  if (x < r.minX) r.minX = x;
  if (x > r.maxX) r.maxX = x;
  if (y < r.minY) r.minY = y;
  if (y > r.maxY) r.maxY = y;
  r.count++;
}

// 过滤噪点，按面积排序
const regions = Object.values(map).filter(r => r.count > 5000).sort((a, b) => b.count - a.count);

regions.forEach((r, i) => {
  r.width = r.maxX - r.minX + 1;
  r.height = r.maxY - r.minY + 1;
  const ratio = r.width / r.height;
  r.type = ratio > 2 ? '→ 水平公告栏' : ratio < 0.6 ? '↓ 竖直侧栏' : r.count > regions[0].count * 0.3 ? '■ 直播画面' : '■ 评论区';
  console.log(`区域${i + 1} (${r.type})`);
  console.log(`  位置: top:${r.minY}px; left:${r.minX}px`);
  console.log(`  尺寸: ${r.width} x ${r.height}px  (宽高比: ${ratio.toFixed(2)})`);
  console.log(`  像素: ${r.count.toLocaleString()}\n`);
});

// 自动分类并输出CSS
const sorted = [...regions].sort((a, b) => a.minY - b.minY);
const titleBar = sorted.find(r => r.width / r.height > 2) || sorted[0];
const below = sorted.filter(r => r !== titleBar).sort((a, b) => a.minX - b.minX);
const liveArea = below[0], chatArea = below[1];

console.log('=== 复制以下CSS变量 ===\n');
console.log(`/* #title-bar 顶部公告栏 */`);
console.log(`--title-top: ${titleBar.minY}px; --title-left: ${titleBar.minX}px;`);
console.log(`--title-width: ${titleBar.width}px; --title-height: ${titleBar.height}px;\n`);
console.log(`/* #live-area 左侧直播画面 */`);
console.log(`--live-top: ${liveArea.minY}px; --live-left: ${liveArea.minX}px;`);
console.log(`--live-width: ${liveArea.width}px; --live-height: ${liveArea.height}px;\n`);
console.log(`/* #chat-area 右侧评论区 */`);
console.log(`--chat-top: ${chatArea.minY}px; --chat-left: ${chatArea.minX}px;`);
console.log(`--chat-width: ${chatArea.width}px; --chat-height: ${chatArea.height}px;`);
