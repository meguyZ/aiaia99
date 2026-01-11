/**
 * ==================================================================================
 * AI MUSIC STUDIO PRO - ULTIMATE GLASS EDITION (v8.7 Unstoppable Lyrics)
 * POWERED BY SUNO AI & OPENAI & GEMINI (Triple-Fallback System)
 * พัฒนาโดย: BANKY.DEV STUDIO
 * ==================================================================================
 */

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 8080;
const USERS_FILE = path.join(__dirname, 'users.json');

// ************************************************************
// [CONFIG] API KEYS
// ************************************************************
const USE_MOCK_API = false; 
const MUSIC_API_KEY = 'sk_f911e898a1b34c52a1cc8973dae30678'; 
const API_BASE_URL = 'https://api.aimusicapi.ai/api/v1'; 

// KEY 1: OpenAI (Primary)
const OPENAI_API_KEY = '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';

// KEY 2: Gemini (Backup)
const GEMINI_API_KEY = '';
// ************************************************************

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- DATABASE UTILS (USERS ONLY) ---
const initFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
};
initFile(USERS_FILE);

const readFile = (filePath) => {
    try { return JSON.parse(fs.readFileSync(filePath)); } catch (err) { return []; }
};
const saveFile = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
const getUsers = () => readFile(USERS_FILE);
const hashPassword = (pw) => crypto.createHash('sha256').update(pw).digest('hex');

// --- HELPER: EXTREME DETAILED LOGGING ---
function log(context, message, data = null, isError = false) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const colorReset = "\x1b[0m";
    const colorCyan = "\x1b[36m";
    const colorYellow = "\x1b[33m";
    const colorRed = "\x1b[31m";
    const colorGreen = "\x1b[32m";
    const colorMagenta = "\x1b[35m";
    
    const color = isError ? colorRed : (context.includes('SUCCESS') ? colorGreen : colorCyan);
    console.log(`${color}[${timestamp}] [${context}]${colorReset} ${message}`);
    
    if (data) {
        try {
            let jsonStr = JSON.stringify(data, null, 2);
            // Limit log size to prevent terminal flooding but keep enough details
            if (jsonStr.length > 2000) jsonStr = jsonStr.substring(0, 2000) + "...(truncated)";
            console.log(`${isError ? colorRed : colorYellow}${jsonStr}${colorReset}`);
        } catch (e) {
            console.log(`${colorRed}[LOG_ERROR] Could not stringify data: ${e.message}${colorReset}`);
        }
    }
    console.log(`${colorMagenta}------------------------------------------------------------${colorReset}`);
}

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
    const { username, password, email } = req.body;
    log('AUTH_REGISTER', `New registration attempt: ${username}`);
    if (!username || !password || !email) {
        log('AUTH_REGISTER', 'Validation failed: Missing fields', req.body, true);
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    const users = getUsers();
    if (users.find(u => u.username === username || u.email === email)) {
        log('AUTH_REGISTER', 'Duplicate user', { username, email }, true);
        return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว' });
    }
    const newUser = { id: Date.now().toString(), username, email, password: hashPassword(password), created_at: new Date().toISOString() };
    users.push(newUser);
    saveFile(USERS_FILE, users);
    log('AUTH_REGISTER_SUCCESS', `User created: ${username}`, { id: newUser.id });
    res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ!', user: { id: newUser.id, username: newUser.username } });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    log('AUTH_LOGIN', `Login attempt: ${username}`);
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === hashPassword(password));
    if (!user) {
        log('AUTH_LOGIN', `Failed: ${username}`, { reason: "Invalid credentials" }, true);
        return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    log('AUTH_LOGIN_SUCCESS', `User logged in: ${username}`);
    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ!', user: { id: user.id, username: user.username, email: user.email } });
});

// --- ROBUST AI LYRICS ENGINE (TRIPLE FALLBACK) ---
function generateLocalLyrics(topic, mood) {
    // Plan 3: Emergency Local Generator (No API needed)
    return `[Verse 1]
(Thinking about ${topic}...)
เรื่องราวของ ${topic} ในวันนี้
ความรู้สึก ${mood} ที่ฉันมี
มันทำให้ใจของฉันเริ่มหวั่นไหว
อยากบอกให้รู้ว่าฉันคิดยังไง

[Chorus]
โอ้ ${topic} เธอคือสิ่งที่ฉันฝัน
บรรยากาศ ${mood} แบบนี้มันช่างสำคัญ
เราจะเดินก้าวไปพร้อมๆ กัน
ในวันที่สดใสและสวยงาม

[Verse 2]
มองไปทางไหนก็เห็นแต่ความหวัง
พลัง ${mood} ผลักดันให้ฉันยังมีหวัง
ไม่ว่าจะไกลแค่ไหนฉันจะไป
ให้ถึงจุดหมายที่ตั้งใจ

[Chorus]
โอ้ ${topic} เธอคือสิ่งที่ฉันฝัน
บรรยากาศ ${mood} แบบนี้มันช่างสำคัญ
เราจะเดินก้าวไปพร้อมๆ กัน
ในวันที่สดใสและสวยงาม

[Outro]
${topic}... ตลอดไป
(Yeah, Yeah)`;
}

app.post('/api/generate-lyrics', async (req, res) => {
    const { topic, mood } = req.body;
    log('LYRICS_REQ', 'Received Lyrics Request', { topic, mood });

    if (!topic) return res.status(400).json({ error: 'กรุณาระบุหัวข้อเพลง' });

    const prompt = `You are a professional songwriter. Write song lyrics about "${topic}" with a "${mood}" mood. 
    Structure: [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Outro].
    Style: Modern, Catchy, Rhythmic.
    Language: Thai (Mainly) mixed with English (if fits).
    Output format: Return ONLY the lyrics text, no conversational text or markdown formatting.`;

    // 1. TRY OPENAI (Plan A)
    try {
        log('LYRICS_TRY_A', 'Attempting OpenAI (ChatGPT)...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o", 
            messages: [
                { role: "system", content: "You are a helpful songwriter." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7
        }, {
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 10000 // 10s timeout
        });

        const lyrics = response.data.choices[0].message.content.trim();
        log('LYRICS_SUCCESS_A', 'OpenAI Generated Lyrics', { preview: lyrics.substring(0, 50) });
        return res.json({ success: true, lyrics: lyrics, source: 'OpenAI' });

    } catch (openaiError) {
        log('LYRICS_FAIL_A', 'OpenAI Failed, Switching to Plan B', { msg: openaiError.message }, true);
    }

    // 2. TRY GEMINI (Plan B)
    try {
        log('LYRICS_TRY_B', 'Attempting Gemini (Google)...');
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await axios.post(geminiUrl, { 
            contents: [{ parts: [{ text: prompt }] }] 
        }, { timeout: 10000 });

        const lyrics = response.data.candidates[0].content.parts[0].text;
        log('LYRICS_SUCCESS_B', 'Gemini Generated Lyrics', { preview: lyrics.substring(0, 50) });
        return res.json({ success: true, lyrics: lyrics, source: 'Gemini' });

    } catch (geminiError) {
        log('LYRICS_FAIL_B', 'Gemini Failed, Switching to Plan C', { msg: geminiError.message }, true);
    }

    // 3. USE LOCAL BACKUP (Plan C - Unstoppable)
    try {
        log('LYRICS_TRY_C', 'Using Local Fallback Generator...');
        const lyrics = generateLocalLyrics(topic, mood);
        log('LYRICS_SUCCESS_C', 'Local Generator Used', { preview: lyrics.substring(0, 50) });
        return res.json({ success: true, lyrics: lyrics, source: 'Local System' });
    } catch (e) {
        // Should never happen
        log('LYRICS_FATAL', 'All systems failed', e.message, true);
        res.status(500).json({ error: 'System Error' });
    }
});

// --- MUSIC GENERATION (ROBUST & LOGGED) ---
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, instrumental, tags, title, custom_mode, username } = req.body;
        log('MUSIC_GEN_REQ', `Request from [${username}]`, { custom_mode, title, prompt, tags, instrumental });

        let payload = { make_instrumental: instrumental || false, mv: "chirp-v3-5" };

        if (custom_mode) {
            payload.custom_mode = true;
            payload.prompt = prompt; 
            payload.tags = tags || "pop";
            payload.title = title || "Untitled";
        } else {
            payload.custom_mode = false;
            payload.prompt = prompt; 
            payload.gpt_description_prompt = prompt;
            payload.tags = tags || ""; 
            if (title) payload.title = title;
        }

        log('MUSIC_GEN_SEND', 'Sending to Suno API...', payload);

        const response = await axios.post(`${API_BASE_URL}/sonic/create`, payload, { 
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MUSIC_API_KEY}` } 
        });

        log('MUSIC_GEN_RESP', 'Suno API Response', response.data);

        let taskIds = [];
        if (response.data.task_id) taskIds = [response.data.task_id];
        else if (response.data.data && response.data.data.task_id) taskIds = [response.data.data.task_id];
        else if (Array.isArray(response.data)) taskIds = response.data.map(item => item.id || item.task_id);

        if (!taskIds || taskIds.length === 0) {
            throw new Error("No Task IDs received from Suno API");
        }

        log('MUSIC_GEN_SUCCESS', 'Tasks Created', { taskIds });
        res.json({ ids: taskIds, status: "submitted", request_payload: payload });

    } catch (error) { 
        const errorDetails = error.response ? error.response.data : error.message;
        log('MUSIC_GEN_ERROR', 'API Failure', errorDetails, true);
        res.status(500).json({ error: 'API Error', details: error.message }); 
    }
});

// --- FEED PROXY (LOGGED) ---
app.get('/api/feed', async (req, res) => {
    try {
        const idsRaw = req.query.ids || '';
        if (!idsRaw) return res.json([]);
        const ids = idsRaw.split(',').filter(id => id.trim());

        const promises = ids.map(async (id) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/sonic/task/${id}`, { 
                    headers: { 'Authorization': `Bearer ${MUSIC_API_KEY}` } 
                });
                const raw = response.data.data || response.data;
                
                if (Array.isArray(raw)) {
                    return raw.map((item, index) => ({ ...item, parent_task_id: id, is_clip: true, clip_index: index }));
                } else if (raw && typeof raw === 'object') {
                    if (raw.clips && Array.isArray(raw.clips)) {
                         return raw.clips.map((item, index) => ({ ...item, parent_task_id: id, is_clip: true, clip_index: index }));
                    }
                    return { ...raw, parent_task_id: id };
                }
                return null;
            } catch (err) { 
                log('FEED_ERROR', `Failed to fetch ID ${id}`, err.message, true);
                return null; 
            }
        });

        const results = await Promise.all(promises);
        res.json(results.flat().filter(item => item !== null));

    } catch (error) {
        log('FEED_CRITICAL', 'Global Feed Error', error.message, true);
        res.json([]);
    }
});

// --- FRONTEND (THE NEW UI) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="th" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>AI Music Studio Pro | Powered by Suno</title>
    
    <!-- SEO & Metadata -->
    <meta name="description" content="สร้างเพลง AI คุณภาพระดับสตูดิโอด้วย Suno AI รองรับภาษาไทยสมบูรณ์แบบ">
    <meta name="keywords" content="AI Music, Suno AI, สร้างเพลงออนไลน์">
    <meta name="author" content="BANKY.DEV STUDIO">
    <meta name="theme-color" content="#020617">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="manifest" href="data:application/json;base64,eyJkZXNjcmlwdGlvbiI6IkFJIE11c2ljIFN0dWRpbyBQcm8iLCJkaXNwbGF5Ijoic3RhbmRhbG9uZSIsImljb25zIjpbeyJzcmMiOiJodHRwczovL2FwaS5kaWNlYmVhci5jb20vNy54L3NoYXBlcy9wbmcvc2VlZD1NVVNJQ1BSTyZzaXplPTUxMiIsInR5cGUiOiJpbWFnZS9wbmciLCJzaXplcyI6IjUxMng1MTIifV0sIm5hbWUiOiJBSSBNdXNpYyBQcm8iLCJzaG9ydF9uYW1lIjoiTVVTSUNQUk8iLCJzdGFydF91cmwiOiIvIiwidGhlbWVfY29xvciIjBmMTcyYSIsImJhY2tncm91bmRfY29sb3IiOiIjMDIwNjE3In0=">

    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    
    <!-- Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { 
                        sans: ['"Kanit"', 'sans-serif'], 
                        display: ['"Kanit"', 'sans-serif'] 
                    },
                    colors: {
                        glass: {
                            100: 'rgba(255, 255, 255, 0.1)',
                            200: 'rgba(255, 255, 255, 0.2)',
                            300: 'rgba(255, 255, 255, 0.3)',
                            dark: 'rgba(10, 10, 10, 0.6)'
                        },
                        brand: {
                            primary: '#6366f1',
                            secondary: '#ec4899',
                            accent: '#06b6d4'
                        }
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'glow': 'glow 3s ease-in-out infinite alternate',
                        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        'gradient-x': 'gradient-x 15s ease infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-20px)' },
                        },
                        glow: {
                            '0%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' },
                            '100%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 10px rgba(236, 72, 153, 0.4)' }
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(30px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' }
                        },
                        'gradient-x': {
                            '0%, 100%': { 'background-size':'200% 200%', 'background-position': 'left center' },
                            '50%': { 'background-size':'200% 200%', 'background-position': 'right center' },
                        },
                    }
                }
            }
        }
    </script>

    <style>
        * { font-family: 'Kanit', sans-serif !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #64748b; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }

        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
        }
        .dark .glass-panel {
            background: rgba(17, 25, 40, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.125);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.5);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .dark .glass-card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glass-card:hover {
            transform: translateY(-5px) scale(1.02);
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.2);
        }

        .bg-mesh {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;
            background: radial-gradient(circle at 0% 0%, #e0e7ff 0%, #f1f5f9 50%), 
                        radial-gradient(circle at 100% 100%, #dbeafe 0%, #f8fafc 50%);
            transition: background 0.5s ease;
        }
        .dark .bg-mesh {
            background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 70%);
        }

        .orb {
            position: absolute; border-radius: 50%;
            filter: blur(100px); opacity: 0.5;
            animation: float 10s infinite ease-in-out;
            pointer-events: none;
        }

        .input-modern {
            background: rgba(255,255,255,0.6);
            border: 1px solid rgba(0,0,0,0.1);
            color: #1e293b;
            transition: all 0.3s ease;
        }
        .dark .input-modern {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
        }
        .input-modern:focus {
            background: rgba(255,255,255,0.9);
            border-color: #6366f1;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
            outline: none;
        }
        .dark .input-modern:focus {
            background: rgba(0,0,0,0.5);
        }

        .nav-item {
            position: relative;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item.active i {
            transform: translateY(-4px);
            color: #6366f1;
        }
        .nav-item.active span {
            color: #6366f1;
            font-weight: 700;
        }
        .nav-item.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            background: #6366f1;
            border-radius: 50%;
        }
        
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }

        .text-gradient {
            background: linear-gradient(to right, #6366f1, #ec4899, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 200% auto;
            animation: gradient-x 5s linear infinite;
        }
    </style>
</head>
<body class="bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 min-h-screen flex flex-col selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">

    <!-- Ambient Background -->
    <div class="bg-mesh">
        <div class="orb w-[600px] h-[600px] bg-indigo-500/30 top-[-10%] left-[-10%] animate-pulse"></div>
        <div class="orb w-[500px] h-[500px] bg-pink-500/20 bottom-[-10%] right-[-10%] animate-pulse" style="animation-delay: 2s"></div>
        <div class="orb w-80 h-80 bg-cyan-500/20 top-[40%] left-[40%] hidden md:block" id="mouseOrb"></div>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden md:block fixed top-0 w-full z-50 glass-panel border-b-0 h-20 transition-all duration-300" id="navbar">
        <div class="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
            <!-- Logo -->
            <div class="flex items-center gap-4 cursor-pointer group" onclick="window.scrollTo(0,0)">
                <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                    <i class="ri-music-ai-fill text-2xl text-white"></i>
                </div>
                <div>
                    <h1 class="font-bold text-xl tracking-tight text-slate-800 dark:text-white leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">AI MUSIC PRO</h1>
                    <p class="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5 uppercase">POWERED BY SUNO</p>
                </div>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-5">
                <button onclick="toggleTheme()" class="w-10 h-10 rounded-full glass-panel hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-all text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95">
                    <i id="themeIcon" class="ri-moon-line text-xl"></i>
                </button>

                <div id="userSection" class="hidden items-center gap-4 animate-slide-up pl-4 border-l border-slate-200 dark:border-white/10">
                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">ผู้ใช้งาน</div>
                        <div id="displayUsername" class="text-sm font-bold text-slate-800 dark:text-white">User</div>
                    </div>
                    <button onclick="logout()" class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 hover:scale-110 transition-all" title="ออกจากระบบ">
                        <i class="ri-logout-circle-r-line text-lg"></i>
                    </button>
                </div>
                
                <button id="guestBtn" onclick="toggleAuthModal(true)" class="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                    <i class="ri-user-add-line"></i> เข้าสู่ระบบ
                </button>
            </div>
        </div>
    </nav>

    <!-- Mobile Header -->
    <nav class="md:hidden fixed top-0 w-full z-40 glass-panel h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl transition-all">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-md">
                <i class="ri-music-ai-fill text-base text-white"></i>
            </div>
            <span class="font-bold text-lg text-slate-800 dark:text-white">AI MUSIC PRO</span>
        </div>
        <button onclick="toggleTheme()" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all active:scale-90">
             <i id="mobileThemeIcon" class="ri-moon-line text-lg"></i>
        </button>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow pt-24 md:pt-36 pb-32 md:pb-24 px-4 relative z-10 w-full max-w-7xl mx-auto">
        
        <!-- Hero Section -->
        <header class="text-center mb-16 relative" data-aos="fade-down" data-aos-duration="1000">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold tracking-widest mb-8 backdrop-blur-md uppercase hover:scale-105 transition-transform cursor-default">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                สถานะ API: ออนไลน์
            </div>
            
            <h1 class="text-5xl md:text-9xl font-black mb-6 text-slate-800 dark:text-white tracking-tighter drop-shadow-xl leading-tight">
                AI MUSIC <br/>
                <span class="text-gradient">GENERATION</span>
            </h1>
            <p class="text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed px-4">
                ปลดล็อกจินตนาการทางดนตรีของคุณ ด้วยเทคโนโลยี AI ที่ทรงพลังที่สุด <br class="hidden md:block"/>
                รองรับภาษาไทย 100% ใช้งานง่าย ได้เพลงคุณภาพสตูดิโอ
            </p>
        </header>

        <!-- Control Center -->
        <div class="max-w-5xl mx-auto mb-20" data-aos="fade-up" data-aos-delay="200">
            <!-- Tabs -->
            <div class="hidden md:flex justify-center gap-4 mb-8">
                <button onclick="switchTab('create')" id="tabCreate" class="px-8 py-3 rounded-2xl font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105">
                    <i class="ri-add-circle-line mr-2"></i> สร้างเพลงใหม่
                </button>
                <button onclick="switchTab('history')" id="tabHistory" class="px-8 py-3 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white">
                    <i class="ri-folder-music-line mr-2"></i> คลังเพลง
                </button>
            </div>

            <!-- Create Panel -->
            <div id="createPanel" class="glass-panel rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <form id="musicForm" class="relative z-10 space-y-8">
                    <div class="group">
                        <label class="block text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wider pl-1">ชื่อผลงาน (Song Title)</label>
                        <div class="relative">
                            <i class="ri-music-2-line absolute top-4 left-5 text-slate-400"></i>
                            <input type="text" id="songTitle" class="input-modern w-full rounded-2xl pl-12 pr-6 py-4 text-lg font-medium" placeholder="ตั้งชื่อเพลงของคุณ...">
                        </div>
                    </div>

                    <div class="flex p-1.5 bg-slate-200/80 dark:bg-black/40 rounded-2xl w-full md:w-fit md:mx-auto border border-white/10 backdrop-blur-md">
                        <button type="button" onclick="setMode('simple')" id="modeSimple" class="flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-md transition-all">โหมดง่าย</button>
                        <button type="button" onclick="setMode('custom')" id="modeCustom" class="flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all">โหมดโปร</button>
                    </div>

                    <div id="simpleFields" class="animate-slide-up">
                        <label class="block text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wider pl-1">คำอธิบายเพลง (Prompt)</label>
                        <div class="relative group">
                            <textarea id="prompt" rows="4" class="input-modern w-full rounded-3xl px-6 py-5 text-base leading-relaxed resize-none shadow-inner" placeholder="บรรยายเพลงที่คุณต้องการ... เช่น เพลงป๊อปสนุกๆ เกี่ยวกับการเดินทางไปทะเลภูเก็ต พร้อมเสียงร้องหญิงหวานๆ"></textarea>
                            <div class="absolute bottom-4 right-6 text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1"><i class="ri-sparkling-fill text-indigo-400"></i> AI Magic</div>
                        </div>
                    </div>

                    <div id="customFields" class="hidden grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                        <div class="md:col-span-2">
                             <div class="flex justify-between items-end mb-3 px-1">
                                <label class="block text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">เนื้อเพลง (Lyrics)</label>
                                <button type="button" onclick="toggleAiPanel()" class="text-xs font-bold text-pink-500 hover:text-pink-400 flex items-center gap-1 transition-all hover:scale-105 bg-pink-500/10 px-3 py-1 rounded-full">
                                    <i class="ri-openai-fill"></i> ให้ AI ช่วยแต่งเนื้อร้อง
                                </button>
                             </div>
                             
                            <div id="aiLyricsPanel" class="hidden mb-4 p-5 rounded-2xl bg-slate-50 dark:bg-indigo-500/10 border border-slate-200 dark:border-indigo-500/20 animate-slide-up relative overflow-hidden">
                                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-500/20 to-transparent rounded-bl-full"></div>
                                <div class="flex flex-col md:flex-row gap-4 mb-4 relative z-10">
                                    <div class="flex-1">
                                        <label class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1 block">หัวข้อ</label>
                                        <input type="text" id="lyricTopic" class="input-modern w-full rounded-xl px-4 py-2 text-sm" placeholder="เช่น ความรักในฤดูฝน">
                                    </div>
                                    <div class="w-full md:w-1/3">
                                        <label class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1 block">อารมณ์</label>
                                        <input type="text" id="lyricMood" class="input-modern w-full rounded-xl px-4 py-2 text-sm" placeholder="เช่น เหงา, ซึ้ง">
                                    </div>
                                </div>
                                <button type="button" onclick="generateAiLyrics()" id="btnAiGen" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.01] transition-all relative z-10">
                                    <i class="ri-magic-line mr-1"></i> เริ่มแต่งเนื้อร้อง
                                </button>
                            </div>

                            <textarea id="customLyrics" rows="8" class="input-modern w-full rounded-3xl px-6 py-5 text-sm font-mono leading-relaxed shadow-inner" placeholder="[Verse]&#10;ใส่เนื้อเพลงของคุณที่นี่...&#10;[Chorus]&#10;..."></textarea>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wider pl-1">แนวเพลง (Style)</label>
                            <input type="text" id="customTags" class="input-modern w-full rounded-2xl px-6 py-4" placeholder="เช่น Electronic, Thai Pop, Female Vocals, 120 BPM">
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 pt-8 border-t border-slate-200 dark:border-white/5">
                        <label class="flex items-center gap-3 cursor-pointer group select-none w-full md:w-auto p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <div class="relative">
                                <input type="checkbox" id="instrumental" class="peer sr-only">
                                <div class="w-12 h-7 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                            </div>
                            <span class="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">เฉพาะดนตรี (Instrumental)</span>
                        </label>
                        
                        <button type="submit" id="generateBtn" class="w-full md:w-auto group relative px-12 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/30">
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 via-pink-500 to-indigo-600 animate-gradient bg-[length:200%_auto]"></div>
                            <span class="relative flex items-center justify-center gap-2">
                                <i class="ri-shining-2-fill text-xl"></i> สร้างเพลงทันที
                            </span>
                        </button>
                    </div>
                </form>

                <div id="loadingState" class="hidden absolute inset-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl flex flex-col items-center justify-center transition-all">
                    <div class="relative w-32 h-32 mb-8">
                        <div class="absolute inset-0 border-4 border-slate-200 dark:border-white/10 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center text-indigo-500 dark:text-indigo-400 animate-pulse">
                            <i class="ri-music-ai-fill text-5xl"></i>
                        </div>
                    </div>
                    <h3 class="text-3xl font-black text-slate-800 dark:text-white mb-3">กำลังประพันธ์เพลง...</h3>
                    <p class="text-indigo-500 dark:text-indigo-400 text-sm font-medium animate-pulse">AI กำลังเรียบเรียงเสียงประสานเพื่อคุณ</p>
                </div>
            </div>

            <!-- Library Panel -->
            <div id="historyPanel" class="hidden min-h-[500px]">
                <div class="flex justify-between items-center mb-10">
                    <h2 class="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><i class="ri-folder-music-line text-indigo-500"></i></span>
                        คลังเพลงของคุณ
                    </h2>
                    <button onclick="refreshHistory()" class="w-11 h-11 rounded-full glass-panel hover:bg-indigo-500 hover:text-white flex items-center justify-center transition-all hover:rotate-180 hover:shadow-lg">
                        <i class="ri-refresh-line text-lg"></i>
                    </button>
                </div>
                <div id="historyGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    <!-- Cards will be injected here -->
                </div>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="hidden md:block glass-panel border-t border-slate-200 dark:border-white/5 mt-auto relative z-20">
        <div class="max-w-7xl mx-auto px-6 py-16">
            <div class="grid grid-cols-4 gap-12 mb-12">
                <div class="col-span-1">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white">
                            <i class="ri-music-ai-fill text-xl"></i>
                        </div>
                        <span class="font-bold text-xl text-slate-800 dark:text-white">AI MUSIC PRO</span>
                    </div>
                    <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        แพลตฟอร์มสร้างสรรค์ดนตรีด้วย AI ที่ล้ำสมัยที่สุด มุ่งมั่นที่จะปลดล็อกศักยภาพทางดนตรีให้กับทุกคน
                    </p>
                </div>
                <div class="col-span-1">
                    <h4 class="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-sm">เมนูลัด</h4>
                    <ul class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li><a href="#" onclick="switchTab('create')" class="hover:text-indigo-500 transition-colors flex items-center gap-2"><i class="ri-arrow-right-s-line"></i> สร้างเพลงใหม่</a></li>
                        <li><a href="#" onclick="switchTab('history')" class="hover:text-indigo-500 transition-colors flex items-center gap-2"><i class="ri-arrow-right-s-line"></i> คลังเพลง</a></li>
                        <li><a href="#" class="hover:text-indigo-500 transition-colors flex items-center gap-2"><i class="ri-arrow-right-s-line"></i> ช่วยเหลือ</a></li>
                    </ul>
                </div>
                <div class="col-span-1">
                    <h4 class="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-sm">ข้อกำหนด</h4>
                    <ul class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li><a href="#" class="hover:text-indigo-500 transition-colors">เงื่อนไขการใช้งาน</a></li>
                        <li><a href="#" class="hover:text-indigo-500 transition-colors">นโยบายความเป็นส่วนตัว</a></li>
                        <li><a href="#" class="hover:text-indigo-500 transition-colors">ลิขสิทธิ์</a></li>
                    </ul>
                </div>
                <div class="col-span-1">
                    <h4 class="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider text-sm">ติดต่อเรา</h4>
                    <div class="flex gap-3 mb-6">
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i class="ri-facebook-fill"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><i class="ri-twitter-x-line"></i></a>
                        <a href="#" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all"><i class="ri-instagram-line"></i></a>
                    </div>
                </div>
            </div>
            
            <div class="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-xs text-slate-500">&copy; 2026 AI Music Studio Pro. All rights reserved.</p>
                <a href="https://bankydev.html-5.me/" target="_blank" class="group relative px-6 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 overflow-hidden transition-all hover:shadow-lg">
                     <div class="absolute inset-0 w-0 bg-gradient-to-r from-indigo-600 to-pink-500 transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                     <div class="flex items-center gap-2 relative z-10">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">พัฒนาโดย BANKY.DEV STUDIO</span>
                        <i class="ri-external-link-line text-xs text-slate-400 group-hover:translate-x-1 transition-transform"></i>
                     </div>
                </a>
            </div>
        </div>
    </footer>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full z-50 glass-panel border-t border-slate-200 dark:border-white/10 pb-safe bg-white/95 dark:bg-[#020617]/95 backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div class="flex justify-around items-center h-16 px-4">
            <button onclick="switchTab('create')" id="mobileTabCreate" class="nav-item flex flex-col items-center gap-1 p-2 w-16 active">
                <i class="ri-add-circle-fill text-2xl transition-transform duration-300"></i>
                <span class="text-[10px]">สร้าง</span>
            </button>
            <button onclick="switchTab('history')" id="mobileTabHistory" class="nav-item flex flex-col items-center gap-1 p-2 w-16 text-slate-400 dark:text-slate-500">
                <i class="ri-folder-music-line text-2xl transition-transform duration-300"></i>
                <span class="text-[10px]">คลังเพลง</span>
            </button>
            <button onclick="handleMobileProfile()" id="mobileTabProfile" class="nav-item flex flex-col items-center gap-1 p-2 w-16 text-slate-400 dark:text-slate-500">
                <i class="ri-user-smile-line text-2xl transition-transform duration-300"></i>
                <span class="text-[10px]">บัญชี</span>
            </button>
        </div>
    </nav>

    <!-- Auth Modal -->
    <div id="authModal" class="fixed inset-0 z-[100] hidden flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300" onclick="toggleAuthModal(false)"></div>
        <div class="glass-panel w-full max-w-md p-8 rounded-[2rem] relative z-10 transform scale-95 transition-all duration-300 bg-white/90 dark:bg-[#1e293b]/90 border dark:border-white/10 shadow-2xl" id="authModalContent">
            <button onclick="toggleAuthModal(false)" class="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><i class="ri-close-line text-xl"></i></button>
            
            <div class="text-center mb-8">
                <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                    <i class="ri-music-ai-fill text-4xl text-white"></i>
                </div>
                <h3 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">ยินดีต้อนรับ</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm">เข้าสู่ระบบเพื่อเริ่มสร้างสรรค์ดนตรีของคุณ</p>
            </div>

            <div class="flex p-1.5 bg-slate-200 dark:bg-black/40 rounded-2xl mb-8">
                <button onclick="authTab('login')" id="authLoginBtn" class="flex-1 py-3 text-sm font-bold rounded-xl bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md transition-all">เข้าสู่ระบบ</button>
                <button onclick="authTab('register')" id="authRegisterBtn" class="flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all">สมัครสมาชิก</button>
            </div>

            <form id="authForm" class="space-y-5">
                <div class="relative group">
                    <i class="ri-user-3-line absolute top-3.5 left-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"></i>
                    <input type="text" name="username" class="input-modern w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium" placeholder="ชื่อผู้ใช้ (Username)" required>
                </div>
                <div id="emailField" class="hidden relative animate-slide-up group">
                    <i class="ri-mail-line absolute top-3.5 left-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"></i>
                    <input type="email" name="email" class="input-modern w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium" placeholder="อีเมล (Email)">
                </div>
                <div class="relative group">
                    <i class="ri-lock-2-line absolute top-3.5 left-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"></i>
                    <input type="password" name="password" class="input-modern w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium" placeholder="รหัสผ่าน (Password)" required>
                </div>
                <button type="submit" class="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                    ดำเนินการต่อ <i class="ri-arrow-right-line"></i>
                </button>
            </form>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast" class="fixed top-24 right-6 left-6 md:left-auto md:w-auto z-[120] translate-x-[200%] transition-transform duration-500 ease-out">
        <div class="glass-panel pl-4 pr-8 py-4 rounded-2xl flex items-center gap-4 border-l-4 border-indigo-500 shadow-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl">
            <div class="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <i class="ri-notification-3-fill text-xl"></i>
            </div>
            <div>
                <h4 id="toastTitle" class="font-bold text-slate-800 dark:text-white text-sm mb-0.5">แจ้งเตือน</h4>
                <p id="toastMsg" class="text-xs text-slate-500 dark:text-slate-400 font-medium">ข้อความ</p>
            </div>
        </div>
    </div>

    <script>
        // --- VISUAL EFFECTS ---
        if(window.matchMedia("(min-width: 768px)").matches) {
            document.addEventListener('mousemove', (e) => {
                const orb = document.getElementById('mouseOrb');
                if(orb) {
                    const x = e.clientX;
                    const y = e.clientY;
                    orb.style.transform = \`translate(\${x - 160}px, \${y - 160}px)\`;
                }
            });
        }
        AOS.init({ once: true, offset: 50, duration: 800 });

        // --- THEME MANAGER ---
        function initTheme() {
            const isDark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            updateThemeIcons(isDark);
        }
        
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
            const btn = document.getElementById('themeIcon');
            btn.parentElement.classList.add('scale-90');
            setTimeout(() => btn.parentElement.classList.remove('scale-90'), 150);
            updateThemeIcons(isDark);
        }

        function updateThemeIcons(isDark) {
            const icon = isDark ? 'ri-moon-clear-fill' : 'ri-sun-fill';
            if(document.getElementById('themeIcon')) document.getElementById('themeIcon').className = icon + ' text-xl text-indigo-500';
            if(document.getElementById('mobileThemeIcon')) document.getElementById('mobileThemeIcon').className = icon + ' text-lg text-indigo-500';
        }
        
        initTheme();

        // --- APP STATE & LOGIC ---
        let currentMode = 'simple';
        let isLoginMode = true;
        let pollInterval;

        const DB = {
            getUser: () => JSON.parse(localStorage.getItem('user')),
            getKey: () => { const u = DB.getUser(); return u ? \`ai_music_\${u.username}\` : null; },
            getSongs: () => { const k = DB.getKey(); return k ? JSON.parse(localStorage.getItem(k) || '[]') : []; },
            saveSongs: (d) => { const k = DB.getKey(); if(k) localStorage.setItem(k, JSON.stringify(d)); },
            addSong: (item) => { const d = DB.getSongs(); if(!d.find(x=>x.id===item.id)){ d.unshift(item); DB.saveSongs(d); } },
            clear: () => { const k = DB.getKey(); if(k) localStorage.removeItem(k); renderHistory(); }
        };

        // --- POLLING SYSTEM ---
        async function syncSongs() {
            let songs = DB.getSongs();
            const pending = songs.filter(s => !['complete_success', 'failed'].includes(s.status));
            if(pending.length === 0) return;

            try {
                const ids = pending.map(s => s.id).join(',');
                const res = await fetch(\`/api/feed?ids=\${ids}\`);
                const results = await res.json();
                
                if (!results || results.length === 0) return;

                let isDirty = false;
                let successChildrenCount = {};

                results.forEach(r => {
                    let status = 'streaming';
                    if (r.audio_url && r.audio_url.length > 5) status = 'complete_success';
                    else if (r.status === 'completed') status = 'complete_success';
                    else if (r.status === 'failed') status = 'failed';

                    if (r.parent_task_id && r.is_clip) {
                        const uniqueId = r.id || \`clip-\${r.parent_task_id}-\${r.clip_index || 0}\`;
                        const existingIdx = songs.findIndex(s => s.id === uniqueId);
                        
                        if (existingIdx === -1) {
                            const parent = songs.find(s => s.id === r.parent_task_id);
                            songs.unshift({
                                id: uniqueId,
                                title: r.title || (parent?.title || 'ไม่มีชื่อ') + (results.length > 1 ? \` (Ver \${(r.clip_index||0)+1})\` : ''),
                                tags: r.tags || parent?.tags || '',
                                image_url: r.image_url || parent?.image_url,
                                audio_url: r.audio_url,
                                video_url: r.video_url,
                                duration: r.duration,
                                status: status,
                                created_at: new Date().toISOString(),
                                is_clip: true
                            });
                            isDirty = true;
                            successChildrenCount[r.parent_task_id] = true;
                        } else {
                            const clip = songs[existingIdx];
                            if (clip.status !== status || clip.audio_url !== r.audio_url) {
                                songs[existingIdx] = { ...clip, status, audio_url: r.audio_url || clip.audio_url, image_url: r.image_url || clip.image_url };
                                isDirty = true;
                            }
                        }
                    } else {
                        const idx = songs.findIndex(s => s.id === r.id);
                        if (idx !== -1) {
                            const s = songs[idx];
                            if (s.status !== status || (r.audio_url && s.audio_url !== r.audio_url)) {
                                songs[idx] = { ...s, status, audio_url: r.audio_url || s.audio_url, image_url: r.image_url || s.image_url, title: (r.title && r.title !== 'Untitled Track') ? r.title : s.title };
                                isDirty = true;
                            }
                        }
                    }
                });

                const parentsToDelete = Object.keys(successChildrenCount);
                if (parentsToDelete.length > 0) {
                    songs = songs.filter(s => !parentsToDelete.includes(s.id));
                    isDirty = true;
                }

                if (isDirty) {
                    DB.saveSongs(songs);
                    if(document.getElementById('historyPanel').style.display !== 'none') renderHistory();
                }
            } catch(e) { console.error(e); }
        }

        function startPolling() { if(pollInterval) clearInterval(pollInterval); pollInterval = setInterval(syncSongs, 4000); syncSongs(); }

        // --- UI FUNCTIONS ---
        function switchTab(tab) {
            const createP = document.getElementById('createPanel');
            const historyP = document.getElementById('historyPanel');
            const btnC = document.getElementById('tabCreate');
            const btnH = document.getElementById('tabHistory');
            const mBtnC = document.getElementById('mobileTabCreate');
            const mBtnH = document.getElementById('mobileTabHistory');

            if (tab === 'create') {
                historyP.style.display = 'none';
                createP.style.display = 'block';
                createP.classList.add('animate-slide-up');
                
                btnC.className = 'px-8 py-3 rounded-2xl font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105';
                btnH.className = 'px-8 py-3 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent';
                mBtnC.className = 'nav-item flex flex-col items-center gap-1 p-2 w-16 active';
                mBtnH.className = 'nav-item flex flex-col items-center gap-1 p-2 w-16 text-slate-400 dark:text-slate-500';
            } else {
                if(!DB.getUser()) return toggleAuthModal(true);
                createP.style.display = 'none';
                historyP.style.display = 'block';
                historyP.classList.add('animate-slide-up');
                
                btnH.className = 'px-8 py-3 rounded-2xl font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:scale-105';
                btnC.className = 'px-8 py-3 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent';
                mBtnH.className = 'nav-item flex flex-col items-center gap-1 p-2 w-16 active';
                mBtnC.className = 'nav-item flex flex-col items-center gap-1 p-2 w-16 text-slate-400 dark:text-slate-500';
                
                renderHistory();
            }
        }

        function handleMobileProfile() {
            const user = DB.getUser();
            if(user) { if(confirm('ออกจากระบบ ' + user.username + '?')) logout(); }
            else toggleAuthModal(true);
        }

        function setMode(mode) {
            currentMode = mode;
            const isSimple = mode === 'simple';
            document.getElementById('simpleFields').classList.toggle('hidden', !isSimple);
            document.getElementById('customFields').classList.toggle('hidden', isSimple);
            
            const btnS = document.getElementById('modeSimple');
            const btnC = document.getElementById('modeCustom');
            
            if(isSimple) {
                btnS.className = 'flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-md transition-all';
                btnC.className = 'flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all';
            } else {
                btnC.className = 'flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-md transition-all';
                btnS.className = 'flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all';
            }
        }

        function renderCard(s) {
            const hasAudio = s.audio_url && s.audio_url.length > 5;
            const isReady = s.status === 'complete_success' || hasAudio;
            const img = s.image_url || 'https://via.placeholder.com/400/0f172a/475569?text=Waveform';
            // [DIRECT FIX]: Construct direct CDN URL to bypass potential API lag
            const streamUrl = \`https://cdn1.suno.ai/\${s.id}.mp3\`;
            
            return \`
            <div class="glass-card p-5 rounded-3xl flex gap-5 items-center group relative overflow-hidden transition-all hover:bg-white/40 dark:hover:bg-white/5">
                <div class="absolute top-4 right-4 z-10">
                     <div class="\${isReady ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-amber-500 animate-pulse'} w-3 h-3 rounded-full border-2 border-white/20" title="\${isReady ? 'พร้อมฟัง' : 'กำลังสร้าง'}"></div>
                </div>

                <div class="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-900 overflow-hidden shrink-0 relative shadow-xl group-hover:shadow-indigo-500/30 transition-shadow">
                    <!-- Access Denied Fix: referrerpolicy="no-referrer" -->
                    <img src="\${img}" referrerpolicy="no-referrer" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" onerror="this.src='https://via.placeholder.com/400/000000/ffffff?text=Music'">
                    \${hasAudio ? \`
                    <button onclick="togglePlay('\${s.id}')" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                        <div class="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center hover:scale-110 transition-transform shadow-xl">
                            <i id="icon-\${s.id}" class="ri-play-fill text-2xl ml-1"></i>
                        </div>
                    </button>\` : \`
                    <div class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <i class="ri-loader-2-fill text-3xl text-indigo-500 animate-spin"></i>
                    </div>\`}
                </div>
                
                <div class="flex-1 min-w-0 py-1">
                    <h3 class="font-bold text-lg text-slate-800 dark:text-white truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">\${s.title}</h3>
                    <div class="flex items-center gap-2 mb-4 overflow-hidden">
                        <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/20 uppercase tracking-wide truncate">
                            \${s.tags || 'AI GEN'}
                        </span>
                    </div>
                    
                    \${hasAudio ? \`
                    <!-- Access Denied Fix: referrerpolicy="no-referrer" and direct API link -->
                    <audio id="audio-\${s.id}" src="\${streamUrl}" referrerpolicy="no-referrer" onended="resetIcon('\${s.id}')" onpause="resetIcon('\${s.id}')" onplay="setIcon('\${s.id}')" onerror="showToast('Playback Error', 'กำลังโหลดไฟล์เสียง...')"></audio>
                    <div class="flex gap-2">
                        <a href="\${streamUrl}" target="_blank" download class="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                            <i class="ri-download-cloud-2-line"></i> ดาวน์โหลด
                        </a>
                        <button onclick="window.open('https://audiopipe.suno.ai/?item_id=\${s.id}', '_blank')" class="w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center text-slate-600 dark:text-slate-300" title="ฟังบน Suno">
                            <i class="ri-external-link-line"></i>
                        </button>
                    </div>\` : \`
                    <div class="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500 w-1/3 animate-[width_2s_ease-in-out_infinite] rounded-full"></div>
                    </div>
                    <p class="text-[10px] text-indigo-500 dark:text-indigo-400 mt-2 animate-pulse font-medium">กำลังเรียบเรียงดนตรี...</p>\`}
                </div>
            </div>\`;
        }

        function renderHistory() {
            const songs = DB.getSongs().sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            const grid = document.getElementById('historyGrid');
            if(songs.length === 0) {
                grid.innerHTML = \`
                    <div class="col-span-full py-24 text-center opacity-50">
                        <div class="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="ri-disc-line text-4xl"></i>
                        </div>
                        <p class="text-lg font-bold">ยังไม่มีเพลงในคลัง</p>
                        <p class="text-sm mt-1">เริ่มสร้างผลงานแรกของคุณเลย!</p>
                    </div>\`;
            } else {
                grid.innerHTML = songs.map(renderCard).join('');
            }
        }

        function togglePlay(id) {
            const audio = document.getElementById(\`audio-\${id}\`);
            if(audio.paused) {
                document.querySelectorAll('audio').forEach(a => { if(a!==audio) { a.pause(); a.currentTime=0; } });
                audio.play();
            } else {
                audio.pause();
            }
        }
        function setIcon(id) { document.getElementById(\`icon-\${id}\`).className = 'ri-pause-circle-fill text-2xl ml-1 text-pink-500'; }
        function resetIcon(id) { document.getElementById(\`icon-\${id}\`).className = 'ri-play-fill text-2xl ml-1'; }

        // --- GENERAL ---
        function toggleAuthModal(show) {
            const m = document.getElementById('authModal');
            const c = document.getElementById('authModalContent');
            if(show) { m.classList.remove('hidden'); setTimeout(()=>c.classList.remove('scale-95'),10); }
            else { c.classList.add('scale-95'); setTimeout(()=>m.classList.add('hidden'),300); }
        }
        
        function authTab(mode) {
            isLoginMode = mode === 'login';
            document.getElementById('emailField').classList.toggle('hidden', isLoginMode);
            const l = document.getElementById('authLoginBtn');
            const r = document.getElementById('authRegisterBtn');
            if(isLoginMode) {
                l.className='flex-1 py-3 text-sm font-bold rounded-xl bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md transition-all';
                r.className='flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all';
            } else {
                r.className='flex-1 py-3 text-sm font-bold rounded-xl bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md transition-all';
                l.className='flex-1 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all';
            }
        }

        function checkAuth() {
            const user = DB.getUser();
            if(user) {
                document.getElementById('userSection').classList.remove('hidden');
                document.getElementById('userSection').classList.add('flex');
                document.getElementById('guestBtn').classList.add('hidden');
                document.getElementById('displayUsername').innerText = user.username;
                const m = document.getElementById('mobileTabProfile');
                if(m) { m.innerHTML='<i class="ri-user-smile-fill text-2xl transition-transform duration-300"></i><span class="text-[10px]">บัญชี</span>'; m.classList.add('text-indigo-500', 'dark:text-indigo-400'); }
                startPolling();
            } else {
                document.getElementById('userSection').classList.add('hidden');
                document.getElementById('guestBtn').classList.remove('hidden');
                const m = document.getElementById('mobileTabProfile');
                if(m) { m.innerHTML='<i class="ri-user-line text-2xl transition-transform duration-300"></i><span class="text-[10px]">เข้าสู่ระบบ</span>'; m.classList.remove('text-indigo-500', 'dark:text-indigo-400'); }
            }
        }

        function logout() { localStorage.removeItem('user'); showToast('ออกจากระบบ', 'ไว้เจอกันใหม่นะ!'); setTimeout(()=>window.location.reload(), 1000); }

        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target));
            const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
            try {
                const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
                const json = await res.json();
                if(json.success) { localStorage.setItem('user', JSON.stringify(json.user)); checkAuth(); toggleAuthModal(false); showToast('ยินดีต้อนรับ', json.message); }
                else showToast('ข้อผิดพลาด', json.error);
            } catch(e) { showToast('ข้อผิดพลาด', 'การเชื่อมต่อมีปัญหา'); }
        });

        function toggleAiPanel() { document.getElementById('aiLyricsPanel').classList.toggle('hidden'); }
        
        async function generateAiLyrics() {
            const btn = document.getElementById('btnAiGen');
            const topic = document.getElementById('lyricTopic').value;
            const mood = document.getElementById('lyricMood').value;
            
            console.log('[FRONTEND_DEBUG] AI Lyrics Request:', { topic, mood });

            if(!topic) return showToast('ข้อมูลไม่ครบ', 'กรุณาระบุหัวข้อเพลง');
            
            btn.disabled = true; btn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> กำลังคิด...';
            
            try {
                console.log('[FRONTEND_DEBUG] Sending request to API...');
                const res = await fetch('/api/generate-lyrics', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({topic, mood}) });
                
                console.log('[FRONTEND_DEBUG] API Response Status:', res.status);
                
                const data = await res.json();
                console.log('[FRONTEND_DEBUG] API Response Data:', data);

                if(data.success) { 
                    document.getElementById('customLyrics').value = data.lyrics; 
                    toggleAiPanel(); 
                    showToast('สำเร็จ', 'แต่งเนื้อร้องให้แล้ว!'); 
                } else {
                    console.error('[FRONTEND_DEBUG] API Error:', data.error);
                    showToast('ข้อผิดพลาด', data.error || 'AI ไม่สามารถทำงานได้');
                }
            } catch(e) { 
                console.error('[FRONTEND_DEBUG] Network/Client Error:', e);
                showToast('ข้อผิดพลาด', 'การเชื่อมต่อขัดข้อง'); 
            }
            btn.disabled = false; btn.innerHTML = '<i class="ri-magic-line mr-1"></i> เริ่มแต่งเนื้อร้อง';
        }

        document.getElementById('musicForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = DB.getUser();
            if(!user) return toggleAuthModal(true);
            const loading = document.getElementById('loadingState');
            loading.classList.remove('hidden');
            const isCustom = currentMode === 'custom';
            const payload = {
                username: user.username,
                custom_mode: isCustom,
                instrumental: document.getElementById('instrumental').checked,
                title: document.getElementById('songTitle').value,
                prompt: isCustom ? document.getElementById('customLyrics').value : document.getElementById('prompt').value,
                tags: isCustom ? document.getElementById('customTags').value : ''
            };
            if(!payload.prompt) { loading.classList.add('hidden'); return showToast('แจ้งเตือน', 'กรุณาใส่คำอธิบาย หรือเนื้อเพลง'); }
            try {
                const res = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
                const data = await res.json();
                if(data.ids) {
                    data.ids.forEach(id => DB.addSong({
                        id, title: payload.title || "กำลังสร้าง...", tags: payload.tags || "AI Magic",
                        status: 'streaming', created_at: new Date().toISOString(), is_task: true
                    }));
                    showToast('สำเร็จ', 'เริ่มสร้างเพลงแล้ว!');
                    startPolling();
                    setTimeout(() => { loading.classList.add('hidden'); switchTab('history'); }, 1500);
                } else { throw new Error('No IDs'); }
            } catch(e) { loading.classList.add('hidden'); showToast('ข้อผิดพลาด', 'ไม่สามารถเริ่มการสร้างได้'); }
        });

        function showToast(title, msg) {
            const t = document.getElementById('toast');
            document.getElementById('toastTitle').innerText = title;
            document.getElementById('toastMsg').innerText = msg;
            t.classList.remove('translate-x-[200%]');
            setTimeout(() => t.classList.add('translate-x-[200%]'), 3000);
        }

        function refreshHistory() { syncSongs(); showToast('อัปเดต', 'ข้อมูลล่าสุดแล้ว'); }

        checkAuth();
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    log('SERVER', `Running on port ${PORT}`);
});