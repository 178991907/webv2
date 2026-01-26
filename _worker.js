/**
 * 英语全科启蒙导航 - Cloudflare Worker v3.0.2
 * 特性：7 儿童友好主题 (薄荷/薰衣草/柠檬/棉花糖/海洋/银河/极致纯黑)
 *       大号卡片 Logo (64px)、Tooltip 布局偏移、聚光灯聚焦、本地主题持久化
 *       v3.0 优化：悬浮框文字显示优化 (通用暗色模式)
 *       v3.0.2: 组件级修复确保所有主题下完美显示
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
            if (path === "/api/seed" && request.method === "POST") {
                const data = await request.json();
                if (data.settings) await storage.put("settings", JSON.stringify(data.settings));
                if (data.categories) await storage.put("categories", JSON.stringify(data.categories));
                return Response.json({ success: true });
            }

            return new Response("Not Found", { status: 404 });
        } catch (err) {
            return new Response(`Worker Fatal Error: ${err.message}`, { status: 500 });
        }
    }
};

// --- 鉴权与登录 ---
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

function renderLogin() {
    return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>登录管理后台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { background: radial-gradient(circle at top right, #f8fafc, #e2e8f0); }</style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white w-full max-w-md text-center">
        <div class="text-6xl mb-8">🔐</div>
        <h1 class="text-3xl font-black text-slate-900 mb-2">安全验证</h1>
        <p class="text-slate-500 mb-10 font-medium">请输入管理员密码访问系统</p>
        <input type="password" id="pw" placeholder="••••••••" class="w-full bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white p-5 rounded-3xl mb-6 outline-none transition-all text-center text-xl tracking-widest">
        <button onclick="doLogin()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl hover:shadow-blue-200 transition-all active:scale-95">验证并进入</button>
    </div>
    <script>
        async function doLogin() {
            const password = document.getElementById('pw').value;
            const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
            if(res.ok) location.reload(); else alert('密码错误');
        }
    </script>
</body>
</html>`, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}

// --- 样式定义 (v2.0 儿童友好主题) ---
const CSS_BUNDLE = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;700;900&display=swap');

  :root {
    /* 默认银河主题 */
    --background: 265 48% 10%;
    --foreground: 210 40% 98%;
    --card: 265 48% 13%;
    --card-foreground: 210 40% 98%;
    --primary: 265 89% 78%;
    --primary-foreground: 265 48% 10%;
    --border: 265 48% 25%;
    --radius: 1.5rem;
  }

  /* 7 儿童友好主题 */
  .mint {
    --background: 200 60% 98%; --foreground: 218 23% 23%;
    --card: 0 0% 100%; --card-foreground: 218 23% 23%;
    --primary: 176 56% 55%; --primary-foreground: 0 0% 100%;
    --border: 176 56% 90%;
  }
  .lavender {
    --background: 255 100% 99%; --foreground: 247 17% 22%;
    --card: 0 0% 100%; --card-foreground: 247 17% 22%;
    --primary: 255 92% 76%; --primary-foreground: 255 40% 20%;
    --border: 255 92% 92%;
  }
  .lemon {
    --background: 45 100% 97%; --foreground: 30 35% 18%;
    --card: 0 0% 100%; --card-foreground: 30 35% 18%;
    --primary: 45 96% 64%; --primary-foreground: 30 40% 15%;
    --border: 45 96% 90%;
  }
  .candy {
    --background: 333 60% 98%; --foreground: 325 25% 23%;
    --card: 0 0% 100%; --card-foreground: 325 25% 23%;
    --primary: 329 81% 81%; --primary-foreground: 325 40% 20%;
    --border: 329 81% 92%;
  }
  .ocean {
    --background: 204 100% 97%; --foreground: 213 52% 25%;
    --card: 0 0% 100%; --card-foreground: 213 52% 25%;
    --primary: 214 100% 65%; --primary-foreground: 0 0% 100%;
    --border: 214 100% 90%;
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
    font-family: 'Inter', system-ui, sans-serif;
    background: hsl(var(--background));
    color: hsl(var(--foreground));
    transition: background 0.4s ease, color 0.4s ease;
  }

  .font-caveat { font-family: 'Caveat', cursive; }

  /* 卡片样式 */
  .theme-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* 聚光灯聚焦效果 */
  .link-grid-container:has(.theme-card:hover) .theme-card:not(:hover) {
    transform: scale(0.95);
    opacity: 0.5;
    filter: blur(1px) grayscale(30%);
  }
  .theme-card:hover {
    transform: scale(1.05) translateY(-5px);
    z-index: 20;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
  }

  /* 布局偏移 (为 Tooltip 留空间) */
  .link-grid-container .card-wrapper {
    transition: margin-right 0.3s ease;
  }
  .link-grid-container .card-wrapper:hover {
    margin-right: 220px;
  }

  /* Tooltip 样式 - v3.0 优化: 强制暗色模式以确保清晰度 */
  .card-tooltip {
    position: absolute;
    right: -210px;
    top: 0;
    width: 200px;
    background: #1e1b4b; /* 强制使用深色背景 (银河主题色) */
    color: #ffffff;      /* 强制白色文字 */
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
    padding: 1rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 50;
  }
  .card-tooltip h4 {
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .card-tooltip p {
    color: rgba(255,255,255,0.9);
    font-size: 0.875rem;
    line-height: 1.4;
  }
  .card-wrapper:hover .card-tooltip {
    opacity: 1;
  }

  /* Logo 容器 */
  .logo-container {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #3b2667, #6b3fa0);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(107, 63, 160, 0.3);
  }
  .logo-inner {
    width: 48px;
    height: 48px;
    background: white;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .logo-inner img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* 动画 */
  .animate-float { animation: float 4s ease-in-out infinite; }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
`;

// --- 主题切换器 JS ---
const THEME_SWITCHER_JS = `
  const THEMES = [
    { id: 'mint', name: '薄荷清新', color: '#4ECDC4' },
    { id: 'lavender', name: '薰衣草梦幻', color: '#A78BFA' },
    { id: 'lemon', name: '阳光柠檬派', color: '#FCD34D' },
    { id: 'candy', name: '棉花糖乐园', color: '#F9A8D4' },
    { id: 'ocean', name: '海洋探险', color: '#4C9BFF' },
    { id: 'galaxy', name: '银河探索', color: '#1e1b4b' },
    { id: 'midnight', name: '极致纯黑', color: '#000000' }
  ];

  function initTheme() {
    const saved = localStorage.getItem('user-theme');
    if (saved) {
      document.documentElement.className = saved;
    }
  }

  function switchTheme(themeId) {
    document.documentElement.className = themeId;
    localStorage.setItem('user-theme', themeId);
    updateThemeUI();
  }

  function updateThemeUI() {
    const current = document.documentElement.className || 'galaxy';
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('ring-2', btn.dataset.theme === current);
      btn.classList.toggle('ring-white', btn.dataset.theme === current);
    });
  }

  function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('hidden');
  }

  initTheme();
`;

// --- 首页渲染 ---
async function renderHome(ctx) {
    const sets = JSON.parse(await ctx.storage.get("settings") || "{}");
    const cats = JSON.parse(await ctx.storage.get("categories") || "[]");
    const defaultTheme = sets.appearanceMode || 'galaxy';

    const html = `
<!DOCTYPE html>
<html lang="zh-CN" class="${defaultTheme}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sets.title || '英语全科启蒙导航'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${CSS_BUNDLE}</style>
</head>
<body class="min-h-screen">
    <!-- Header -->
    <header class="pt-16 pb-12 text-center container mx-auto px-6 relative">
        <!-- Theme Switcher -->
        <div class="absolute top-4 right-4 flex gap-2">
            <button onclick="toggleThemeMenu()" class="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            </button>
            <a href="/admin" class="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all">⚙️</a>
        </div>

        <!-- Theme Menu -->
        <div id="themeMenu" class="hidden absolute top-16 right-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 z-50">
            <p class="text-xs font-bold opacity-50 mb-3 uppercase tracking-wider">选择主题</p>
            <div class="grid grid-cols-4 gap-2">
                ${['mint', 'lavender', 'lemon', 'candy', 'ocean', 'galaxy', 'midnight'].map(t => `
                    <button onclick="switchTheme('${t}')" data-theme="${t}" class="theme-btn w-10 h-10 rounded-xl transition-all" style="background: ${t === 'galaxy' ? '#1e1b4b' : t === 'midnight' ? '#000' : t === 'mint' ? '#4ECDC4' : t === 'lavender' ? '#A78BFA' : t === 'lemon' ? '#FCD34D' : t === 'candy' ? '#F9A8D4' : '#4C9BFF'}"></button>
                `).join('')}
            </div>
        </div>

        ${sets.logo ? `<img src="${sets.logo}" class="h-24 mx-auto mb-8 animate-float object-contain drop-shadow-2xl">` : ''}
        <h1 class="font-caveat text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[hsl(var(--primary))] to-pink-500 mb-4">${sets.title || '英语全科启蒙'}</h1>
        <p class="text-sm opacity-50 font-bold tracking-[0.3em] uppercase">Welcome to All-Subject English Enlightenment</p>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 pb-32 max-w-7xl">
        ${sets.searchEnabled !== false ? `
        <div class="max-w-2xl mx-auto mb-16 relative group">
            <input type="text" id="searchInput" oninput="doSearch(this.value)" placeholder="发现精彩资源..." class="w-full h-16 px-8 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-xl focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none transition-all text-lg">
            <div class="absolute right-6 top-5 opacity-30">🔍</div>
        </div>` : ''}

        <div id="contentGrid" class="space-y-24">
            ${cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(cat => `
                <section class="cat-section" data-name="${cat.name}">
                    <div class="flex items-center gap-4 mb-8">
                        <span class="h-10 w-2 bg-gradient-to-b from-[hsl(var(--primary))] to-transparent rounded-full"></span>
                        <h2 class="text-4xl font-black tracking-tight">${cat.name}</h2>
                    </div>
                    <div class="link-grid-container flex flex-wrap gap-6">
                        ${(cat.links || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(link => `
                            <div class="card-wrapper relative">
                                <a href="${link.url}" target="_blank" class="theme-card link-card block p-6 w-[280px] hover:shadow-2xl" data-title="${link.name}" data-desc="${link.description}">
                                    <div class="flex items-center gap-4">
                                        <div class="logo-container shrink-0">
                                            <div class="logo-inner">
                                                <img src="${link.logoUrl || 'https://via.placeholder.com/64'}" alt="${link.name}">
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <h3 class="font-bold text-lg truncate mb-1">${link.name}</h3>
                                            <p class="text-xs opacity-50 line-clamp-2">${link.description || ''}</p>
                                        </div>
                                    </div>
                                </a>
                                <div class="card-tooltip">
                                    <h4 class="font-bold">${link.name}</h4>
                                    <p>${link.description || '暂无描述'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `).join('')}
        </div>
    </main>

    <footer class="py-16 border-t border-[hsl(var(--border))] text-center opacity-30">
        <p class="text-sm font-bold">${sets.copyright || '© 2025 英语全科启蒙'}</p>
    </footer>

    <script>
        ${THEME_SWITCHER_JS}

        function doSearch(q) {
            const query = q.toLowerCase();
            document.querySelectorAll('.link-card').forEach(card => {
                const text = (card.dataset.title + card.dataset.desc).toLowerCase();
                const match = text.includes(query);
                card.closest('.card-wrapper').style.display = match ? 'block' : 'none';
            });
            document.querySelectorAll('.cat-section').forEach(sec => {
                const hasVisible = sec.querySelectorAll('.card-wrapper[style*="block"], .card-wrapper:not([style])').length > 0;
                sec.style.display = hasVisible ? 'block' : 'none';
            });
        }

        // Update theme UI on load
        setTimeout(updateThemeUI, 100);
    </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}

// --- 管理后台 ---
async function renderAdmin(ctx) {
    const settings = JSON.parse(await ctx.storage.get("settings") || "{}");
    const categories = JSON.parse(await ctx.storage.get("categories") || "[]");

    const THEMES = [
        { id: 'mint', name: '薄荷清新' },
        { id: 'lavender', name: '薰衣草梦幻' },
        { id: 'lemon', name: '阳光柠檬派' },
        { id: 'candy', name: '棉花糖乐园' },
        { id: 'ocean', name: '海洋探险' },
        { id: 'galaxy', name: '银河探索' },
        { id: 'midnight', name: '极致纯黑' }
    ];

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>系统管理后台 v3.0.2</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .sidebar-btn.active { background: #eff6ff; color: #2563eb; border-right: 4px solid #2563eb; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
    </style>
</head>
<body class="bg-slate-50 font-sans">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-72 bg-white border-r border-slate-200 p-8 flex flex-col pt-12">
            <h1 class="text-2xl font-black mb-2 tracking-tighter">DASHBOARD</h1>
            <p class="text-xs text-slate-400 mb-12">v3.0.2 - 儿童友好版</p>
            <nav class="space-y-4 flex-1">
                <button onclick="switchTab('sets')" id="btn-sets" class="sidebar-btn active w-full text-left p-4 font-bold rounded-xl transition-all">🌐 基础设置</button>
                <button onclick="switchTab('cats')" id="btn-cats" class="sidebar-btn w-full text-left p-4 font-bold rounded-xl transition-all">📦 分类与链接</button>
            </nav>
            <div class="pt-8 border-t"><a href="/" class="text-blue-600 font-bold hover:underline">&larr; 返回预览</a></div>
        </aside>

        <!-- Main -->
        <main class="flex-1 p-16 overflow-y-auto">
            <!-- Settings Tab -->
            <div id="tab-sets" class="tab-content active mx-auto max-w-4xl">
                <div class="flex items-center justify-between mb-12">
                    <h2 class="text-4xl font-black">系统设置</h2>
                    <button onclick="saveGlobalSettings()" class="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">立即保存</button>
                </div>
                <div class="grid gap-10">
                    <div class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-8">
                        <div class="grid grid-cols-2 gap-8">
                            <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">网站标题</label><input type="text" id="s-title" value="${settings.title || ''}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-blue-200"></div>
                            <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">Logo 地址</label><input type="text" id="s-logo" value="${settings.logo || ''}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none"></div>
                        </div>
                        <div>
                            <label class="block text-xs font-black text-slate-400 uppercase mb-3">默认主题 (新用户)</label>
                            <select id="s-appearance" class="w-full bg-slate-50 p-5 rounded-2xl outline-none">
                                ${THEMES.map(t => `<option value="${t.id}" ${settings.appearanceMode === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                            </select>
                        </div>
                        <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">版权声明</label><input type="text" id="s-copy" value="${settings.copyright || ''}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none"></div>
                        <div class="flex items-center gap-4"><input type="checkbox" id="s-search" ${settings.searchEnabled !== false ? 'checked' : ''} class="w-6 h-6"><label for="s-search" class="font-bold">开启搜索功能</label></div>
                    </div>
                </div>
            </div>

            <!-- Categories Tab -->
            <div id="tab-cats" class="tab-content mx-auto max-w-5xl">
                <div class="flex items-center justify-between mb-12">
                    <div><h2 class="text-4xl font-black mb-2">分类与链接管理</h2><p class="text-slate-400 font-medium">支持排序、编辑、删除操作</p></div>
                    <div class="flex gap-4">
                        <button onclick="addCategory()" class="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl">添加分类</button>
                        <button onclick="saveCategories()" class="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl">保存所有更改</button>
                    </div>
                </div>
                <div id="categoryContainer" class="space-y-8"></div>
            </div>
        </main>
    </div>

    <script>
        let appData = {
            settings: ${JSON.stringify(settings)},
            categories: ${JSON.stringify(categories)}
        };

        function switchTab(t) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('tab-' + t).classList.add('active');
            document.getElementById('btn-' + t).classList.add('active');
            if(t === 'cats') renderCategories();
        }

        async function saveGlobalSettings() {
            appData.settings = {
                title: document.getElementById('s-title').value,
                logo: document.getElementById('s-logo').value,
                appearanceMode: document.getElementById('s-appearance').value,
                copyright: document.getElementById('s-copy').value,
                searchEnabled: document.getElementById('s-search').checked
            };
            const res = await fetch('/api/settings', { method: 'POST', body: JSON.stringify(appData.settings) });
            if(res.ok) alert('✅ 网站设置已成功保存！');
        }

        function renderCategories() {
            const container = document.getElementById('categoryContainer');
            container.innerHTML = appData.categories.sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)).map((c, i) => \`
                <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                    <div class="p-8 flex items-center justify-between bg-slate-50/50">
                        <div class="flex items-center gap-4">
                            <span class="text-slate-300 font-black text-2xl">#\${i+1}</span>
                            <span class="font-black text-xl">\${c.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="moveCat(\${i}, -1)" class="p-3 hover:bg-white rounded-xl">&uarr;</button>
                            <button onclick="moveCat(\${i}, 1)" class="p-3 hover:bg-white rounded-xl">&darr;</button>
                            <button onclick="editCat(\${i})" class="bg-white border text-sm font-bold px-4 py-2 rounded-xl">编辑</button>
                            <button onclick="deleteCat(\${i})" class="text-red-500 font-bold px-4 py-2">&times;</button>
                        </div>
                    </div>
                    <div class="p-8 space-y-4">
                        <div class="grid grid-cols-1 gap-4">
                            \${(c.links||[]).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)).map((l, li) => \`
                                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div class="flex items-center gap-4 overflow-hidden">
                                        <img src="\${l.logoUrl}" class="w-10 h-10 rounded-lg bg-white border object-contain">
                                        <div class="truncate"><p class="font-bold">\${l.name}</p><p class="text-xs opacity-40 truncate">\${l.url}</p></div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button onclick="moveLink(\${i}, \${li}, -1)" class="text-slate-400">&uarr;</button>
                                        <button onclick="moveLink(\${i}, \${li}, 1)" class="text-slate-400">&darr;</button>
                                        <button onclick="editLink(\${i}, \${li})" class="text-blue-600 text-xs font-bold px-2">修改</button>
                                        <button onclick="deleteLink(\${i}, \${li})" class="text-red-500 text-xs px-2">删除</button>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                        <button onclick="addLink(\${i})" class="w-full border-2 border-dashed border-slate-200 p-4 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all">+ 新增链接</button>
                    </div>
                </div>
            \`).join('');
        }

        async function saveCategories() {
            const res = await fetch('/api/categories/save', { method: 'POST', body: JSON.stringify(appData.categories) });
            if(res.ok) alert('✅ 所有内容更改已保存！');
        }

        function moveCat(i, d) {
            const target = i + d;
            if(target < 0 || target >= appData.categories.length) return;
            [appData.categories[i], appData.categories[target]] = [appData.categories[target], appData.categories[i]];
            appData.categories.forEach((c, idx) => c.sortOrder = idx);
            renderCategories();
        }

        function moveLink(ci, li, d) {
            const links = appData.categories[ci].links || [];
            const target = li + d;
            if(target < 0 || target >= links.length) return;
            [links[li], links[target]] = [links[target], links[li]];
            links.forEach((l, idx) => l.sortOrder = idx);
            renderCategories();
        }

        function addCategory() {
            const name = prompt('输入分类名称:');
            if(name) { appData.categories.push({ id: Date.now().toString(), name, sortOrder: appData.categories.length, links: [] }); renderCategories(); }
        }
        function deleteCat(i) { if(confirm('确定删除此分类？')) { appData.categories.splice(i, 1); renderCategories(); } }
        function editCat(i) { 
            const name = prompt('重命名为:', appData.categories[i].name);
            if(name) { appData.categories[i].name = name; renderCategories(); }
        }

        function addLink(ci) {
            const name = prompt('网站名称:');
            const url = prompt('URL:');
            const desc = prompt('描述:');
            const logo = prompt('Logo URL:');
            if(name && url) {
                if(!appData.categories[ci].links) appData.categories[ci].links = [];
                appData.categories[ci].links.push({ id: Date.now().toString(), name, url, description: desc, logoUrl: logo, sortOrder: appData.categories[ci].links.length });
                renderCategories();
            }
        }
        function deleteLink(ci, li) { appData.categories[ci].links.splice(li, 1); renderCategories(); }
        function editLink(ci, li) {
            const l = appData.categories[ci].links[li];
            l.name = prompt('名称:', l.name) || l.name;
            l.url = prompt('URL:', l.url) || l.url;
            l.description = prompt('描述:', l.description) || l.description;
            l.logoUrl = prompt('Logo:', l.logoUrl) || l.logoUrl;
            renderCategories();
        }
    </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
