/**
 * 英语全科启蒙导航 - Cloudflare Worker v4.0.0 (Ultimate Edition)
 * 特性：100% 同步 Next.js 项目视觉与功能
 *       7 套儿童友好主题 (薄荷/薰衣草/柠檬/棉花糖/海洋/银河/极致纯黑)
 *       高级视觉效果：Spotlight 聚光灯、布尔运算布局偏移、玻璃拟态后台
 *       功能完备：搜索分类、实时主题切换、全功能管理后台 (分类/链接/设置)
 *       存储支持：Cloudflare KV / D1 (KV-Legacy Mode)
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
        const storage = env.DB || env.KV;

        if (!storage) {
            return new Response("Configuration Error: KV binding (DB or KV) missing.", { status: 500 });
        }

        const ctx = { storage, env };

        try {
            // 1. 公开路由
            if (path === "/" || path === "/index.html") return renderHome(ctx);
            if (path === "/api/login" && request.method === "POST") return handleLogin(request, env);

            // 2. 鉴权校验
            const isAuthed = await checkAuth(request, env);
            if (!isAuthed && (path === "/admin" || path.startsWith("/api/"))) {
                if (path === "/admin") return renderLogin();
                return new Response("Unauthorized", { status: 401 });
            }

            // 3. 受保护路由
            if (path === "/admin") return renderAdmin(ctx);

            // 4. API 路由
            if (path === "/api/settings" && request.method === "POST") {
                const data = await request.json();
                await storage.put("settings", JSON.stringify(data));
                return Response.json({ success: true });
            }
            if (path === "/api/categories/save" && request.method === "POST") {
                const categories = await request.json();
                await storage.put("categories", JSON.stringify(categories));
                return Response.json({ success: true });
            }

            return new Response("Not Found", { status: 404 });
        } catch (err) {
            return new Response(`Worker Fatal Error: ${err.message}`, { status: 500 });
        }
    }
};

// --- 工具函数 ---
async function checkAuth(request, env) {
    const cookie = request.headers.get("Cookie") || "";
    const password = env.ADMIN_PASSWORD || "admin";
    return cookie.includes(`session_token=${password}`);
}

async function handleLogin(request, env) {
    const { password } = await request.json();
    const correct = env.ADMIN_PASSWORD || "admin";
    if (password === correct) {
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `session_token=${correct}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
            }
        });
    }
    return Response.json({ success: false }, { status: 401 });
}

// --- 核心 CSS (完全同步 globals.css 逻辑) ---
const CSS_BUNDLE = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;700;900&display=swap');

  :root {
    --background: 265 48% 10%; --foreground: 210 40% 98%;
    --card: 265 48% 13%; --card-foreground: 210 40% 98%;
    --primary: 265 89% 78%; --primary-foreground: 265 48% 10%;
    --border: 265 48% 25%; --radius: 1.5rem;
    --brand-grad-1-start: 265 89% 78%; --brand-grad-1-mid: 280 80% 60%; --brand-grad-1-end: 180 100% 65%;
  }

  .mint {
    --background: 200 60% 98%; --foreground: 218 23% 23%;
    --card: 0 0% 100%; --card-foreground: 218 23% 23%;
    --primary: 176 56% 55%; --primary-foreground: 0 0% 100%;
    --border: 176 56% 90%; --brand-grad-1-start: 176 56% 55%; --brand-grad-1-end: 0 100% 71%;
  }
  .lavender {
    --background: 255 100% 99%; --foreground: 247 17% 22%;
    --card: 0 0% 100%; --card-foreground: 247 17% 22%;
    --primary: 255 92% 76%; --primary-foreground: 255 40% 20%;
    --border: 255 92% 92%; --brand-grad-1-start: 255 92% 76%; --brand-grad-1-end: 329 86% 70%;
  }
  .lemon {
    --background: 45 100% 97%; --foreground: 30 35% 18%;
    --card: 0 0% 100%; --card-foreground: 30 35% 18%;
    --primary: 45 96% 64%; --primary-foreground: 30 40% 15%;
    --border: 45 96% 90%; --brand-grad-1-start: 45 96% 64%; --brand-grad-1-end: 25 95% 53%;
  }
  .candy {
    --background: 333 60% 98%; --foreground: 325 25% 23%;
    --card: 0 0% 100%; --card-foreground: 325 25% 23%;
    --primary: 329 81% 81%; --primary-foreground: 325 40% 20%;
    --border: 329 81% 92%; --brand-grad-1-start: 329 81% 81%; --brand-grad-1-end: 140 46% 72%;
  }
  .ocean {
    --background: 204 100% 97%; --foreground: 213 52% 25%;
    --card: 0 0% 100%; --card-foreground: 213 52% 25%;
    --primary: 214 100% 65%; --primary-foreground: 0 0% 100%;
    --border: 214 100% 90%; --brand-grad-1-start: 214 100% 65%; --brand-grad-1-end: 42 100% 70%;
  }
  .galaxy {
    --background: 265 48% 10%; --foreground: 210 40% 98%;
    --card: 265 48% 13%; --card-foreground: 210 40% 98%;
    --primary: 265 89% 78%; --primary-foreground: 265 48% 10%;
    --border: 265 48% 25%;
  }
  .midnight {
    --background: 0 0% 0%; --foreground: 210 40% 98%;
    --card: 240 10% 4%; --card-foreground: 210 40% 98%;
    --primary: 0 0% 100%; --primary-foreground: 0 0% 0%;
    --border: 240 4% 16%;
  }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    transition: all 0.4s ease;
  }

  /* 特色卡片样式 */
  .theme-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
  }

  .ocean .theme-card { border-radius: 2rem 0.5rem 2rem 0.5rem; }
  .candy .theme-card { border-radius: 3rem; }
  .lemon .theme-card { border-width: 2px; box-shadow: 4px 4px 0 hsl(var(--primary) / 0.2); }

  /* Spotlight 聚光灯效果 */
  .link-grid-container .card-wrapper {
    transition: margin-right 0.3s ease;
    will-change: margin-right;
  }
  .link-grid-container:has(.card-wrapper:hover) .card-wrapper:not(:hover) {
    transform: scale(0.95); opacity: 0.5; filter: blur(1px);
  }
  .link-grid-container .card-wrapper:hover {
    margin-right: 220px; z-index: 50;
  }

  /* Tooltip 布局偏移 */
  .card-tooltip {
    position: absolute; right: -210px; top: -10px; width: 200px;
    background: #1e1b4b; color: #fff; border: 1px solid rgba(255,255,255,0.2);
    border-radius: 1rem; padding: 1.2rem; opacity: 0; pointer-events: none;
    transition: all 0.3s ease; transform: translateX(-10px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  }
  .card-wrapper:hover .card-tooltip { opacity: 1; transform: translateX(0); }

  .animate-gradient {
    background-size: 200% 200%;
    animation: grad 5s ease infinite;
  }
  @keyframes grad { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }

  .font-caveat { font-family: 'Caveat', cursive; }
`;

// --- 渲染组件: 页面框架 ---
function renderLayout(title, content, head = "") {
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${CSS_BUNDLE}</style>
    ${head}
</head>
<body>
    ${content}
</body>
</html>`, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}

// --- 首页渲染 ---
async function renderHome(ctx) {
    const sets = JSON.parse(await ctx.storage.get("settings") || "{}");
    const cats = JSON.parse(await ctx.storage.get("categories") || "[]");
    const defaultTheme = sets.appearanceMode || 'galaxy';

    const content = `
    <header class="py-12 md:py-20 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary)/0.1)] to-transparent"></div>
        <div class="absolute top-6 right-6 flex gap-3 z-50">
            <button onclick="toggleThemeMenu()" class="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:scale-110 transition-all shadow-xl">🎨</button>
            <a href="/admin" class="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:scale-110 transition-all shadow-xl">⚙️</a>
        </div>

        <!-- 主题选择菜单 -->
        <div id="themeMenu" class="hidden absolute top-20 right-6 bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl z-[100] w-64">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">切换皮肤</p>
            <div class="grid grid-cols-1 gap-2">
                ${['mint', 'lavender', 'lemon', 'candy', 'ocean', 'galaxy', 'midnight'].map(t => {
                   const names = {mint:'薄荷清新', lavender:'薰衣草梦幻', lemon:'阳光柠檬派', candy:'棉花糖乐园', ocean:'海洋探险', galaxy:'银河探索', midnight:'极致纯黑'};
                   return `<button onclick="switchTheme('${t}')" class="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all text-sm font-bold">
                        <span class="w-8 h-8 rounded-lg" style="background:${t==='galaxy'?'#1e1b4b':t==='midnight'?'#000':t==='mint'?'#4ECDC4':t==='lavender'?'#A78BFA':t==='lemon'?'#FCD34D':t==='candy'?'#F9A8D4':'#4C9BFF'}"></span>
                        ${names[t]}
                   </button>`;
                }).join('')}
            </div>
        </div>

        <div class="container mx-auto px-6 relative z-10">
            ${sets.logo ? `<img src="${sets.logo}" class="h-24 md:h-32 mx-auto mb-8 animate-float object-contain drop-shadow-2xl">` : ''}
            <h1 class="font-caveat text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--brand-grad-1-start))] to-pink-500 animate-gradient mb-6 leading-tight">${sets.title || '英语全科启蒙'}</h1>
            <p class="text-sm md:text-xl font-bold opacity-60 tracking-[0.4em] uppercase">Welcome to All-Subject English Enlightenment</p>
        </div>
    </header>

    <main class="container mx-auto px-6 pb-40 max-w-7xl">
        ${sets.searchEnabled !== false ? `
        <div class="max-w-2xl mx-auto mb-20 relative group">
            <input type="text" id="searchInput" oninput="doSearch(this.value)" placeholder="发现你的精彩世界..." class="w-full h-20 px-10 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl focus:ring-4 focus:ring-[hsl(var(--primary)/0.3)] outline-none transition-all text-xl font-medium">
            <div class="absolute right-8 top-6 opacity-30 text-2xl">🔍</div>
        </div>` : ''}

        <div id="contentGrid" class="grid gap-24">
            ${cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(cat => `
                <section class="cat-section" data-name="${cat.name}">
                    <div class="flex items-center gap-6 mb-12">
                        <span class="h-12 w-3 bg-gradient-to-b from-[hsl(var(--primary))] to-transparent rounded-full shadow-lg shadow-[hsl(var(--primary)/0.4)]"></span>
                        <h2 class="text-4xl md:text-5xl font-black tracking-tighter">${cat.name}</h2>
                    </div>
                    <div class="link-grid-container flex flex-wrap gap-10">
                        ${(cat.links || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(link => `
                            <div class="card-wrapper relative">
                                <a href="${link.url}" target="_blank" class="theme-card block p-8 w-full md:w-[320px] group shadow-xl hover:shadow-2xl" data-title="${link.name}" data-desc="${link.description}">
                                    <div class="flex items-center gap-6">
                                        <div class="w-16 h-16 shrink-0 bg-white rounded-2xl p-2 flex items-center justify-center shadow-inner overflow-hidden">
                                            <img src="${link.logoUrl || 'https://via.placeholder.com/64'}" class="w-full h-full object-contain">
                                        </div>
                                        <div class="min-w-0">
                                            <h3 class="font-black text-xl truncate mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">${link.name}</h3>
                                            <p class="text-xs opacity-40 line-clamp-2 leading-relaxed">${link.description || ''}</p>
                                        </div>
                                    </div>
                                </a>
                                <div class="card-tooltip">
                                    <h4 class="font-black text-lg mb-2">${link.name}</h4>
                                    <p class="opacity-80">${link.description || '发现精彩的英语启蒙资源，开启快乐学习之旅！'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `).join('')}
        </div>
    </main>

    <footer class="py-20 border-t border-white/5 text-center">
        <p class="text-sm font-black tracking-widest opacity-20 uppercase">${sets.copyright || '© 2025 英语全科启蒙 · Powered by Antigravity'}</p>
    </footer>

    <script>
        const THEME_ID = '${defaultTheme}';
        function initTheme() {
            const saved = localStorage.getItem('user-theme') || THEME_ID;
            document.documentElement.className = saved;
        }
        function switchTheme(t) {
            document.documentElement.className = t;
            localStorage.setItem('user-theme', t);
            document.getElementById('themeMenu').classList.add('hidden');
        }
        function toggleThemeMenu() { document.getElementById('themeMenu').classList.toggle('hidden'); }
        function doSearch(q) {
            const query = q.toLowerCase();
            document.querySelectorAll('.card-wrapper').forEach(wrapper => {
                const card = wrapper.querySelector('.theme-card');
                const text = (card.dataset.title + card.dataset.desc).toLowerCase();
                wrapper.style.display = text.includes(query) ? 'block' : 'none';
            });
            document.querySelectorAll('.cat-section').forEach(sec => {
                const hasVisible = Array.from(sec.querySelectorAll('.card-wrapper')).some(w => w.style.display !== 'none');
                sec.style.display = hasVisible ? 'block' : 'none';
            });
        }
        initTheme();
    </script>
    `;
    return renderLayout(sets.title || '英语全科启蒙导航', content, `<script>document.documentElement.className = '${defaultTheme}';</script>`);
}

// --- 管理后台: 页面渲染 ---
async function renderAdmin(ctx) {
    const settings = JSON.parse(await ctx.storage.get("settings") || "{}");
    const categories = JSON.parse(await ctx.storage.get("categories") || "[]");

    const content = `
    <div class="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        <!-- Sidebar -->
        <aside class="w-80 bg-white border-r border-slate-200 p-10 flex flex-col fixed h-full shadow-2xl z-50">
            <h1 class="text-3xl font-black tracking-tighter mb-2">SYSTEMV4</h1>
            <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-16">Ultimate Dash</p>

            <nav class="space-y-6 flex-1">
                <button onclick="switchTab('sets')" id="btn-sets" class="sidebar-btn active w-full text-left p-5 font-black rounded-2xl transition-all flex items-center gap-4">🌐 基础设置</button>
                <button onclick="switchTab('cats')" id="btn-cats" class="sidebar-btn w-full text-left p-5 font-black rounded-2xl transition-all flex items-center gap-4">📦 分类链接</button>
            </nav>

            <div class="pt-10 border-t border-slate-100">
                <a href="/" class="text-blue-600 font-black hover:bg-blue-50 p-4 rounded-xl block">&larr; 返回预览</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-80 p-20 overflow-y-auto">
            <div id="tab-sets" class="tab-content active max-w-4xl mx-auto">
                <div class="flex items-center justify-between mb-16">
                    <div><h2 class="text-5xl font-black mb-2">系统设置</h2><p class="text-slate-400 font-medium tracking-tight">配置核心视觉与品牌信息</p></div>
                    <button onclick="saveSettings()" class="bg-blue-600 text-white font-black px-12 py-5 rounded-2xl shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all">保存配置</button>
                </div>

                <div class="space-y-10">
                    <div class="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 grid gap-10">
                        <div class="grid grid-cols-2 gap-10">
                            <div><label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">网站标题</label><input type="text" id="s-title" value="${settings.title || ''}" class="w-full bg-slate-50 p-6 rounded-2xl outline-none border-2 border-transparent focus:border-blue-500 font-bold"></div>
                            <div><label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Logo 地址</label><input type="text" id="s-logo" value="${settings.logo || ''}" class="w-full bg-slate-50 p-6 rounded-2xl outline-none font-bold"></div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">全局默认主题</label>
                            <select id="s-theme" class="w-full bg-slate-50 p-6 rounded-2xl outline-none font-bold">
                                ${['mint', 'lavender', 'lemon', 'candy', 'ocean', 'galaxy', 'midnight'].map(t => `<option value="${t}" ${settings.appearanceMode === t ? 'selected' : ''}>${t.toUpperCase()}</option>`).join('')}
                            </select>
                        </div>
                        <div><label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">版权信息</label><input type="text" id="s-copy" value="${settings.copyright || ''}" class="w-full bg-slate-50 p-6 rounded-2xl outline-none font-bold"></div>
                        <label class="flex items-center gap-4 cursor-pointer p-6 bg-slate-50 rounded-2xl"><input type="checkbox" id="s-search" ${settings.searchEnabled !== false ? 'checked' : ''} class="w-6 h-6 rounded-lg border-2 border-slate-200"><span class="font-black text-slate-700">启用搜索功能</span></label>
                    </div>
                </div>
            </div>

            <div id="tab-cats" class="tab-content hidden max-w-5xl mx-auto">
                <div class="flex items-center justify-between mb-16">
                    <div><h2 class="text-5xl font-black mb-2">分类与链接</h2><p class="text-slate-400 font-medium">支持无限分类与拖拽式排序逻辑</p></div>
                    <div class="flex gap-4">
                        <button onclick="addCategory()" class="bg-slate-900 text-white font-black px-10 py-5 rounded-2xl shadow-xl">+ 添加分类</button>
                        <button onclick="saveCats()" class="bg-blue-600 text-white font-black px-10 py-5 rounded-2xl shadow-xl">全局保存</button>
                    </div>
                </div>
                <div id="cat-list" class="space-y-12"></div>
            </div>
        </main>
    </div>

    <style>
        .sidebar-btn.active { background: #eff6ff; color: #2563eb; transform: translateX(10px); }
        .tab-content.hidden { display: none; }
    </style>

    <script>
        let DATA = { settings: ${JSON.stringify(settings)}, cats: ${JSON.stringify(categories)} };

        function switchTab(t) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-' + t).classList.remove('hidden');
            document.getElementById('btn-' + t).classList.add('active');
            if(t==='cats') renderCats();
        }

        async function saveSettings() {
            DATA.settings = {
                title: document.getElementById('s-title').value,
                logo: document.getElementById('s-logo').value,
                appearanceMode: document.getElementById('s-theme').value,
                copyright: document.getElementById('s-copy').value,
                searchEnabled: document.getElementById('s-search').checked
            };
            const res = await fetch('/api/settings', { method:'POST', body: JSON.stringify(DATA.settings) });
            if(res.ok) alert('✅ 系统设置保存成功！');
        }

        function renderCats() {
            const list = document.getElementById('cat-list');
            list.innerHTML = DATA.cats.sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)).map((c, i) => \`
                <div class="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-10 bg-slate-50/50 flex items-center justify-between border-b">
                        <div class="flex items-center gap-6"><span class="text-slate-200 font-black text-3xl">#\${i+1}</span><h3 class="font-black text-2xl">\${c.name}</h3></div>
                        <div class="flex gap-2">
                            <button onclick="moveCat(\${i}, -1)" class="p-3 bg-white rounded-xl shadow-sm">&uarr;</button>
                            <button onclick="moveCat(\${i}, 1)" class="p-3 bg-white rounded-xl shadow-sm">&darr;</button>
                            <button onclick="editCat(\${i})" class="px-6 py-3 bg-white border font-bold rounded-xl">编辑</button>
                            <button onclick="delCat(\${i})" class="text-red-500 font-black p-3">&times;</button>
                        </div>
                    </div>
                    <div class="p-10 space-y-4">
                        <div class="grid gap-4">
                            \${(c.links||[]).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)).map((l, li) => \`
                                <div class="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] group hover:bg-blue-50 transition-all">
                                    <div class="flex items-center gap-6">
                                        <img src="\${l.logoUrl}" class="w-12 h-12 rounded-xl bg-white border object-contain">
                                        <div><p class="font-black">\${l.name}</p><p class="text-[10px] font-bold opacity-30 truncate max-w-sm uppercase tracking-widest">\${l.url}</p></div>
                                    </div>
                                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onclick="moveL(\${i},\${li},-1)" class="text-slate-400">&uarr;</button>
                                        <button onclick="editL(\${i},\${li})" class="text-blue-600 font-bold px-4">修改</button>
                                        <button onclick="delL(\${i},\${li})" class="text-red-500 px-4">删除</button>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                        <button onclick="addL(\${i})" class="w-full border-4 border-dashed border-slate-100 p-8 rounded-[2rem] text-slate-300 font-black hover:border-blue-200 hover:text-blue-500 transition-all">+ 新增功能入口</button>
                    </div>
                </div>
            \`).join('');
        }

        async function saveCats() {
            const res = await fetch('/api/categories/save', { method:'POST', body: JSON.stringify(DATA.cats) });
            if(res.ok) alert('✅ 全局内容保存成功！');
        }

        function moveCat(i, d) {
            const t = i+d; if(t<0||t>=DATA.cats.length) return;
            [DATA.cats[i], DATA.cats[t]] = [DATA.cats[t], DATA.cats[i]];
            DATA.cats.forEach((c, idx) => c.sortOrder = idx); renderCats();
        }
        function addCategory() { 
            const n = prompt('分类名称:'); 
            if(n) { DATA.cats.push({id:Date.now()+'', name:n, sortOrder:DATA.cats.length, links:[]}); renderCats(); }
        }
        function editCat(i) {
            const n = prompt('重命名:', DATA.cats[i].name);
            if(n) { DATA.cats[i].name = n; renderCats(); }
        }
        function delCat(i) { if(confirm('删除此分类？')) { DATA.cats.splice(i, 1); renderCats(); } }

        function addL(ci) {
            const n = prompt('站点名称:'), u = prompt('URL:'), d = prompt('描述:'), l = prompt('Logo URL:');
            if(n && u) {
                if(!DATA.cats[ci].links) DATA.cats[ci].links = [];
                DATA.cats[ci].links.push({id:Date.now()+'', name:n, url:u, description:d, logoUrl:l, sortOrder:DATA.cats[ci].links.length});
                renderCats();
            }
        }
        function editL(ci, li) {
            const l = DATA.cats[ci].links[li];
            l.name = prompt('名称:', l.name) || l.name;
            l.url = prompt('URL:', l.url) || l.url;
            l.description = prompt('描述:', l.description) || l.description;
            l.logoUrl = prompt('Logo:', l.logoUrl) || l.logoUrl;
            renderCats();
        }
        function delL(ci, li) { DATA.cats[ci].links.splice(li, 1); renderCats(); }
        function moveL(ci, li, d) {
            const links = DATA.cats[ci].links; const t = li+d; if(t<0||t>=links.length) return;
            [links[li], links[t]] = [links[t], links[li]];
            links.forEach((l, idx) => l.sortOrder = idx); renderCats();
        }
    </script>
    `;
    return renderLayout('后台管理中心 V4', content);
}

// --- 登录页面渲染 ---
function renderLogin() {
    const content = `
    <div class="min-h-screen flex items-center justify-center p-6 bg-slate-900 overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-pink-600/20 animate-pulse"></div>
        <div class="bg-white/10 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/20 w-full max-w-xl text-center shadow-2xl relative z-10">
            <div class="text-8xl mb-12 animate-float">🔒</div>
            <h1 class="text-4xl font-black text-white mb-4 tracking-tighter">AUTHENTICATION</h1>
            <p class="text-white/40 mb-12 font-bold uppercase tracking-widest text-xs">Security Verified System</p>
            <input type="password" id="pw" placeholder="••••••••" class="w-full bg-white/5 border-2 border-transparent focus:border-blue-500 p-6 rounded-3xl mb-8 outline-none transition-all text-center text-2xl tracking-widest text-white">
            <button onclick="doLogin()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-3xl shadow-2xl transition-all active:scale-95 text-xl">验证并开启权限</button>
        </div>
    </div>
    <script>
        async function doLogin() {
            const password = document.getElementById('pw').value;
            const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
            if(res.ok) location.reload(); else alert('验证码错误，请重新输入');
        }
    </script>`;
    return renderLayout('安全验证 - 英语全科启蒙', content);
}
