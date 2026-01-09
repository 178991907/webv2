var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-D6Egld/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// _worker.js
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const storage = env.DB || env.KV;
    if (!storage) {
      return new Response("Configuration Error: KV binding (DB or KV) missing.", { status: 500 });
    }
    const ctx = { storage, env };
    try {
      if (path === "/" || path === "/index.html") return renderHome(ctx);
      if (path === "/api/login" && request.method === "POST") return handleLogin(request, env);
      const isAuthed = await checkAuth(request, env);
      if (!isAuthed && (path === "/admin" || path.startsWith("/api/"))) {
        if (path === "/admin") return renderLogin();
        return new Response("Unauthorized", { status: 401 });
      }
      if (path === "/admin") return renderAdmin(ctx);
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
async function checkAuth(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const password = env.ADMIN_PASSWORD || "admin";
  return cookie.includes(`session_token=${password}`);
}
__name(checkAuth, "checkAuth");
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
__name(handleLogin, "handleLogin");
function renderLogin() {
  return new Response(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>\u767B\u5F55\u7BA1\u7406\u540E\u53F0</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>body { background: radial-gradient(circle at top right, #f8fafc, #e2e8f0); }</style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white w-full max-w-md text-center">
        <div class="text-6xl mb-8">\u{1F510}</div>
        <h1 class="text-3xl font-black text-slate-900 mb-2">\u5B89\u5168\u9A8C\u8BC1</h1>
        <p class="text-slate-500 mb-10 font-medium">\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801\u8BBF\u95EE\u7CFB\u7EDF</p>
        <input type="password" id="pw" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="w-full bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white p-5 rounded-3xl mb-6 outline-none transition-all text-center text-xl tracking-widest">
        <button onclick="doLogin()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-3xl shadow-xl hover:shadow-blue-200 transition-all active:scale-95">\u9A8C\u8BC1\u5E76\u8FDB\u5165</button>
    </div>
    <script>
        async function doLogin() {
            const password = document.getElementById('pw').value;
            const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
            if(res.ok) location.reload(); else alert('\u5BC6\u7801\u9519\u8BEF');
        }
    <\/script>
</body>
</html>`, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(renderLogin, "renderLogin");
var CSS_BUNDLE = `
  :root {
    --background: 0 0% 100%; --foreground: 240 10% 3.9%;
    --card: 0 0% 100%; --card-foreground: 240 10% 3.9%;
    --border: 240 5.9% 90%; --primary: 221.2 83.2% 53.3%;
    --radius: 1rem; --primary-foreground: 210 40% 98%;
  }
  .dark {
    --background: 240 10% 3.9%; --foreground: 0 0% 98%;
    --card: 240 10% 3.9%; --card-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
  }
  /* \u914D\u8272\u65B9\u6848 */
  .theme-blue { --primary: 221.2 83.2% 53.3%; --primary-foreground: 210 40% 98%; }
  .theme-green { --primary: 142.1 76.2% 36.3%; --primary-foreground: 355.7 100% 97.3%; }
  .theme-purple { --primary: 262.1 83.3% 57.8%; --primary-foreground: 210 40% 98%; }
  .theme-orange { --primary: 24.6 95% 53.1%; --primary-foreground: 60 9.1% 97.8%; }
  .theme-pink { --primary: 346.8 77.2% 49.8%; --primary-foreground: 355.7 100% 97.3%; }
  .theme-slate { --primary: 215.4 16.3% 46.9%; --primary-foreground: 210 40% 98%; }

  /* \u5916\u89C2\u98CE\u683C */
  .appearance-glass { background: radial-gradient(circle at 0% 0%, #1a1b26, #09090b) fixed; color: #fff; --card: 0 0% 100% / 0.03; --border: 0 0% 100% / 0.08; }
  .appearance-glass .glass-card { backdrop-filter: blur(20px); background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  .appearance-paper { background: #fdfaf3; color: #2c2c2c; --card: 0 0% 100%; --border: 35 20% 88%; }
  .appearance-paper .glass-card { border: 1px solid #e2ddd0; box-shadow: 2px 2px 0px rgba(0,0,0,0.05); }
  .appearance-minimal { background: #fff; --radius: 0; --border: 240 5% 95%; }
  .appearance-minimal .glass-card { border: none; border-bottom: 1px solid #eee; box-shadow: none; background: transparent; }

  body { transition: background 0.4s ease; font-family: 'Inter', system-ui, sans-serif; }
  .font-caveat { font-family: 'Caveat', cursive; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
`;
async function renderHome(ctx) {
  const sets = JSON.parse(await ctx.storage.get("settings") || "{}");
  const cats = JSON.parse(await ctx.storage.get("categories") || "[]");
  const html = `
<!DOCTYPE html>
<html lang="zh-CN" class="${sets.theme || "theme-blue"} appearance-${sets.appearanceMode || "light"}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sets.title || "\u82F1\u8BED\u5BFC\u822A"}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>${CSS_BUNDLE}</style>
</head>
<body class="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen">
    <header class="pt-24 pb-16 text-center container mx-auto px-6 relative">
        <a href="/admin" class="absolute top-10 right-10 p-4 bg-white/5 backdrop-blur-2xl rounded-full border border-black/5 hover:scale-110 active:scale-90 transition-all shadow-xl">\u2699\uFE0F</a>
        ${sets.logo ? `<img src="${sets.logo}" class="h-32 mx-auto mb-10 animate-float object-contain drop-shadow-2xl">` : ""}
        <h1 class="font-caveat text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[hsl(var(--primary))] to-pink-500 mb-4">${sets.title || "\u82F1\u8BED\u542F\u8499"}</h1>
        <p class="text-slate-400 font-bold tracking-[0.5em] uppercase text-[10px] opacity-50">Discovery / Learning / Enlightenment</p>
    </header>

    <main class="container mx-auto px-6 pb-40 max-w-7xl">
        ${sets.searchEnabled !== false ? `
        <div class="max-w-2xl mx-auto mb-24 relative group">
            <input type="text" id="searchInput" oninput="doSearch(this.value)" placeholder="\u53D1\u73B0\u7CBE\u5F69\u8D44\u6E90..." class="w-full h-18 px-10 rounded-[2rem] bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] shadow-2xl focus:border-[hsl(var(--primary))] outline-none transition-all text-xl font-medium">
            <div class="absolute right-6 top-5 opacity-20 group-hover:opacity-100 transition-opacity">\u{1F50D}</div>
        </div>` : ""}

        <div id="contentGrid" class="space-y-32">
            ${cats.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => `
                <section class="cat-section" data-name="${cat.name}">
                    <div class="flex items-center gap-6 mb-12">
                        <span class="h-12 w-2.5 bg-gradient-to-b from-[hsl(var(--primary))] to-transparent rounded-full"></span>
                        <h2 class="text-5xl font-black tracking-tighter italic">${cat.name}</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${cat.links.sort((a, b) => a.sortOrder - b.sortOrder).map((link) => `
                            <a href="${link.url}" target="_blank" class="link-card glass-card group p-8 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 hover:-translate-y-3" data-title="${link.name}" data-desc="${link.description}">
                                <div class="flex items-center gap-5">
                                    <div class="w-20 h-20 shrink-0 rounded-3xl bg-white p-2.5 shadow-2xl border border-black/5 overflow-hidden group-hover:rotate-6 transition-transform">
                                        <img src="${link.logoUrl || "https://via.placeholder.com/100"}" class="w-full h-full object-contain">
                                    </div>
                                    <div class="min-w-0">
                                        <h3 class="font-black text-2xl group-hover:text-[hsl(var(--primary))] transition-colors truncate mb-1">${link.name}</h3>
                                        <p class="text-xs opacity-50 line-clamp-2 leading-relaxed font-medium">${link.description}</p>
                                    </div>
                                </div>
                            </a>
                        `).join("")}
                    </div>
                </section>
            `).join("")}
        </div>
    </main>

    <footer class="py-24 border-t border-[hsl(var(--border))] text-center opacity-20">
        <p class="text-sm font-black italic tracking-widest">${sets.copyright || "\xA9 2025 DAO HANG"}</p>
    </footer>

    <script>
        function doSearch(q) {
            const query = q.toLowerCase();
            document.querySelectorAll('.link-card').forEach(card => {
                const text = (card.dataset.title + card.dataset.desc).toLowerCase();
                const match = text.includes(query);
                card.style.display = match ? 'block' : 'none';
                card.classList.toggle('hidden', !match);
            });
            document.querySelectorAll('.cat-section').forEach(sec => {
                const hasVisible = sec.querySelectorAll('.link-card:not(.hidden)').length > 0;
                sec.style.display = hasVisible ? 'block' : 'none';
            });
        }
    <\/script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(renderHome, "renderHome");
async function renderAdmin(ctx) {
  const settings = JSON.parse(await ctx.storage.get("settings") || "{}");
  const categories = JSON.parse(await ctx.storage.get("categories") || "[]");
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>\u7CFB\u7EDF\u7BA1\u7406\u540E\u53F0</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
        .sidebar-btn.active { background: #eff6ff; color: #2563eb; border-right: 4px solid #2563eb; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .cat-item.collapsed .cat-links { display: none; }
    </style>
</head>
<body class="bg-slate-50 font-sans">
    <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-72 bg-white border-r border-slate-200 p-8 flex flex-col pt-12">
            <h1 class="text-2xl font-black mb-12 tracking-tighter">DASHBOARD</h1>
            <nav class="space-y-4 flex-1">
                <button onclick="switchTab('sets')" id="btn-sets" class="sidebar-btn active w-full text-left p-4 font-bold rounded-xl transition-all">\u{1F310} \u57FA\u7840\u8BBE\u7F6E</button>
                <button onclick="switchTab('cats')" id="btn-cats" class="sidebar-btn w-full text-left p-4 font-bold rounded-xl transition-all">\u{1F4E6} \u5206\u7C7B\u4E0E\u94FE\u63A5</button>
            </nav>
            <div class="pt-8 border-t"><a href="/" class="text-blue-600 font-bold hover:underline">&larr; \u8FD4\u56DE\u9884\u89C8</a></div>
        </aside>

        <!-- Main -->
        <main class="flex-1 p-16 overflow-y-auto">
            <!-- Settings Tab -->
            <div id="tab-sets" class="tab-content active mx-auto max-w-4xl">
                <div class="flex items-center justify-between mb-12">
                    <h2 class="text-4xl font-black">\u7CFB\u7EDF\u8BBE\u7F6E</h2>
                    <button onclick="saveGlobalSettings()" class="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">\u7ACB\u5373\u4FDD\u5B58</button>
                </div>
                <div class="grid gap-10">
                  <div class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-8">
                    <div class="grid grid-cols-2 gap-8">
                        <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">\u7F51\u7AD9\u6807\u9898</label><input type="text" id="s-title" value="${settings.title || ""}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none border-2 border-transparent focus:border-blue-200"></div>
                        <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">Logo \u5730\u5740</label><input type="text" id="s-logo" value="${settings.logo || ""}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-8">
                        <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">\u5916\u89C2\u98CE\u683C</label>
                            <select id="s-appearance" class="w-full bg-slate-50 p-5 rounded-2xl outline-none">
                                <option value="light" ${settings.appearanceMode === "light" ? "selected" : ""}>\u7CFB\u7EDF\u4EAE\u8272</option>
                                <option value="dark" ${settings.appearanceMode === "dark" ? "selected" : ""}>\u7CFB\u7EDF\u6697\u8272</option>
                                <option value="glass" ${settings.appearanceMode === "glass" ? "selected" : ""}>\u73BB\u7483\u62DF\u6001 (Glassmorphism)</option>
                                <option value="paper" ${settings.appearanceMode === "paper" ? "selected" : ""}>\u67D4\u548C\u7EB8\u5F20 (Paper)</option>
                                <option value="minimal" ${settings.appearanceMode === "minimal" ? "selected" : ""}>\u6781\u7B80\u4E13\u4E1A (Minimal)</option>
                            </select>
                        </div>
                        <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">\u54C1\u724C\u914D\u8272</label>
                            <select id="s-theme" class="w-full bg-slate-50 p-5 rounded-2xl outline-none">
                                <option value="theme-blue" ${settings.theme === "theme-blue" ? "selected" : ""}>\u7ECF\u5178\u84DD</option>
                                <option value="theme-green" ${settings.theme === "theme-green" ? "selected" : ""}>\u6E05\u65B0\u7EFF</option>
                                <option value="theme-purple" ${settings.theme === "theme-purple" ? "selected" : ""}>\u6781\u5BA2\u7D2B</option>
                                <option value="theme-orange" ${settings.theme === "theme-orange" ? "selected" : ""}>\u6D3B\u529B\u6A59</option>
                                <option value="theme-pink" ${settings.theme === "theme-pink" ? "selected" : ""}>\u6A31\u82B1\u7C89</option>
                                <option value="theme-slate" ${settings.theme === "theme-slate" ? "selected" : ""}>\u6DF1\u7A7A\u7070</option>
                            </select>
                        </div>
                    </div>
                    <div><label class="block text-xs font-black text-slate-400 uppercase mb-3">\u7248\u6743\u58F0\u660E</label><input type="text" id="s-copy" value="${settings.copyright || ""}" class="w-full bg-slate-50 p-5 rounded-2xl outline-none"></div>
                    <div class="flex items-center gap-4"><input type="checkbox" id="s-search" ${settings.searchEnabled !== false ? "checked" : ""} class="w-6 h-6"><label for="s-search" class="font-bold">\u5F00\u542F\u641C\u7D22\u529F\u80FD</label></div>
                  </div>
                  <div class="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 flex items-center justify-between">
                      <div><h3 class="font-black text-amber-900 text-xl mb-1">\u6570\u636E\u540C\u6B65</h3><p class="text-amber-700 text-sm">\u70B9\u51FB\u6309\u94AE\u4ECE\u8FC1\u79FB JSON \u6587\u4EF6\u4E2D\u6062\u590D\u6570\u636E\u3002</p></div>
                      <button onclick="syncData()" class="bg-amber-600 text-white font-bold px-8 py-3 rounded-2xl">\u7ACB\u5373\u540C\u6B65</button>
                  </div>
                </div>
            </div>

            <!-- Categories Tab (Full Link Manager Parity) -->
            <div id="tab-cats" class="tab-content mx-auto max-w-5xl">
                <div class="flex items-center justify-between mb-12">
                    <div><h2 class="text-4xl font-black mb-2">\u5206\u7C7B\u4E0E\u94FE\u63A5\u7BA1\u7406</h2><p class="text-slate-400 font-medium">\u62D6\u62FD\u6392\u5E8F\u4E0E\u5B9E\u65F6\u7F16\u8F91\u529F\u80FD\u5373\u5C06\u4E0A\u7EBF\uFF0C\u76EE\u524D\u652F\u6301\u7269\u7406\u6392\u5E8F\u548C\u7BA1\u7406\u3002</p></div>
                    <div class="flex gap-4">
                        <button onclick="addCategory()" class="bg-slate-900 text-white font-black px-8 py-4 rounded-2xl shadow-xl">\u6DFB\u52A0\u5206\u7C7B</button>
                        <button onclick="saveCategories()" class="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl">\u4FDD\u5B58\u6240\u6709\u66F4\u6539</button>
                    </div>
                </div>
                <div id="categoryContainer" class="space-y-8">
                    <!-- Dynamic Content -->
                </div>
            </div>
        </main>
    </div>

    <!-- Modals (Simple) -->
    <div id="modal" class="hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div id="modalBody" class="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-xl"></div>
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

        /* --- Settings Actions --- */
        async function saveGlobalSettings() {
            appData.settings = {
                title: document.getElementById('s-title').value,
                logo: document.getElementById('s-logo').value,
                appearanceMode: document.getElementById('s-appearance').value,
                theme: document.getElementById('s-theme').value,
                copyright: document.getElementById('s-copy').value,
                searchEnabled: document.getElementById('s-search').checked
            };
            const res = await fetch('/api/settings', { method: 'POST', body: JSON.stringify(appData.settings) });
            if(res.ok) alert('\u2705 \u7F51\u7AD9\u8BBE\u7F6E\u5DF2\u6210\u529F\u4FDD\u5B58\uFF01');
        }

        async function syncData() {
          if(!confirm('\u662F\u5426\u4ECE migration-data.json \u8986\u76D6\u5F53\u524D\u6570\u636E\uFF1F')) return;
          const res = await fetch('/migration-data.json');
          if(!res.ok) return alert('\u672A\u627E\u5230\u8FC1\u79FB\u6587\u4EF6');
          const data = await res.json();
          const seed = await fetch('/api/seed', { method: 'POST', body: JSON.stringify(data) });
          if(seed.ok) { alert('\u540C\u6B65\u6210\u529F\uFF01'); location.reload(); }
        }

        /* --- Category & Link Logic --- */
        function renderCategories() {
            const container = document.getElementById('categoryContainer');
            container.innerHTML = appData.categories.sort((a,b)=>a.sortOrder-b.sortOrder).map((c, i) => \`
                <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group">
                    <div class="p-8 flex items-center justify-between bg-slate-50/50">
                        <div class="flex items-center gap-4">
                            <span class="text-slate-300 font-black text-2xl">#\${i+1}</span>
                            <span class="font-black text-xl">\${c.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="moveCat(\${i}, -1)" class="p-3 hover:bg-white rounded-xl">&uarr;</button>
                            <button onclick="moveCat(\${i}, 1)" class="p-3 hover:bg-white rounded-xl">&darr;</button>
                            <button onclick="editCat(\${i})" class="bg-white border text-sm font-bold px-4 py-2 rounded-xl">\u7F16\u8F91</button>
                            <button onclick="deleteCat(\${i})" class="text-red-500 font-bold px-4 py-2">&times;</button>
                        </div>
                    </div>
                    <div class="p-8 space-y-4">
                        <div class="grid grid-cols-1 gap-4">
                            \${c.links.sort((a,b)=>a.sortOrder-b.sortOrder).map((l, li) => \`
                                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div class="flex items-center gap-4 overflow-hidden">
                                        <img src="\${l.logoUrl}" class="w-10 h-10 rounded-lg bg-white border object-contain">
                                        <div class="truncate"><p class="font-bold">\${l.name}</p><p class="text-xs opacity-40 truncate">\${l.url}</p></div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button onclick="moveLink(\${i}, \${li}, -1)" class="text-slate-400">&uarr;</button>
                                        <button onclick="moveLink(\${i}, \${li}, 1)" class="text-slate-400">&darr;</button>
                                        <button onclick="editLink(\${i}, \${li})" class="text-blue-600 text-xs font-bold px-2">\u4FEE\u6539</button>
                                        <button onclick="deleteLink(\${i}, \${li})" class="text-red-500 text-xs px-2">\u5220\u9664</button>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                        <button onclick="addLink(\${i})" class="w-full dashed border-2 border-dashed border-slate-200 p-4 rounded-2xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all">+ \u65B0\u589E\u94FE\u63A5</button>
                    </div>
                </div>
            \`).join('');
        }

        async function saveCategories() {
            const res = await fetch('/api/categories/save', { method: 'POST', body: JSON.stringify(appData.categories) });
            if(res.ok) alert('\u2705 \u6240\u6709\u5185\u5BB9\u66F4\u6539\u5DF2\u4FDD\u5B58\uFF01');
        }

        // Add/Move/Delete Helpers
        function moveCat(i, d) {
          const target = i + d;
          if(target < 0 || target >= appData.categories.length) return;
          [appData.categories[i], appData.categories[target]] = [appData.categories[target], appData.categories[i]];
          appData.categories.forEach((c, idx) => c.sortOrder = idx);
          renderCategories();
        }

        function moveLink(ci, li, d) {
          const links = appData.categories[ci].links;
          const target = li + d;
          if(target < 0 || target >= links.length) return;
          [links[li], links[target]] = [links[target], links[li]];
          links.forEach((l, idx) => l.sortOrder = idx);
          renderCategories();
        }

        function addCategory() {
            const name = prompt('\u8F93\u5165\u5206\u7C7B\u540D\u79F0:');
            if(name) { appData.categories.push({ id: Date.now().toString(), name, sortOrder: appData.categories.length, links: [] }); renderCategories(); }
        }
        function deleteCat(i) { if(confirm('\u786E\u5B9A\u5220\u9664\u6B64\u5206\u7C7B\uFF1F')) { appData.categories.splice(i, 1); renderCategories(); } }
        function editCat(i) { 
            const name = prompt('\u91CD\u547D\u540D\u4E3A:', appData.categories[i].name);
            if(name) { appData.categories[i].name = name; renderCategories(); }
        }

        function addLink(ci) {
            const name = prompt('\u7F51\u7AD9\u540D\u79F0:');
            const url = prompt('URL:');
            const desc = prompt('\u63CF\u8FF0:');
            const logo = prompt('Logo URL:');
            if(name && url) {
                appData.categories[ci].links.push({ id: Date.now().toString(), name, url, description: desc, logoUrl: logo, sortOrder: appData.categories[ci].links.length });
                renderCategories();
            }
        }
        function deleteLink(ci, li) { appData.categories[ci].links.splice(li, 1); renderCategories(); }
        function editLink(ci, li) {
            const l = appData.categories[ci].links[li];
            l.name = prompt('\u540D\u79F0:', l.name) || l.name;
            l.url = prompt('URL:', l.url) || l.url;
            l.description = prompt('\u63CF\u8FF0:', l.description) || l.description;
            l.logoUrl = prompt('Logo:', l.logoUrl) || l.logoUrl;
            renderCategories();
        }
    <\/script>
</body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
__name(renderAdmin, "renderAdmin");

// ../../.npm/_npx/2386ea9316111215/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../.npm/_npx/2386ea9316111215/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-D6Egld/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../.npm/_npx/2386ea9316111215/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-D6Egld/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=_worker.js.map
