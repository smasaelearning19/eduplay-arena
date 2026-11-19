// =====================================================================
// AUDIO SYNTHESIZER (WEB AUDIO API - ZERO ASSET DEPENDENCY)
// =====================================================================
const SoundFX = {
    ctx: null,
    muted: false,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playTone(freq, type, duration, vol = 0.15, slideTo = null) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
            }
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },
    jump() { this.playTone(280, 'sine', 0.22, 0.18, 620); },
    noPoints() { this.playTone(180, 'sawtooth', 0.18, 0.12, 120); },
    correct() {
        this.playTone(523.25, 'triangle', 0.12, 0.2);
        setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.2), 90);
        setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.22), 180);
    },
    wrong() {
        this.playTone(220, 'sawtooth', 0.18, 0.16, 180);
        setTimeout(() => this.playTone(165, 'sawtooth', 0.3, 0.16, 130), 150);
    },
    checkpoint() {
        this.playTone(440, 'sine', 0.1, 0.18);
        setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.18), 80);
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.18), 160);
        setTimeout(() => this.playTone(880, 'sine', 0.28, 0.2), 240);
    },
    respawn() { this.playTone(500, 'sine', 0.25, 0.16, 200); },
    victory() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((n, idx) => {
            setTimeout(() => this.playTone(n, 'triangle', 0.28, 0.22), idx * 120);
        });
    },
    turbo() {
        this.playTone(320, 'sawtooth', 0.3, 0.16, 950);
    },
    gateUnlock() {
        this.playTone(587.33, 'triangle', 0.12, 0.2);
        setTimeout(() => this.playTone(880.00, 'triangle', 0.25, 0.22), 100);
    },
    tugPull() {
        this.playTone(140, 'sine', 0.22, 0.22, 280);
    },
    fishStrike() {
        this.playTone(420, 'sine', 0.15, 0.2, 260);
        setTimeout(() => this.playTone(880, 'triangle', 0.22, 0.25), 110);
    },
    bossHit() {
        this.playTone(110, 'sawtooth', 0.35, 0.25, 45);
    },
    bossRoar() {
        this.playTone(85, 'sawtooth', 0.5, 0.28, 55);
    }
};

function toggleMute() {
    SoundFX.muted = !SoundFX.muted;
    const btn = document.getElementById('btnMuteToggle');
    if (btn) btn.textContent = SoundFX.muted ? '🔇' : '🔊';
    showToast(SoundFX.muted ? 'Suara dimatikan' : 'Suara diaktifkan', 'info');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    const colors = {
        info: 'bg-slate-800 border-indigo-400 text-white',
        success: 'bg-emerald-600 border-emerald-300 text-white',
        warning: 'bg-amber-500 border-amber-200 text-slate-950',
        error: 'bg-rose-600 border-rose-300 text-white'
    };
    toast.className = `px-4 py-3 rounded-2xl border-2 shadow-xl font-bold text-xs sm:text-sm text-center animate-pop ${colors[type] || colors.info}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// =====================================================================
// GAME DEFINITIONS & CONFIGURATION FOR 4 GAMES
// =====================================================================
const GAME_DEFINITIONS = {
    tower: {
        id: 'tower',
        name: 'Tower of Quiz',
        badge: 'Seri Ice Breaking Kelas #1 • Edisi Tower of Hell',
        badgeIcon: '🏰',
        title: 'TOWER OF QUIZ',
        desc: 'Jawab soal dari Guru untuk mengumpulkan Poin Lompatan!',
        rulePill: '1 Jawaban Benar = +2 Poin (2x Lompat)',
        teacherDesc: 'Buat ruangan baru, pantau siswa memanjat menara di proyektor, atur bank soal kuis, dan lihat peringkat live.',
        studentDesc: 'Masukkan kode ruangan dari gurumu dan bersiaplah melompat ke puncak menara bersama teman sekelas!',
        soloTitle: 'Ingin Mencoba Memanjat Menara Solo?',
        soloDesc: 'Mainkan Mode Uji Coba Solo Tower of Quiz bersama bot siswa lain!',
        rewardDesc: 'Setiap jawaban benar memberi siswa +2 Poin Lompat (1 poin = 1 lompatan).',
        pointsIcon: '🦘',
        pointsLabel: 'Poin Lompat',
        progressLabel: 'Ketinggian:',
        maxProgress: '100m',
        quizBtnText: 'Jawab Soal (+2 Poin Lompat)',
        controlsHint: 'Gerak: A / D / Panah • Lompat: Spasi / W • Soal: Enter / Q'
    },
    maze: {
        id: 'maze',
        name: 'Cyber Maze Race',
        badge: 'Seri Ice Breaking Kelas #2 • Edisi Neon Labyrinth',
        badgeIcon: '🏎️',
        title: 'CYBER MAZE RACE',
        desc: 'Balapan labirin siber neon berkecepatan tinggi! Buka gerbang firewall dengan menjawab teka-teki logika!',
        rulePill: '1 Jawaban Benar = Buka Gerbang + 2 Turbo Boost',
        teacherDesc: 'Buat arena balap labirin siber, pantau radar pergerakan seluruh siswa, dan atur kuis logika.',
        studentDesc: 'Kemudikan cyber orb-mu di labirin neon, retas gerbang laser dengan kuis, dan raih Cyber Core!',
        soloTitle: 'Ingin Mencoba Balap Labirin Solo?',
        soloDesc: 'Mainkan Mode Uji Coba Solo Cyber Maze Race melawan Cyber-Bot Glitch dan Bot-Neon!',
        rewardDesc: 'Setiap jawaban benar membuka gerbang laser yang menghalangi dan memberi +2 Turbo Boost.',
        pointsIcon: '⚡',
        pointsLabel: 'Turbo Boost',
        progressLabel: 'Jarak Core:',
        maxProgress: '100%',
        quizBtnText: 'Buka Gerbang (+2 Turbo)',
        controlsHint: 'Gerak: W / A / S / D / Panah • Turbo: Spasi • Retas: Enter / E'
    },
    galaxy: {
        id: 'galaxy',
        name: 'Galaxy Tug-of-War',
        badge: 'Seri Ice Breaking Kelas #3 • Edisi Perang Antargalaksi',
        badgeIcon: '🌌',
        title: 'GALAXY TUG-OF-WAR',
        desc: 'Tarik tambang armada antargalaksi! Tim Surya (Cyan) vs Tim Nebula (Magenta) berebut Inti Kuantum!',
        rulePill: '1 Jawaban Benar = +15 MW Traktor (Combo x2, x3)',
        teacherDesc: 'Bagi kelas menjadi 2 armada perang kosmis, proyeksikan tarik tambang raksasa di layar kelas!',
        studentDesc: 'Bergabung ke armada Tim Surya atau Nebula, jawab kuis untuk menyalakan pendorong gravitasi timmu!',
        soloTitle: 'Ingin Mencoba Tarik Tambang Kosmis Solo?',
        soloDesc: 'Mainkan Mode Uji Coba Solo Galaxy Tug-of-War: Tim Surya vs Tim Nebula!',
        rewardDesc: 'Setiap jawaban benar menyuplai +15 MW daya tarik ke reaktor traktor timmu.',
        pointsIcon: '⚛️',
        pointsLabel: 'Daya Traktor',
        progressLabel: 'Posisi Inti:',
        maxProgress: '100 GW',
        quizBtnText: 'Jawab Kuis (+15 MW Traktor)',
        controlsHint: 'Tarik Traktor: Spasi / Klik • Jawab Kuis: Enter / Q'
    },
    raid: {
        id: 'raid',
        name: 'Neon Fish Raid',
        badge: 'Seri Ice Breaking Kelas #4 • Edisi Boss Raid Samudra',
        badgeIcon: '🎣',
        title: 'NEON FISH RAID',
        desc: 'Kolaborasi 1 kelas mengalahkan Boss Mega-Red! Pancing ikan cyber berenergi dan tembakkan kombo serangan!',
        rulePill: '1 Jawaban Benar = Strike Ikan + Tembak Boss (30-120 DMG)',
        teacherDesc: 'Tampilkan Mega-Red dengan Bar Darah raksasa di proyektor, proyeksikan total damage kelas secara live!',
        studentDesc: 'Lempar kail pancing cyber, tangkap ikan neon dengan menjawab kuis, dan hancurkan Mega-Red!',
        soloTitle: 'Ingin Mencoba Boss Raid Solo?',
        soloDesc: 'Mainkan Mode Uji Coba Solo Neon Fish Raid mengalahkan Mega-Red bersama 2 bot angler!',
        rewardDesc: 'Setiap ikan yang berhasil ditangkap menembakkan proyektil plasma dahsyat ke Boss Mega-Red.',
        pointsIcon: '🎯',
        pointsLabel: 'Damage Dealt',
        progressLabel: 'HP Boss:',
        maxProgress: '1000 HP',
        quizBtnText: 'Lempar Pancing (+Kuis Serang)',
        controlsHint: 'Lempar Kail: Klik / Spasi • Tameng: S • Soal: Enter / Q'
    }
};

let currentGameType = 'tower';

const DEFAULT_QUESTIONS = [
    { q: "Hewan darat tercepat di dunia yang mampu berlari hingga 110 km/jam adalah...", options: ["Singa", "Cheetah", "Kuda Balap", "Kanguru"], correct: 1 },
    { q: "Planet terbesar di tata surya kita adalah...", options: ["Mars", "Saturnus", "Jupiter", "Neptunus"], correct: 2 },
    { q: "Jika 15 + 27 × 0 = ..., berapakah hasilnya?", options: ["0", "42", "15", "27"], correct: 2 },
    { q: "Pulau terbesar di Indonesia berdasarkan luas wilayahnya adalah...", options: ["Jawa", "Sumatra", "Sulawesi", "Kalimantan"], correct: 3 },
    { q: "Zat hijau daun yang membantu tumbuhan melakukan fotosintesis disebut...", options: ["Klorofil", "Stomata", "Karbohidrat", "Oksigen"], correct: 0 },
    { q: "Mata uang resmi negara Jepang adalah...", options: ["Won", "Yen", "Dollar", "Ringgit"], correct: 1 },
    { q: "Organ tubuh manusia yang berfungsi memompa darah ke seluruh tubuh adalah...", options: ["Paru-paru", "Hati", "Jantung", "Ginjal"], correct: 2 },
    { q: "Berapa jumlah warna pada pelangi secara umum?", options: ["5", "6", "7", "8"], correct: 2 }
];

const MEMES_CORRECT = [
    {
        headline: "MANTAP JIWA!",
        subtext: "Otak encer banget! Poin aksi berhasil didapatkan!",
        badge: "BENAR • POIN DIDAPATKAN",
        bg: "from-emerald-400 to-teal-600 border-emerald-200",
        svg: `<svg viewBox="0 0 120 120" class="w-28 h-28"><circle cx="60" cy="60" r="46" fill="#FDE047" stroke="#1E293B" stroke-width="4"/><rect x="26" y="42" width="30" height="16" rx="4" fill="#0F172A"/><rect x="64" y="42" width="30" height="16" rx="4" fill="#0F172A"/><line x1="56" y1="48" x2="64" y2="48" stroke="#0F172A" stroke-width="4"/><path d="M 38 74 Q 60 95 82 74" fill="none" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/><text x="60" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="#FFF">😎 +POINT</text></svg>`
    },
    {
        headline: "IQ 200 DETECTED!",
        subtext: "Guru pasti bangga melihat kecepatan berpikirmu!",
        badge: "JENIUS • SERANGAN MAKSIMAL",
        bg: "from-amber-400 to-orange-500 border-amber-100",
        svg: `<svg viewBox="0 0 120 120" class="w-28 h-28"><circle cx="60" cy="64" r="44" fill="#FDE047" stroke="#1E293B" stroke-width="4"/><polygon points="60,8 66,24 84,24 70,34 75,50 60,40 45,50 50,34 36,24 54,24" fill="#FFF" stroke="#0F172A" stroke-width="2"/><circle cx="44" cy="60" r="6" fill="#0F172A"/><circle cx="76" cy="60" r="6" fill="#0F172A"/><path d="M 42 78 Q 60 94 78 78 Z" fill="#F43F5E" stroke="#0F172A" stroke-width="3"/></svg>`
    },
    {
        headline: "AUTO JUARA KELAS!",
        subtext: "Jawaban tepat sasaran! Jangan kasih kendor!",
        badge: "GACOR • COMBO UP",
        bg: "from-fuchsia-500 to-indigo-600 border-pink-200",
        svg: `<svg viewBox="0 0 120 120" class="w-28 h-28"><path d="M60 15 L75 45 L108 50 L84 73 L90 105 L60 90 L30 105 L36 73 L12 50 L45 45 Z" fill="#FACC15" stroke="#0F172A" stroke-width="4"/><circle cx="50" cy="58" r="5" fill="#0F172A"/><circle cx="70" cy="58" r="5" fill="#0F172A"/><path d="M 48 72 Q 60 84 72 72" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/></svg>`
    }
];

const MEMES_WRONG = [
    {
        headline: "YAH, KURANG TEPAT!",
        subtext: "Belum dapat poin kali ini. Tarik napas, coba lagi yuk!",
        badge: "SALAH • 0 POIN",
        bg: "from-rose-500 to-red-700 border-rose-200",
        svg: `<svg viewBox="0 0 120 120" class="w-28 h-28"><circle cx="60" cy="60" r="46" fill="#FDA4AF" stroke="#1E293B" stroke-width="4"/><path d="M 36 46 L 50 56 M 50 46 L 36 56" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/><path d="M 70 46 L 84 56 M 84 46 L 70 56" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/><path d="M 40 84 Q 60 68 80 84" fill="none" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/><path d="M 86 62 Q 92 74 86 80 Q 80 74 86 62" fill="#38BDF8"/></svg>`
    },
    {
        headline: "NT (NICE TRY) BESTIE!",
        subtext: "Hampir aja bener! Jangan menyerah, kamu pasti bisa!",
        badge: "COBA LAGI • 0 POIN",
        bg: "from-slate-600 to-slate-800 border-slate-400",
        svg: `<svg viewBox="0 0 120 120" class="w-28 h-28"><circle cx="60" cy="60" r="46" fill="#CBD5E1" stroke="#1E293B" stroke-width="4"/><circle cx="44" cy="52" r="6" fill="#0F172A"/><circle cx="76" cy="52" r="6" fill="#0F172A"/><line x1="42" y1="78" x2="78" y2="74" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/><text x="86" y="34" font-size="22" font-weight="bold" fill="#FDE047">?</text></svg>`
    }
];

const AVATAR_COLORS = [
    '#38bdf8', '#f43f5e', '#10b981', '#a855f7',
    '#f59e0b', '#06b6d4', '#ec4899', '#84cc16',
    '#6366f1', '#14b8a6', '#f97316', '#eab308'
];

function getAvatarColor(id) {
    if (!id) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    const idx = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

function createMulberry32(seed) {
    let s = (seed || 12345) >>> 0;
    return function() {
        s = (s + 0x6D2B79F5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


// =====================================================================
// GLOBAL STATE & STORAGE
// =====================================================================
const STORAGE_PREFIX = 'EDUPLAY_ROOM_';
let currentRole = null; // 'teacher' | 'student' | 'solo'
let currentRoomCode = null;
let currentStudentId = null;
let currentStudentName = 'Siswa';
let syncInterval = null;
let lastProgressSendTime = 0;

// =====================================================================
// REALTIME MULTI-USER NETWORK MANAGER (MQTT + BROADCAST CHANNEL + FALLBACK)
// =====================================================================
const NetworkManager = {
    client: null,
    channel: null,
    connected: false,
    otherPlayers: {},
    brokers: [
        'wss://broker.hivemq.com:8884/mqtt',
        'wss://broker.emqx.io:8084/mqtt'
    ],
    currentBrokerIdx: 0,

    init() {
        if (typeof mqtt === 'undefined') {
            this.updateStatusBadge(false);
            return;
        }
        this.connect();
    },

    connect() {
        const brokerUrl = this.brokers[this.currentBrokerIdx];
        const clientId = 'eduplay_' + (currentRole || 'client') + '_' + Math.random().toString(36).substring(2, 9);
        try {
            this.client = mqtt.connect(brokerUrl, {
                clientId: clientId,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 3000
            });

            this.client.on('connect', () => {
                this.connected = true;
                this.updateStatusBadge(true);
                if (currentRoomCode) this.subscribeRoom(currentRoomCode);
            });

            this.client.on('error', () => {
                this.connected = false;
                this.updateStatusBadge(false);
            });

            this.client.on('offline', () => {
                this.connected = false;
                this.updateStatusBadge(false);
            });

            this.client.on('message', (topic, payload) => {
                this.handleMessage(topic, payload);
            });
        } catch(e) {}
    },

    updateStatusBadge(online) {
        const badges = [
            document.getElementById('globalNetworkStatus'),
            document.getElementById('teacherNetworkBadge')
        ];
        badges.forEach(b => {
            if (!b) return;
            if (online) {
                b.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Multi-User Online';
                b.className = b.className.replace(/bg-rose-500\/20|bg-amber-500\/20/, 'bg-emerald-500/20').replace(/text-rose-300|text-amber-300/, 'text-emerald-300');
            } else {
                b.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span> Mode Multi-Tab / Lokal';
                b.className = b.className.replace(/bg-emerald-500\/20/, 'bg-amber-500/20').replace(/text-emerald-300/, 'text-amber-300');
            }
        });
        const dot = document.getElementById('studentNetworkDot');
        if (dot) {
            dot.className = online ? 'inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse' : 'inline-block w-2 h-2 rounded-full bg-amber-400';
        }
    },

    subscribeRoom(code) {
        if (!code) return;
        const cleanCode = code.toUpperCase();
        try {
            if (this.channel) this.channel.close();
            this.channel = new BroadcastChannel('EDUPLAY_' + cleanCode);
            this.channel.onmessage = (e) => {
                this.processEventData(e.data);
            };
        } catch(e) {}

        if (!this.client || !this.connected) return;
        const baseTopic = 'eduplay/v2/' + cleanCode;
        if (currentRole === 'teacher') {
            this.client.subscribe(baseTopic + '/student/+', { qos: 0 });
            this.client.subscribe(baseTopic + '/join', { qos: 1 });
            this.client.subscribe(baseTopic + '/action_in', { qos: 1 });
        } else if (currentRole === 'student') {
            this.client.subscribe(baseTopic + '/state', { qos: 1 });
            this.client.subscribe(baseTopic + '/action', { qos: 1 });
            this.client.subscribe(baseTopic + '/positions', { qos: 0 });
        }
    },

    publish(subtopic, data, retain = false, qos = 0) {
        if (!currentRoomCode) return;
        const cleanCode = currentRoomCode.toUpperCase();
        if (this.channel) {
            try { this.channel.postMessage({ subtopic, data }); } catch(e) {}
        }
        if (this.client && this.connected) {
            const topic = 'eduplay/v2/' + cleanCode + '/' + subtopic;
            this.client.publish(topic, JSON.stringify(data), { retain, qos });
        }
    },

    handleMessage(topic, payload) {
        try {
            const str = payload.toString();
            const data = JSON.parse(str);
            const parts = topic.split('/');
            const subtopic = parts.slice(3).join('/');
            this.processEventData({ subtopic, data });
        } catch(e) {}
    },

    processEventData({ subtopic, data }) {
        if (!data) return;
        if (currentRole === 'teacher') {
            if (data.type === 'JOIN_REQUEST') this.handleStudentJoinRequest(data);
            else if (data.type === 'STUDENT_POS') this.handleStudentPosUpdate(data);
            else if (data.type === 'GALAXY_PULL_EVENT') this.handleGalaxyPullEvent(data);
            else if (data.type === 'RAID_DAMAGE_EVENT') this.handleRaidDamageEvent(data);
        }
        if (currentRole === 'student') {
            if (data.type === 'ROOM_STATE') this.handleRoomStateUpdate(data);
            else if (data.type === 'GAME_START') this.handleGameStart(data);
            else if (data.type === 'GAME_RESET') this.handleGameReset(data);
            else if (data.type === 'TIMER_UPDATE') this.handleTimerUpdate(data);
            else if (data.type === 'QUESTIONS_UPDATE') this.handleQuestionsUpdate(data);
            else if (data.type === 'POSITIONS_BROADCAST') this.handlePositionsBroadcast(data);
            else if (data.type === 'GALAXY_PULL_EVENT') this.handleGalaxyPullEvent(data);
            else if (data.type === 'RAID_DAMAGE_EVENT') this.handleRaidDamageEvent(data);
            else if (data.type === 'STUDENT_FINISHED') showToast(`🏆 ${data.name} telah FINIS!`, 'success');
        }
    },

    handleStudentJoinRequest(data) {
        const room = getRoomData(currentRoomCode);
        if (!room) return;
        if (!room.students) room.students = {};
        
        let team = data.team;
        if (!team && currentGameType === 'galaxy') {
            const stArr = Object.values(room.students);
            const solarCount = stArr.filter(s => s.team === 'solar').length;
            const nebulaCount = stArr.filter(s => s.team === 'nebula').length;
            team = solarCount <= nebulaCount ? 'solar' : 'nebula';
        }

        room.students[data.studentId] = {
            id: data.studentId,
            name: data.name,
            color: data.color || getAvatarColor(data.studentId),
            team: team || 'solar',
            height: 0,
            progress: 0,
            points: 0,
            damage: 0,
            fishCaught: 0,
            finished: false,
            lastSeen: Date.now()
        };
        saveRoomData(currentRoomCode, room);
        updateTeacherClockAndLeaderboard();
        showToast(`🧑‍🎓 ${data.name} bergabung ke ruangan!`, 'info');
        this.broadcastRoomState();
    },

    handleStudentPosUpdate(data) {
        const room = getRoomData(currentRoomCode);
        if (!room) return;
        if (!room.students) room.students = {};
        if (!room.students[data.studentId]) {
            room.students[data.studentId] = { id: data.studentId, name: data.name };
        }
        const s = room.students[data.studentId];
        s.name = data.name;
        s.color = data.color || s.color;
        s.team = data.team || s.team;
        s.height = data.height !== undefined ? data.height : s.height;
        s.progress = data.progress !== undefined ? data.progress : s.progress;
        s.points = data.points !== undefined ? data.points : s.points;
        s.damage = data.damage !== undefined ? data.damage : s.damage;
        s.finished = data.finished !== undefined ? data.finished : s.finished;
        s.x = data.x;
        s.y = data.y;
        s.facing = data.facing;
        s.lastSeen = Date.now();
        saveRoomData(currentRoomCode, room);
        updateTeacherClockAndLeaderboard();
    },

    handleRoomStateUpdate(data) {
        const room = data.room;
        if (!room) return;
        saveRoomData(currentRoomCode, room);

        if (room.gameType && room.gameType !== currentGameType) {
            currentGameType = room.gameType;
            initActiveGameEngine(room.platformSeed || 12345);
        }

        if (currentGameType === 'tower' && room.platformSeed && (!GameState.platforms || GameState.platforms.length === 0 || GameState.platformSeed !== room.platformSeed)) {
            GameState.platformSeed = room.platformSeed;
            buildTowerPlatforms(room.platformSeed);
        }

        syncStudentWithRoom();

        const playersListEl = document.getElementById('waitingPlayersList');
        if (playersListEl && room.students) {
            const stList = Object.values(room.students);
            playersListEl.innerHTML = stList.map(s => `
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 font-bold" style="color: ${s.color || '#38bdf8'}">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${s.color || '#38bdf8'}"></span>
                    ${escapeHtml(s.name)} ${s.team ? `(${s.team === 'solar' ? 'Surya' : 'Nebula'})` : ''}
                </span>`).join('');
        }
    },

    handleGameStart(data) {
        const room = getRoomData(currentRoomCode) || {};
        room.status = 'playing';
        room.endTime = data.endTime;
        room.durationSec = data.durationSec;
        saveRoomData(currentRoomCode, room);

        const overlay = document.getElementById('studentWaitingOverlay');
        if (overlay) overlay.classList.add('hidden');
        setGamePaused(false);
        SoundFX.checkpoint();
        showToast('🚀 Guru telah memulai game! Mainkan sekarang!', 'success');
    },

    handleGameReset(data) {
        const room = getRoomData(currentRoomCode) || {};
        room.status = 'waiting';
        room.endTime = null;
        saveRoomData(currentRoomCode, room);

        const overlay = document.getElementById('studentWaitingOverlay');
        if (overlay) overlay.classList.remove('hidden');
        setGamePaused(true);
        resetActiveGameState();
        showToast('Guru me-reset permainan ke lobi tunggu.', 'warning');
    },

    handleTimerUpdate(data) {
        const room = getRoomData(currentRoomCode);
        if (room) {
            room.durationSec = data.durationSec;
            room.endTime = data.endTime;
            saveRoomData(currentRoomCode, room);
        }
    },

    handleQuestionsUpdate(data) {
        const room = getRoomData(currentRoomCode);
        if (room) {
            room.questions = data.questions;
            saveRoomData(currentRoomCode, room);
            showToast('Bank soal diperbarui oleh Guru!', 'info');
        }
    },

    handlePositionsBroadcast(data) {
        if (!data.positions) return;
        const now = Date.now();
        data.positions.forEach(p => {
            if (p.id === currentStudentId) return;
            if (!this.otherPlayers[p.id]) {
                this.otherPlayers[p.id] = {
                    id: p.id,
                    name: p.name,
                    color: p.color,
                    team: p.team,
                    x: p.x,
                    y: p.y,
                    targetX: p.x,
                    targetY: p.y,
                    facing: p.facing || 1,
                    height: p.height || 0,
                    progress: p.progress || 0,
                    points: p.points || 0,
                    finished: p.finished || false,
                    lastUpdate: now
                };
            } else {
                const ex = this.otherPlayers[p.id];
                ex.targetX = p.x;
                ex.targetY = p.y;
                ex.facing = p.facing || ex.facing;
                ex.height = p.height !== undefined ? p.height : ex.height;
                ex.progress = p.progress !== undefined ? p.progress : ex.progress;
                ex.points = p.points !== undefined ? p.points : ex.points;
                ex.finished = p.finished !== undefined ? p.finished : ex.finished;
                ex.lastUpdate = now;
            }
        });

        Object.keys(this.otherPlayers).forEach(id => {
            if (now - this.otherPlayers[id].lastUpdate > 12000) {
                delete this.otherPlayers[id];
            }
        });
    },

    handleGalaxyPullEvent(data) {
        if (currentGameType === 'galaxy' && typeof applyGalaxyPull === 'function') {
            applyGalaxyPull(data.team, data.amount, data.studentName);
        }
    },

    handleRaidDamageEvent(data) {
        if (currentGameType === 'raid' && typeof applyRaidDamage === 'function') {
            applyRaidDamage(data.amount, data.studentName, data.fishType);
        }
    },

    broadcastRoomState() {
        const room = getRoomData(currentRoomCode);
        if (!room) return;
        this.publish('state', { type: 'ROOM_STATE', room }, true, 1);
    },

    broadcastAction(actionData) {
        this.publish('action', actionData, false, 1);
    },

    broadcastPositions(posArr) {
        this.publish('positions', { type: 'POSITIONS_BROADCAST', positions: posArr }, false, 0);
    },

    sendStudentJoin(studentId, name, color, team) {
        this.publish('join', { type: 'JOIN_REQUEST', studentId, name, color, team }, false, 1);
    },

    sendStudentPos(posData) {
        this.publish('student/' + posData.studentId, posData, false, 0);
    },

    sendGalaxyPull(team, amount, studentName) {
        const payload = { type: 'GALAXY_PULL_EVENT', team, amount, studentName };
        if (currentRole === 'teacher') this.publish('action', payload, false, 1);
        else this.publish('action_in', payload, false, 1);
    },

    sendRaidDamage(amount, studentName, fishType) {
        const payload = { type: 'RAID_DAMAGE_EVENT', amount, studentName, fishType };
        if (currentRole === 'teacher') this.publish('action', payload, false, 1);
        else this.publish('action_in', payload, false, 1);
    }
};

NetworkManager.init();

// =====================================================================
// DATA STORAGE & UTILITY FUNCTIONS
// =====================================================================
function generateRandomRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getRoomData(code) {
    if (!code) return null;
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + code.toUpperCase());
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveRoomData(code, data) {
    if (!code) return;
    try {
        localStorage.setItem(STORAGE_PREFIX + code.toUpperCase(), JSON.stringify(data));
    } catch (e) {}
}

function switchView(viewId) {
    ['viewHome', 'viewLanding', 'viewTeacher', 'viewStudent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
}

function openGame(gameType) {
    SoundFX.init();
    currentGameType = gameType || 'tower';
    const def = GAME_DEFINITIONS[currentGameType] || GAME_DEFINITIONS.tower;

    const bIcon = document.getElementById('landingBadgeIcon');
    const bText = document.getElementById('landingBadgeText');
    const titleEl = document.getElementById('landingGameTitle');
    const descEl = document.getElementById('landingGameDesc');
    const ruleEl = document.getElementById('landingGameRule');
    const teachDesc = document.getElementById('landingTeacherDesc');
    const studDesc = document.getElementById('landingStudentDesc');
    const soloTitle = document.getElementById('landingSoloTitle');
    const soloDesc = document.getElementById('landingSoloDesc');

    if (bIcon) bIcon.textContent = def.badgeIcon;
    if (bText) bText.textContent = def.badge;
    if (titleEl) titleEl.textContent = def.title;
    if (descEl) descEl.childNodes[0].textContent = def.desc + ' ';
    if (ruleEl) ruleEl.textContent = def.rulePill;
    if (teachDesc) teachDesc.textContent = def.teacherDesc;
    if (studDesc) studDesc.textContent = def.studentDesc;
    if (soloTitle) soloTitle.textContent = def.soloTitle;
    if (soloDesc) soloDesc.textContent = def.soloDesc;

    switchView('viewLanding');
    checkUrlRoomParam();
}

function openGame1TowerOfQuiz() {
    openGame('tower');
}

function backToHomePortal() {
    if (syncInterval) clearInterval(syncInterval);
    stopGameLoop();
    currentRole = null;
    currentRoomCode = null;
    document.getElementById('endGameModal').classList.add('hidden');
    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('qrModal').classList.add('hidden');
    switchView('viewHome');
}

function leaveToLanding() {
    if (syncInterval) clearInterval(syncInterval);
    stopGameLoop();
    currentRole = null;
    currentRoomCode = null;
    document.getElementById('endGameModal').classList.add('hidden');
    document.getElementById('quizModal').classList.add('hidden');
    document.getElementById('qrModal').classList.add('hidden');
    switchView('viewLanding');
}

// Cross-tab storage sync
window.addEventListener('storage', (e) => {
    if (!currentRoomCode) return;
    if (e.key === STORAGE_PREFIX + currentRoomCode) {
        if (currentRole === 'teacher') renderTeacherDashboard();
        else if (currentRole === 'student') syncStudentWithRoom();
    }
});


// =====================================================================
// TEACHER DASHBOARD, LOBBY & QUESTION BANK LOGIC
// =====================================================================
function createTeacherRoom() {
    SoundFX.init();
    const code = generateRandomRoomCode();
    currentRole = 'teacher';
    currentRoomCode = code;

    const def = GAME_DEFINITIONS[currentGameType] || GAME_DEFINITIONS.tower;
    const initialRoom = {
        code: code,
        gameType: currentGameType,
        status: 'waiting',
        durationSec: 180,
        endTime: null,
        platformSeed: Math.floor(Math.random() * 900000) + 100000,
        questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
        students: {},
        galaxyState: { corePos: 0, solarPower: 0, nebulaPower: 0 },
        raidState: { bossHp: 1000, maxBossHp: 1000, bossState: 'normal' }
    };
    saveRoomData(code, initialRoom);

    document.getElementById('teacherRoomCodeDisplay').textContent = code;
    document.getElementById('teacherGameTitle').textContent = `${def.name} — Manajemen Kelas`;
    document.getElementById('teacherQuestionRewardText').textContent = def.rewardDesc;
    document.getElementById('inputTimerMinutes').value = 3;
    document.getElementById('inputTimerSeconds').value = 0;

    NetworkManager.subscribeRoom(code);
    NetworkManager.broadcastRoomState();

    switchView('viewTeacher');
    renderTeacherDashboard();
    showToast(`Ruangan ${code} [${def.name}] berhasil dibuat! Siswa siap bergabung.`, 'success');

    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(updateTeacherClockAndLeaderboard, 500);
}

function copyRoomCode() {
    if (!currentRoomCode) return;
    copyTextToClipboard(currentRoomCode);
    showToast(`Kode ruangan "${currentRoomCode}" disalin ke clipboard!`, 'success');
}

function copyStudentShareLink() {
    if (!currentRoomCode) return;
    const url = getStudentJoinUrl(currentRoomCode);
    copyTextToClipboard(url);
    showToast(`Tautan gabung siswa disalin: ${url}`, 'success');
}

function copyQrModalLink() {
    const input = document.getElementById('qrModalUrlInput');
    if (input && input.value) {
        copyTextToClipboard(input.value);
        showToast('Tautan disalin ke clipboard!', 'success');
    }
}

function openQRCodeModal() {
    if (!currentRoomCode) return;
    const modal = document.getElementById('qrModal');
    document.getElementById('qrModalRoomCode').textContent = currentRoomCode;
    const shareUrl = getStudentJoinUrl(currentRoomCode);
    document.getElementById('qrModalUrlInput').value = shareUrl;
    generateQRCode('qrcodeCanvas', shareUrl);
    modal.classList.remove('hidden');
}

function closeQRCodeModal() {
    document.getElementById('qrModal').classList.add('hidden');
}

function getStudentJoinUrl(code) {
    const base = window.location.href.split('?')[0].split('#')[0];
    return `${base}?game=${currentGameType}&room=${code}`;
}

function generateQRCode(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(el, {
                text: text,
                width: 220,
                height: 220,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            return;
        } catch(e) {}
    }
    const img = document.createElement('img');
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
    img.alt = 'QR Code Ruangan';
    img.className = 'w-52 h-52 rounded-xl';
    el.appendChild(img);
}

function setQuickTimer(min, sec) {
    document.getElementById('inputTimerMinutes').value = min;
    document.getElementById('inputTimerSeconds').value = sec;
    updateTeacherTimerSetting();
}

function updateTeacherTimerSetting() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;
    const min = Math.max(0, parseInt(document.getElementById('inputTimerMinutes').value) || 0);
    const sec = Math.max(0, Math.min(59, parseInt(document.getElementById('inputTimerSeconds').value) || 0));
    const total = Math.max(15, min * 60 + sec);
    room.durationSec = total;
    if (room.status === 'playing') {
        room.endTime = Date.now() + total * 1000;
    }
    saveRoomData(currentRoomCode, room);
    NetworkManager.broadcastAction({ type: 'TIMER_UPDATE', durationSec: total, endTime: room.endTime });
    NetworkManager.broadcastRoomState();
    updateTeacherClockAndLeaderboard();
    showToast(`Waktu diatur menjadi ${formatSeconds(total)}`, 'info');
}

function teacherStartGame() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;
    if (room.questions.length === 0) {
        showToast('Tambahkan minimal 1 soal sebelum memulai!', 'error');
        return;
    }
    SoundFX.checkpoint();
    room.status = 'playing';
    room.endTime = Date.now() + room.durationSec * 1000;
    saveRoomData(currentRoomCode, room);
    NetworkManager.broadcastAction({
        type: 'GAME_START',
        endTime: room.endTime,
        durationSec: room.durationSec
    });
    NetworkManager.broadcastRoomState();
    renderTeacherDashboard();
    showToast('Game dimulai! Siswa sekarang bisa beraksi!', 'success');
}

function teacherResetGame() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;
    room.status = 'waiting';
    room.endTime = null;
    if (room.galaxyState) { room.galaxyState = { corePos: 0, solarPower: 0, nebulaPower: 0 }; }
    if (room.raidState) { room.raidState.bossHp = room.raidState.maxBossHp || 1000; }
    Object.keys(room.students || {}).forEach(id => {
        const s = room.students[id];
        s.height = 0; s.progress = 0; s.points = 0; s.damage = 0; s.finished = false;
    });
    saveRoomData(currentRoomCode, room);
    NetworkManager.broadcastAction({ type: 'GAME_RESET' });
    NetworkManager.broadcastRoomState();
    renderTeacherDashboard();
    showToast('Sesi di-reset ke lobi tunggu.', 'warning');
}

function saveTeacherQuestion() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;
    const qText = document.getElementById('inputQuestionText').value.trim();
    const opts = [
        document.getElementById('optA').value.trim(),
        document.getElementById('optB').value.trim(),
        document.getElementById('optC').value.trim(),
        document.getElementById('optD').value.trim()
    ];
    const correctRadio = document.querySelector('input[name="correctOption"]:checked');
    const correctIdx = correctRadio ? parseInt(correctRadio.value) : 0;

    if (!qText || opts.some(o => !o)) {
        showToast('Harap isi teks pertanyaan dan keempat pilihan A, B, C, D!', 'error');
        return;
    }

    const editIdx = parseInt(document.getElementById('editQuestionIndex').value);
    const newQ = { q: qText, options: opts, correct: correctIdx };

    if (editIdx >= 0 && editIdx < room.questions.length) {
        room.questions[editIdx] = newQ;
        showToast('Soal berhasil diperbarui!', 'success');
    } else {
        room.questions.push(newQ);
        showToast('Soal baru berhasil ditambahkan!', 'success');
    }

    saveRoomData(currentRoomCode, room);
    NetworkManager.broadcastAction({ type: 'QUESTIONS_UPDATE', questions: room.questions });
    NetworkManager.broadcastRoomState();
    resetQuestionForm();
    renderTeacherDashboard();
}

function editTeacherQuestion(idx) {
    const room = getRoomData(currentRoomCode);
    if (!room || !room.questions[idx]) return;
    const item = room.questions[idx];
    document.getElementById('editQuestionIndex').value = idx;
    document.getElementById('formQuestionTitle').textContent = `✏️ Edit Soal #${idx + 1}`;
    document.getElementById('btnCancelEditQuestion').classList.remove('hidden');
    document.getElementById('inputQuestionText').value = item.q;
    document.getElementById('optA').value = item.options[0];
    document.getElementById('optB').value = item.options[1];
    document.getElementById('optC').value = item.options[2];
    document.getElementById('optD').value = item.options[3];
    const radios = document.querySelectorAll('input[name="correctOption"]');
    if (radios[item.correct]) radios[item.correct].checked = true;
}

function deleteTeacherQuestion(idx) {
    const room = getRoomData(currentRoomCode);
    if (!room) return;
    room.questions.splice(idx, 1);
    saveRoomData(currentRoomCode, room);
    NetworkManager.broadcastAction({ type: 'QUESTIONS_UPDATE', questions: room.questions });
    NetworkManager.broadcastRoomState();
    renderTeacherDashboard();
    showToast('Soal dihapus.', 'info');
}

function resetQuestionForm() {
    document.getElementById('editQuestionIndex').value = -1;
    document.getElementById('formQuestionTitle').textContent = '+ Tambah Soal Baru';
    document.getElementById('btnCancelEditQuestion').classList.add('hidden');
    document.getElementById('inputQuestionText').value = '';
    document.getElementById('optA').value = '';
    document.getElementById('optB').value = '';
    document.getElementById('optC').value = '';
    document.getElementById('optD').value = '';
    const defRadio = document.querySelector('input[name="correctOption"][value="0"]');
    if (defRadio) defRadio.checked = true;
}

function renderTeacherDashboard() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;

    const badge = document.getElementById('teacherStatusBadge');
    if (room.status === 'waiting') {
        badge.textContent = 'Menunggu Siswa';
        badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else if (room.status === 'playing') {
        badge.textContent = 'Sedang Berlangsung';
        badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    } else {
        badge.textContent = 'Waktu Habis / Selesai';
        badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30';
    }

    document.getElementById('questionCountBadge').textContent = `${room.questions.length} Soal Aktif`;

    const qList = document.getElementById('teacherQuestionsList');
    qList.innerHTML = '';
    if (room.questions.length === 0) {
        qList.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">Belum ada soal. Tambahkan soal menggunakan formulir di atas.</div>`;
    } else {
        const letters = ['A', 'B', 'C', 'D'];
        room.questions.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2';
            card.innerHTML = `
                <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-bold text-white"><span class="text-indigo-400 mr-1.5">#${idx + 1}</span>${escapeHtml(item.q)}</p>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button onclick="editTeacherQuestion(${idx})" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold cursor-pointer">Edit</button>
                        <button onclick="deleteTeacherQuestion(${idx})" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-xs text-rose-400 font-bold cursor-pointer">Hapus</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-1.5 text-xs">
                    ${item.options.map((opt, oIdx) => `
                        <div class="px-2.5 py-1 rounded-lg ${oIdx === item.correct ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-400'}">
                            ${letters[oIdx]}. ${escapeHtml(opt)} ${oIdx === item.correct ? '✓' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            qList.appendChild(card);
        });
    }

    updateTeacherClockAndLeaderboard();
}

function updateTeacherClockAndLeaderboard() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;

    const clockEl = document.getElementById('teacherLiveClock');
    if (room.status === 'playing' && room.endTime) {
        const rem = Math.max(0, Math.ceil((room.endTime - Date.now()) / 1000));
        clockEl.textContent = formatSeconds(rem);
        if (rem === 0 && room.status === 'playing') {
            room.status = 'ended';
            saveRoomData(currentRoomCode, room);
            NetworkManager.broadcastRoomState();
            renderTeacherDashboard();
        }
    } else {
        clockEl.textContent = formatSeconds(room.durationSec);
    }

    const studentsArr = Object.values(room.students || {});
    document.getElementById('studentCountBadge').textContent = `${studentsArr.length} Siswa`;

    if (currentRole === 'teacher' && studentsArr.length > 0) {
        const positions = studentsArr.map(s => ({
            id: s.id,
            name: s.name,
            color: s.color,
            team: s.team,
            x: s.x !== undefined ? s.x : 0,
            y: s.y !== undefined ? s.y : 0,
            facing: s.facing || 1,
            height: s.height || 0,
            progress: s.progress || 0,
            points: s.points || 0,
            damage: s.damage || 0,
            finished: s.finished || false
        }));
        NetworkManager.broadcastPositions(positions);
    }

    const lbEl = document.getElementById('teacherLeaderboardList');
    if (studentsArr.length === 0) {
        lbEl.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">Belum ada siswa yang bergabung ke ruangan ini.</div>`;
        return;
    }

    // Game-specific leaderboard sorting & display
    const gType = room.gameType || 'tower';
    if (gType === 'tower') {
        studentsArr.sort((a, b) => (b.height || 0) - (a.height || 0));
        lbEl.innerHTML = studentsArr.map((st, idx) => `
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                    <span class="w-7 h-7 rounded-xl ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'} font-display font-bold text-xs flex items-center justify-center">
                        ${idx + 1}
                    </span>
                    <div>
                        <div class="font-bold text-sm text-white flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${st.color || '#38bdf8'}"></span>
                            ${escapeHtml(st.name)}
                            ${st.finished ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">PUNCAK 🏆</span>' : ''}
                        </div>
                        <div class="text-[11px] text-slate-400">Poin Lompat: <b class="text-amber-300">${st.points || 0}</b></div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-display font-bold text-emerald-400 text-base">${st.height || 0}m</span>
                    <span class="block text-[10px] text-slate-500">/ 100m</span>
                </div>
            </div>`).join('');
    } else if (gType === 'maze') {
        studentsArr.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        lbEl.innerHTML = studentsArr.map((st, idx) => `
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5">
                    <span class="w-7 h-7 rounded-xl ${idx === 0 ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'} font-display font-bold text-xs flex items-center justify-center">
                        ${idx + 1}
                    </span>
                    <div>
                        <div class="font-bold text-sm text-white flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${st.color || '#06b6d4'}"></span>
                            ${escapeHtml(st.name)}
                            ${st.finished ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">CORE FINIS 🏁</span>' : ''}
                        </div>
                        <div class="text-[11px] text-slate-400">Turbo: <b class="text-cyan-300">${st.points || 0}</b></div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-display font-bold text-cyan-400 text-base">${st.progress || 0}%</span>
                    <span class="block text-[10px] text-slate-500">ke Core</span>
                </div>
            </div>`).join('');
    } else if (gType === 'galaxy') {
        const solarArr = studentsArr.filter(s => s.team === 'solar');
        const nebulaArr = studentsArr.filter(s => s.team === 'nebula');
        const corePos = (room.galaxyState && room.galaxyState.corePos) || 0;
        const solarPercent = Math.round(50 - (corePos / 100) * 50);
        const nebulaPercent = 100 - solarPercent;

        lbEl.innerHTML = `
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 mb-3">
                <div class="flex justify-between text-xs font-bold mb-1.5">
                    <span class="text-cyan-400">TIM SURYA: ${solarPercent}% (${solarArr.length} Awak)</span>
                    <span class="text-fuchsia-400">TIM NEBULA: ${nebulaPercent}% (${nebulaArr.length} Awak)</span>
                </div>
                <div class="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 flex">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-300" style="width: ${solarPercent}%"></div>
                    <div class="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-r-full transition-all duration-300" style="width: ${nebulaPercent}%"></div>
                </div>
            </div>
            ${studentsArr.map((st, idx) => `
                <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-0.5 rounded-lg ${st.team === 'solar' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-fuchsia-500/20 text-fuchsia-300'} font-bold">
                            ${st.team === 'solar' ? 'Surya' : 'Nebula'}
                        </span>
                        <span class="font-bold text-sm text-white">${escapeHtml(st.name)}</span>
                    </div>
                    <span class="text-xs font-bold text-amber-300">${st.points || 0} MW Pull</span>
                </div>`).join('')}
        `;
    } else if (gType === 'raid') {
        studentsArr.sort((a, b) => (b.damage || 0) - (a.damage || 0));
        const bossHp = (room.raidState && room.raidState.bossHp) !== undefined ? room.raidState.bossHp : 1000;
        const maxHp = (room.raidState && room.raidState.maxBossHp) || 1000;
        const hpPct = Math.max(0, Math.min(100, Math.round((bossHp / maxHp) * 100)));

        lbEl.innerHTML = `
            <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 mb-3">
                <div class="flex justify-between text-xs font-bold mb-1.5">
                    <span class="text-rose-400">BOSS MEGA-RED</span>
                    <span class="text-amber-300">${bossHp} / ${maxHp} HP (${hpPct}%)</span>
                </div>
                <div class="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div class="h-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 rounded-full transition-all duration-200" style="width: ${hpPct}%"></div>
                </div>
            </div>
            ${studentsArr.map((st, idx) => `
                <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-lg ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'} font-bold text-xs flex items-center justify-center">
                            ${idx + 1}
                        </span>
                        <span class="font-bold text-sm text-white">${escapeHtml(st.name)}</span>
                    </div>
                    <div class="text-right text-xs">
                        <span class="font-bold text-rose-400">${st.damage || 0} DMG</span>
                    </div>
                </div>`).join('')}
        `;
    }
}

// =====================================================================
// STUDENT JOIN, SOLO SIMULATION & GAME VIEW SETUP
// =====================================================================
function checkUrlRoomParam() {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room') || window.location.hash.replace('#room=', '').replace('#', '');
    const gameParam = params.get('game');

    if (gameParam && GAME_DEFINITIONS[gameParam] && gameParam !== currentGameType) {
        currentGameType = gameParam;
    }

    if (roomParam && roomParam.length >= 4) {
        const cleanCode = roomParam.trim().toUpperCase();
        const inputCode = document.getElementById('inputRoomCode');
        if (inputCode) inputCode.value = cleanCode;
        const inputName = document.getElementById('inputStudentName');
        if (inputName) {
            const saved = localStorage.getItem('EDUPLAY_LAST_STUDENT_NAME');
            if (saved) inputName.value = saved;
            setTimeout(() => inputName.focus(), 300);
        }
        showToast(`Kode ruangan "${cleanCode}" otomatis terisi! Masukkan namamu dan klik Gabung.`, 'info');
    }
}

function joinStudentRoom() {
    SoundFX.init();
    const nameInput = document.getElementById('inputStudentName').value.trim();
    const codeInput = document.getElementById('inputRoomCode').value.trim().toUpperCase();

    if (!nameInput) {
        showToast('Masukkan nama panggilanmu terlebih dahulu!', 'warning');
        return;
    }
    if (codeInput.length < 4 || codeInput.length > 8) {
        showToast('Kode ruangan harus 4-8 karakter!', 'warning');
        return;
    }

    localStorage.setItem('EDUPLAY_LAST_STUDENT_NAME', nameInput);
    const btnJoin = document.getElementById('btnJoinStudent');
    const btnText = document.getElementById('btnJoinStudentText');
    btnJoin.disabled = true;
    btnText.textContent = `⏳ Menghubungkan ke ${codeInput}...`;

    currentRole = 'student';
    currentRoomCode = codeInput;
    currentStudentName = nameInput;
    currentStudentId = 'STU_' + Math.random().toString(36).substring(2, 9);
    const studentColor = getAvatarColor(currentStudentId);

    NetworkManager.subscribeRoom(codeInput);
    NetworkManager.sendStudentJoin(currentStudentId, currentStudentName, studentColor);

    let localRoom = getRoomData(codeInput);
    if (localRoom) {
        if (!localRoom.students) localRoom.students = {};
        localRoom.students[currentStudentId] = {
            id: currentStudentId,
            name: currentStudentName,
            color: studentColor,
            height: 0,
            progress: 0,
            points: 0,
            damage: 0,
            finished: false
        };
        saveRoomData(codeInput, localRoom);
        btnJoin.disabled = false;
        btnText.textContent = '🚀 Gabung Ruangan';
        if (localRoom.gameType) currentGameType = localRoom.gameType;
        enterStudentGameView();
        return;
    }

    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        const cloudRoom = getRoomData(codeInput);
        if (cloudRoom) {
            clearInterval(checkInterval);
            btnJoin.disabled = false;
            btnText.textContent = '🚀 Gabung Ruangan';
            if (cloudRoom.gameType) currentGameType = cloudRoom.gameType;
            enterStudentGameView();
        } else if (attempts >= 10) {
            clearInterval(checkInterval);
            btnJoin.disabled = false;
            btnText.textContent = '🚀 Gabung Ruangan';
            showToast(`Ruangan "${codeInput}" belum ditemukan. Pastikan Guru sudah membuat ruangan dan terhubung internet.`, 'error');
        }
    }, 500);
}

function startQuickSoloDemo() {
    SoundFX.init();
    const code = 'SOLO' + Math.floor(10 + Math.random() * 89);
    const nameInput = document.getElementById('inputStudentName').value.trim() || 'Pahlawan Kelas';
    currentRole = 'solo';
    currentRoomCode = code;
    currentStudentName = nameInput;
    currentStudentId = 'SOLO_PLAYER';

    const demoRoom = {
        code: code,
        gameType: currentGameType,
        status: 'playing',
        durationSec: 180,
        endTime: Date.now() + 180 * 1000,
        platformSeed: 424242,
        questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
        students: {
            [currentStudentId]: {
                id: currentStudentId,
                name: currentStudentName,
                color: '#38bdf8',
                team: 'solar',
                height: 0,
                progress: 0,
                points: 0,
                damage: 0,
                finished: false
            },
            'BOT_1': {
                id: 'BOT_1',
                name: 'Rina (Bot)',
                color: '#ec4899',
                team: 'solar',
                height: 25,
                progress: 25,
                points: 2,
                damage: 60,
                finished: false
            },
            'BOT_2': {
                id: 'BOT_2',
                name: 'Dimas (Bot)',
                color: '#10b981',
                team: 'nebula',
                height: 15,
                progress: 18,
                points: 1,
                damage: 40,
                finished: false
            }
        },
        galaxyState: { corePos: 0, solarPower: 0, nebulaPower: 0 },
        raidState: { bossHp: 1000, maxBossHp: 1000, bossState: 'normal' }
    };
    saveRoomData(code, demoRoom);
    enterStudentGameView();
    showToast(`Mode Uji Coba Solo [${GAME_DEFINITIONS[currentGameType].name}] dimulai!`, 'success');
}

function enterStudentGameView() {
    switchView('viewStudent');
    const def = GAME_DEFINITIONS[currentGameType] || GAME_DEFINITIONS.tower;

    document.getElementById('hudRoomCode').textContent = currentRoomCode;
    document.getElementById('waitingRoomCode').textContent = currentRoomCode;
    document.getElementById('waitingStudentName').textContent = currentStudentName;

    // Adapt HUD labels
    document.getElementById('hudProgressLabel').textContent = def.progressLabel;
    document.getElementById('hudMaxHeightText').textContent = def.maxProgress;
    document.getElementById('hudPointsIcon').textContent = def.pointsIcon;
    document.getElementById('hudPointsLabel').textContent = def.pointsLabel;
    document.getElementById('btnQuizText').textContent = def.quizBtnText;
    document.getElementById('hudControlsHint').textContent = def.controlsHint;

    // Special action button & respawn button visibility
    const btnRespawn = document.getElementById('btnRespawn');
    const btnSpecial = document.getElementById('btnSpecialAction');

    if (currentGameType === 'tower') {
        if (btnRespawn) btnRespawn.classList.remove('hidden');
        if (btnSpecial) btnSpecial.classList.add('hidden');
    } else {
        if (btnRespawn) btnRespawn.classList.add('hidden');
        if (btnSpecial) {
            btnSpecial.classList.remove('hidden');
            const sIcon = document.getElementById('specialActionIcon');
            const sText = document.getElementById('specialActionText');
            if (currentGameType === 'maze') {
                sIcon.textContent = '⚡';
                sText.textContent = 'TURBO';
            } else if (currentGameType === 'galaxy') {
                sIcon.textContent = '🚀';
                sText.textContent = 'TARIK';
            } else if (currentGameType === 'raid') {
                sIcon.textContent = '🛡️';
                sText.textContent = 'SHIELD';
            }
        }
    }

    const room = getRoomData(currentRoomCode);
    initActiveGameEngine(room ? room.platformSeed : 12345);
    syncStudentWithRoom();

    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(syncStudentWithRoom, 400);
}

function syncStudentWithRoom() {
    const room = getRoomData(currentRoomCode);
    if (!room) return;

    const waitOverlay = document.getElementById('studentWaitingOverlay');
    if (room.status === 'waiting') {
        if (waitOverlay) waitOverlay.classList.remove('hidden');
        setGamePaused(true);
    } else {
        if (waitOverlay) waitOverlay.classList.add('hidden');
        const modalOpen = !document.getElementById('quizModal').classList.contains('hidden') ||
                          !document.getElementById('endGameModal').classList.contains('hidden');
        setGamePaused(modalOpen);
    }

    if (room.status === 'playing' && room.endTime) {
        const rem = Math.max(0, Math.ceil((room.endTime - Date.now()) / 1000));
        document.getElementById('hudTimer').textContent = formatSeconds(rem);
        if (rem <= 15) {
            document.getElementById('hudTimer').classList.add('text-rose-400', 'animate-pulse');
        } else {
            document.getElementById('hudTimer').classList.remove('text-rose-400', 'animate-pulse');
        }
        if (rem === 0 && !getActiveGameEnded()) {
            room.status = 'ended';
            saveRoomData(currentRoomCode, room);
            triggerEndGameModal(false);
        }
    } else if (room.status === 'ended' && !getActiveGameEnded()) {
        triggerEndGameModal(false);
    }

    // Bot simulation in solo mode
    if (room.code && room.code.startsWith('SOLO') && room.status === 'playing') {
        if (currentGameType === 'tower') {
            ['BOT_1', 'BOT_2'].forEach(botId => {
                if (room.students[botId] && !room.students[botId].finished && Math.random() < 0.25) {
                    room.students[botId].height = Math.min(98, (room.students[botId].height || 0) + Math.floor(Math.random() * 3));
                }
            });
        } else if (currentGameType === 'maze') {
            ['BOT_1', 'BOT_2'].forEach(botId => {
                if (room.students[botId] && !room.students[botId].finished && Math.random() < 0.3) {
                    room.students[botId].progress = Math.min(95, (room.students[botId].progress || 0) + Math.floor(Math.random() * 2));
                }
            });
        } else if (currentGameType === 'galaxy') {
            if (Math.random() < 0.4 && typeof applyGalaxyPull === 'function') {
                applyGalaxyPull('nebula', 4, 'Dimas (Bot)');
            }
        } else if (currentGameType === 'raid') {
            if (Math.random() < 0.2 && typeof applyRaidDamage === 'function') {
                applyRaidDamage(30, 'Rina (Bot)', 'Laser Salmon');
            }
        }
    }

    // Sync student stats
    if (room.students && room.students[currentStudentId]) {
        const s = room.students[currentStudentId];
        syncLocalStatsToRoomStudent(s);
        saveRoomData(currentRoomCode, room);
    }

    // Update rank / HUD progress
    updateHUDProgressAndRank(room);
    sendLocalStudentProgress();
}

function updateHUDProgressAndRank(room) {
    if (!room || !room.students) return;
    const studentsArr = Object.values(room.students);

    if (currentGameType === 'tower') {
        studentsArr.sort((a, b) => (b.height || 0) - (a.height || 0));
        const myRank = studentsArr.findIndex(s => s.id === currentStudentId) + 1;
        document.getElementById('hudRankText').textContent = `Peringkat #${myRank || 1} dari ${studentsArr.length}`;
        document.getElementById('hudHeightText').textContent = `${GameState.maxHeightMeters}m`;
        document.getElementById('hudProgressBar').style.width = `${Math.min(100, GameState.maxHeightMeters)}%`;
        document.getElementById('hudJumpPoints').textContent = GameState.jumpPoints;
    } else if (currentGameType === 'maze') {
        studentsArr.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        const myRank = studentsArr.findIndex(s => s.id === currentStudentId) + 1;
        document.getElementById('hudRankText').textContent = `Peringkat #${myRank || 1} dari ${studentsArr.length}`;
        document.getElementById('hudHeightText').textContent = `${MazeState.progress}%`;
        document.getElementById('hudProgressBar').style.width = `${MazeState.progress}%`;
        document.getElementById('hudJumpPoints').textContent = MazeState.turboEnergy;
    } else if (currentGameType === 'galaxy') {
        const corePos = (room.galaxyState && room.galaxyState.corePos) || 0;
        const solarPct = Math.round(50 - (corePos / 100) * 50);
        document.getElementById('hudHeightText').textContent = `${solarPct} : ${100 - solarPct}`;
        document.getElementById('hudProgressBar').style.width = `${solarPct}%`;
        document.getElementById('hudRankText').textContent = GalaxyState.myTeam === 'solar' ? 'TIM SURYA 🔵' : 'TIM NEBULA 🟣';
        document.getElementById('hudJumpPoints').textContent = `${GalaxyState.myBatteries} MW`;
    } else if (currentGameType === 'raid') {
        const hp = (room.raidState && room.raidState.bossHp) !== undefined ? room.raidState.bossHp : 1000;
        const maxHp = (room.raidState && room.raidState.maxBossHp) || 1000;
        const hpPct = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));
        document.getElementById('hudHeightText').textContent = `${hp} HP`;
        document.getElementById('hudProgressBar').style.width = `${hpPct}%`;
        document.getElementById('hudRankText').textContent = hp <= 500 ? '🔥 BOSS ENRAGED' : '👾 BOSS NORMAL';
        document.getElementById('hudJumpPoints').textContent = RaidState.myTotalDamage;
    }
}

function syncLocalStatsToRoomStudent(s) {
    if (currentGameType === 'tower') {
        s.height = GameState.maxHeightMeters;
        s.points = GameState.jumpPoints;
        s.finished = GameState.reachedSummit;
    } else if (currentGameType === 'maze') {
        s.progress = MazeState.progress;
        s.points = MazeState.turboEnergy;
        s.finished = MazeState.reachedCore;
    } else if (currentGameType === 'galaxy') {
        s.team = GalaxyState.myTeam;
        s.points = GalaxyState.myPullPower;
    } else if (currentGameType === 'raid') {
        s.damage = RaidState.myTotalDamage;
        s.fishCaught = RaidState.fishCaught;
    }
}

function sendLocalStudentProgress(immediate = false) {
    if ((currentRole !== 'student' && currentRole !== 'solo') || !currentRoomCode || !currentStudentId) return;
    const now = Date.now();
    if (!immediate && now - lastProgressSendTime < 180) return;
    lastProgressSendTime = now;

    let posData = {
        type: 'STUDENT_POS',
        studentId: currentStudentId,
        name: currentStudentName,
        team: GalaxyState.myTeam || 'solar'
    };

    if (currentGameType === 'tower') {
        posData.x = Math.round(GameState.player.x);
        posData.y = Math.round(GameState.player.y);
        posData.facing = GameState.player.facing || 1;
        posData.height = GameState.maxHeightMeters;
        posData.points = GameState.jumpPoints;
        posData.finished = GameState.reachedSummit;
    } else if (currentGameType === 'maze') {
        posData.x = Math.round(MazeState.player.x);
        posData.y = Math.round(MazeState.player.y);
        posData.facing = MazeState.player.facing || 1;
        posData.progress = MazeState.progress;
        posData.points = MazeState.turboEnergy;
        posData.finished = MazeState.reachedCore;
    } else if (currentGameType === 'galaxy') {
        posData.points = GalaxyState.myPullPower;
    } else if (currentGameType === 'raid') {
        posData.damage = RaidState.myTotalDamage;
    }

    NetworkManager.sendStudentPos(posData);
}

// =====================================================================
// QUIZ MODAL & MEME FEEDBACK ENGINE
// =====================================================================
let currentQuestionObj = null;
let lastQuestionIdx = -1;

function openQuizModal() {
    const room = getRoomData(currentRoomCode);
    if (!room || !room.questions || room.questions.length === 0) {
        showToast('Bank soal kosong!', 'error');
        return;
    }
    if (room.status === 'waiting') {
        showToast('Tunggu guru memulai permainan dulu ya!', 'warning');
        return;
    }

    setGamePaused(true);
    document.getElementById('quizModal').classList.remove('hidden');
    loadRandomQuestionIntoModal();
}

function closeQuizModal() {
    document.getElementById('quizModal').classList.add('hidden');
    const room = getRoomData(currentRoomCode);
    if (room && room.status === 'playing' && !getActiveGameEnded()) {
        setGamePaused(false);
    }
}

function nextQuestionInModal() {
    loadRandomQuestionIntoModal();
}

function loadRandomQuestionIntoModal() {
    const room = getRoomData(currentRoomCode);
    if (!room || room.questions.length === 0) return;

    document.getElementById('quizMemeFeedback').classList.add('hidden');
    document.getElementById('quizQuestionContainer').classList.remove('hidden');

    let idx = Math.floor(Math.random() * room.questions.length);
    if (room.questions.length > 1 && idx === lastQuestionIdx) {
        idx = (idx + 1) % room.questions.length;
    }
    lastQuestionIdx = idx;
    currentQuestionObj = room.questions[idx];

    document.getElementById('modalQuestionText').textContent = currentQuestionObj.q;
    for (let i = 0; i < 4; i++) {
        document.getElementById(`quizOptText${i}`).textContent = currentQuestionObj.options[i];
    }
}

function submitQuizAnswer(selectedIdx) {
    if (!currentQuestionObj) return;
    const isCorrect = (selectedIdx === currentQuestionObj.correct);

    document.getElementById('quizQuestionContainer').classList.add('hidden');
    const feedbackEl = document.getElementById('quizMemeFeedback');
    feedbackEl.classList.remove('hidden');

    const visualEl = document.getElementById('memeCardVisual');
    const badgeEl = document.getElementById('memeBadge');
    const headEl = document.getElementById('memeHeadline');
    const subEl = document.getElementById('memeSubtext');

    if (isCorrect) {
        SoundFX.correct();

        // Game-specific reward logic!
        if (currentGameType === 'tower') {
            GameState.jumpPoints += 2;
            updatePointsHUD();
        } else if (currentGameType === 'maze') {
            MazeState.turboEnergy += 2;
            unlockNearbyMazeGate();
            updatePointsHUD();
        } else if (currentGameType === 'galaxy') {
            GalaxyState.myBatteries += 15;
            GalaxyState.myPullPower += 15;
            if (typeof applyGalaxyPull === 'function') {
                applyGalaxyPull(GalaxyState.myTeam || 'solar', 15, currentStudentName);
            }
            NetworkManager.sendGalaxyPull(GalaxyState.myTeam || 'solar', 15, currentStudentName);
        } else if (currentGameType === 'raid') {
            if (typeof triggerBossStrikeFromQuiz === 'function') {
                triggerBossStrikeFromQuiz();
            }
        }

        const meme = MEMES_CORRECT[Math.floor(Math.random() * MEMES_CORRECT.length)];
        visualEl.className = `mx-auto w-44 h-44 rounded-3xl bg-gradient-to-br ${meme.bg} flex items-center justify-center mb-4 border-4 shadow-2xl`;
        visualEl.innerHTML = meme.svg;
        badgeEl.className = 'inline-block px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
        badgeEl.textContent = meme.badge;
        headEl.textContent = meme.headline;
        headEl.className = 'font-display text-2xl sm:text-3xl font-bold text-emerald-300 mb-1';
        subEl.textContent = meme.subtext;
    } else {
        SoundFX.wrong();
        const meme = MEMES_WRONG[Math.floor(Math.random() * MEMES_WRONG.length)];
        visualEl.className = `mx-auto w-44 h-44 rounded-3xl bg-gradient-to-br ${meme.bg} flex items-center justify-center mb-4 border-4 shadow-2xl`;
        visualEl.innerHTML = meme.svg;
        badgeEl.className = 'inline-block px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-rose-500/20 text-rose-300 border border-rose-400/40';
        badgeEl.textContent = meme.badge;
        headEl.textContent = meme.headline;
        headEl.className = 'font-display text-2xl sm:text-3xl font-bold text-rose-300 mb-1';
        subEl.textContent = meme.subtext;
    }

    sendLocalStudentProgress(true);
    syncStudentWithRoom();
}


// =====================================================================
// GAME 1: TOWER OF QUIZ ENGINE
// =====================================================================
const TOWER_CONFIG = {
    virtualWidth: 800,
    totalPlatforms: 25,
    platformSpacingY: 115,
    gravity: 0.58,
    moveSpeed: 5.4,
    jumpVelocity: -14.8
};

const GameState = {
    paused: false,
    gameEnded: false,
    jumpPoints: 0,
    maxHeightMeters: 0,
    reachedSummit: false,
    platformSeed: 12345,
    cameraY: 0,
    lavaY: 140,
    platforms: [],
    particles: [],
    player: {
        x: 380,
        y: 0,
        w: 34,
        h: 42,
        vx: 0,
        vy: 0,
        onGround: false,
        facing: 1,
        color: '#38bdf8'
    },
    checkpoint: { x: 380, y: 0, index: 0 },
    keys: { left: false, right: false }
};

function initTowerGame(seed = 12345) {
    GameState.paused = false;
    GameState.gameEnded = false;
    GameState.jumpPoints = 0;
    GameState.maxHeightMeters = 0;
    GameState.reachedSummit = false;
    GameState.particles = [];
    GameState.platformSeed = seed;
    GameState.player.color = getAvatarColor(currentStudentId);

    buildTowerPlatforms(seed);

    const base = GameState.platforms[0];
    GameState.player.x = base.x + base.w / 2 - GameState.player.w / 2;
    GameState.player.y = base.y - GameState.player.h;
    GameState.player.vx = 0;
    GameState.player.vy = 0;
    GameState.player.onGround = true;
    GameState.checkpoint = { x: GameState.player.x, y: GameState.player.y, index: 0 };
    GameState.cameraY = GameState.player.y - 450;
    GameState.lavaY = base.y + 130;

    updatePointsHUD();
    updateHeightHUD();

    const btnRespawn = document.getElementById('btnRespawn');
    if (btnRespawn) btnRespawn.classList.remove('respawn-urgent');
}

function buildTowerPlatforms(seed = 12345) {
    const rand = createMulberry32(seed);
    const plats = [];
    const neonPalette = [
        { fill: '#ec4899', glow: '#f472b6' },
        { fill: '#06b6d4', glow: '#22d3ee' },
        { fill: '#a855f7', glow: '#c084fc' },
        { fill: '#f59e0b', glow: '#fbbf24' },
        { fill: '#10b981', glow: '#34d399' }
    ];

    plats.push({
        index: 0,
        x: 120,
        y: 0,
        w: 560,
        h: 26,
        type: 'start',
        color: '#6366f1',
        glow: '#818cf8',
        vx: 0
    });

    let prevX = 330;
    for (let i = 1; i <= TOWER_CONFIG.totalPlatforms; i++) {
        const y = -i * TOWER_CONFIG.platformSpacingY;
        const isSummit = (i === TOWER_CONFIG.totalPlatforms);
        const isCheckpoint = (!isSummit && i % 5 === 0);

        let w = isSummit ? 480 : (isCheckpoint ? 240 : Math.max(125, 195 - i * 2));
        const maxShift = 210;
        let minX = Math.max(70, prevX - maxShift);
        let maxX = Math.min(TOWER_CONFIG.virtualWidth - 70 - w, prevX + maxShift);
        let x = isSummit ? (TOWER_CONFIG.virtualWidth - w) / 2 : (minX + rand() * Math.max(10, maxX - minX));
        prevX = x;

        const theme = isSummit ? { fill: '#facc15', glow: '#fef08a' } : isCheckpoint ? neonPalette[4] : neonPalette[i % 4];
        let vx = 0;
        if (!isSummit && !isCheckpoint && i >= 7 && i % 3 === 0) {
            vx = (i % 2 === 0 ? 1 : -1) * (1.2 + Math.min(1.5, i * 0.05));
        }

        plats.push({
            index: i,
            x: x,
            y: y,
            w: w,
            h: isSummit ? 30 : 20,
            type: isSummit ? 'summit' : (isCheckpoint ? 'checkpoint' : 'normal'),
            color: theme.fill,
            glow: theme.glow,
            vx: vx,
            checkpointReached: false
        });
    }
    GameState.platforms = plats;
}

function attemptPlayerJump() {
    if (GameState.paused || GameState.gameEnded) return;
    const p = GameState.player;
    if (!p.onGround) return;

    if (GameState.jumpPoints > 0) {
        GameState.jumpPoints--;
        p.vy = TOWER_CONFIG.jumpVelocity;
        p.onGround = false;
        SoundFX.jump();
        spawnParticles(p.x + p.w / 2, p.y + p.h, p.color, 8);
        updatePointsHUD();
    } else {
        SoundFX.noPoints();
        showToast('⚠️ Poin Lompatan Habis! Klik tombol "Jawab Soal" di bawah untuk mendapatkan +2 Poin!', 'warning');
        const qBtn = document.getElementById('btnOpenQuiz');
        if (qBtn) {
            qBtn.classList.add('animate-bounce');
            setTimeout(() => qBtn.classList.remove('animate-bounce'), 1000);
        }
    }
}

function triggerRespawn() {
    if (GameState.gameEnded) return;
    const p = GameState.player;
    p.x = GameState.checkpoint.x;
    p.y = GameState.checkpoint.y;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    SoundFX.respawn();
    spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#f43f5e', 14);
    showToast('Respawn ke Checkpoint Terakhir!', 'info');
    document.getElementById('btnRespawn').classList.remove('respawn-urgent');
}

function updatePointsHUD() {
    const el = document.getElementById('hudJumpPoints');
    if (!el) return;
    if (currentGameType === 'tower') el.textContent = GameState.jumpPoints;
    else if (currentGameType === 'maze') el.textContent = MazeState.turboEnergy;
    else if (currentGameType === 'galaxy') el.textContent = `${GalaxyState.myBatteries} MW`;
    else if (currentGameType === 'raid') el.textContent = RaidState.myTotalDamage;
}

function updateHeightHUD() {
    const el = document.getElementById('hudHeightText');
    const bar = document.getElementById('hudProgressBar');
    if (!el || !bar) return;
    el.textContent = `${GameState.maxHeightMeters}m`;
    bar.style.width = `${Math.min(100, GameState.maxHeightMeters)}%`;
}

function updateTowerPhysics() {
    if (GameState.paused || GameState.gameEnded) return;
    const p = GameState.player;

    if (GameState.keys.left) {
        p.vx = -TOWER_CONFIG.moveSpeed;
        p.facing = -1;
    } else if (GameState.keys.right) {
        p.vx = TOWER_CONFIG.moveSpeed;
        p.facing = 1;
    } else {
        p.vx *= 0.78;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
    }

    p.vy += TOWER_CONFIG.gravity;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 30) { p.x = 30; p.vx = 0; }
    if (p.x + p.w > TOWER_CONFIG.virtualWidth - 30) {
        p.x = TOWER_CONFIG.virtualWidth - 30 - p.w;
        p.vx = 0;
    }

    p.onGround = false;
    for (let i = 0; i < GameState.platforms.length; i++) {
        const plat = GameState.platforms[i];
        if (plat.vx !== 0) {
            plat.x += plat.vx;
            if (plat.x < 50 || plat.x + plat.w > TOWER_CONFIG.virtualWidth - 50) {
                plat.vx = -plat.vx;
            }
        }

        const prevY = p.y - p.vy;
        if (p.vy > 0 && (prevY + p.h <= plat.y + 8) && (p.y + p.h >= plat.y) && (p.x + p.w > plat.x + 4) && (p.x < plat.x + plat.w - 4)) {
            p.y = plat.y - p.h;
            p.vy = 0;
            p.onGround = true;
            if (plat.vx !== 0) p.x += plat.vx;

            if (plat.type === 'checkpoint' && !plat.checkpointReached) {
                plat.checkpointReached = true;
                GameState.checkpoint = { x: plat.x + plat.w / 2 - p.w / 2, y: plat.y - p.h, index: plat.index };
                SoundFX.checkpoint();
                spawnParticles(plat.x + plat.w / 2, plat.y, '#10b981', 20);
                const banner = document.getElementById('checkpointBanner');
                if (banner) {
                    banner.classList.remove('hidden');
                    setTimeout(() => banner.classList.add('hidden'), 2000);
                }
            }

            if (plat.type === 'summit' && !GameState.reachedSummit) {
                GameState.reachedSummit = true;
                SoundFX.victory();
                spawnParticles(p.x + p.w / 2, p.y, '#facc15', 35);
                triggerEndGameModal(true);
            }
        }
    }

    const summitY = -TOWER_CONFIG.totalPlatforms * TOWER_CONFIG.platformSpacingY;
    const currentHeight = Math.max(0, Math.min(100, Math.round(((0 - p.y) / (0 - summitY)) * 100)));
    if (currentHeight > GameState.maxHeightMeters) {
        GameState.maxHeightMeters = currentHeight;
        updateHeightHUD();
    }

    const targetCameraY = p.y - 420;
    GameState.cameraY += (targetCameraY - GameState.cameraY) * 0.1;

    const basePlatform = GameState.platforms[0];
    if (p.y > basePlatform.y + 60) {
        p.y = GameState.checkpoint.y;
        p.x = GameState.checkpoint.x;
        p.vx = 0;
        p.vy = 0;
        SoundFX.respawn();
        showToast('Jatuh ke dasar! Kembali ke checkpoint.', 'warning');
    }

    for (let i = GameState.particles.length - 1; i >= 0; i--) {
        const pt = GameState.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.025;
        if (pt.alpha <= 0) GameState.particles.splice(i, 1);
    }
}

function drawTowerScene() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / TOWER_CONFIG.virtualWidth;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(0, -GameState.cameraY);

    // Tower walls background
    const viewTop = GameState.cameraY - 100;
    const viewBottom = GameState.cameraY + canvas.height / scale + 100;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, viewTop, TOWER_CONFIG.virtualWidth, viewBottom - viewTop);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridStep = 60;
    const startY = Math.floor(viewTop / gridStep) * gridStep;
    for (let y = startY; y < viewBottom; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(TOWER_CONFIG.virtualWidth - 30, y);
        ctx.stroke();
    }

    // Border pillars
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, viewTop, 30, viewBottom - viewTop);
    ctx.fillRect(TOWER_CONFIG.virtualWidth - 30, viewTop, 30, viewBottom - viewTop);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, viewTop); ctx.lineTo(30, viewBottom);
    ctx.moveTo(TOWER_CONFIG.virtualWidth - 30, viewTop); ctx.lineTo(TOWER_CONFIG.virtualWidth - 30, viewBottom);
    ctx.stroke();

    // Platforms
    GameState.platforms.forEach(plat => {
        if (plat.y + plat.h < viewTop || plat.y > viewBottom) return;
        ctx.shadowColor = plat.glow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = plat.color;
        roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 8);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        roundRect(ctx, plat.x + 3, plat.y + 2, plat.w - 6, 4, 3);
        ctx.fill();

        if (plat.type === 'checkpoint') {
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 12px Fredoka, sans-serif';
            ctx.fillText('🚩 CHECKPOINT', plat.x + plat.w / 2 - 44, plat.y - 8);
        } else if (plat.type === 'summit') {
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 15px Fredoka, sans-serif';
            ctx.fillText('🏆 PUNCAK TOWER OF QUIZ 🏆', plat.x + plat.w / 2 - 105, plat.y - 12);
        }
    });

    // Other classmates
    Object.values(NetworkManager.otherPlayers).forEach(op => {
        if (op.targetX !== undefined) {
            op.x += (op.targetX - op.x) * 0.2;
            op.y += (op.targetY - op.y) * 0.2;
        }
        drawPlayerAvatar(ctx, op.x, op.y, op.facing, op.color || '#ec4899', op.name, false);
    });

    // Local player
    const p = GameState.player;
    drawPlayerAvatar(ctx, p.x, p.y, p.facing, p.color, currentStudentName, true);

    // Particles
    GameState.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore();
}

function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        GameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.7) * 7,
            size: Math.random() * 4 + 2,
            color: color,
            alpha: 1
        });
    }
}

// =====================================================================
// GAME 2: CYBER MAZE RACE ENGINE
// =====================================================================
const MazeState = {
    paused: false,
    gameEnded: false,
    turboEnergy: 2,
    progress: 0,
    reachedCore: false,
    cols: 15,
    rows: 11,
    cellSize: 75,
    grid: [],
    gates: [],
    core: { x: 0, y: 0, radius: 26 },
    player: {
        x: 100,
        y: 100,
        radius: 16,
        vx: 0,
        vy: 0,
        speed: 4.2,
        turboTimer: 0,
        facing: 1,
        color: '#06b6d4'
    },
    cameraX: 0,
    cameraY: 0,
    keys: { left: false, right: false, up: false, down: false },
    particles: []
};

function initMazeGame(seed = 12345) {
    MazeState.paused = false;
    MazeState.gameEnded = false;
    MazeState.turboEnergy = 2;
    MazeState.progress = 0;
    MazeState.reachedCore = false;
    MazeState.particles = [];
    MazeState.player.color = getAvatarColor(currentStudentId) || '#06b6d4';

    generateCyberMaze(seed);

    // Spawn player at (1, 1) cell center
    const startX = 1.5 * MazeState.cellSize;
    const startY = 1.5 * MazeState.cellSize;
    MazeState.player.x = startX;
    MazeState.player.y = startY;
    MazeState.player.vx = 0;
    MazeState.player.vy = 0;
    MazeState.player.turboTimer = 0;
    MazeState.cameraX = startX;
    MazeState.cameraY = startY;

    updatePointsHUD();
    updateHeightHUD();
}

function generateCyberMaze(seed = 12345) {
    const rand = createMulberry32(seed);
    const cols = MazeState.cols;
    const rows = MazeState.rows;
    const grid = [];

    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = {
                r, c,
                visited: false,
                top: true, right: true, bottom: true, left: true
            };
        }
    }

    // Depth-First Search with backtracking
    const stack = [];
    const startCell = grid[1][1];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
        const curr = stack[stack.length - 1];
        const neighbors = [];

        // Check top
        if (curr.r > 1 && !grid[curr.r - 1][curr.c].visited) neighbors.push({ cell: grid[curr.r - 1][curr.c], dir: 'top' });
        // Check right
        if (curr.c < cols - 2 && !grid[curr.r][curr.c + 1].visited) neighbors.push({ cell: grid[curr.r][curr.c + 1], dir: 'right' });
        // Check bottom
        if (curr.r < rows - 2 && !grid[curr.r + 1][curr.c].visited) neighbors.push({ cell: grid[curr.r + 1][curr.c], dir: 'bottom' });
        // Check left
        if (curr.c > 1 && !grid[curr.r][curr.c - 1].visited) neighbors.push({ cell: grid[curr.r][curr.c - 1], dir: 'left' });

        if (neighbors.length > 0) {
            const nextIdx = Math.floor(rand() * neighbors.length);
            const { cell: next, dir } = neighbors[nextIdx];

            if (dir === 'top') { curr.top = false; next.bottom = false; }
            else if (dir === 'right') { curr.right = false; next.left = false; }
            else if (dir === 'bottom') { curr.bottom = false; next.top = false; }
            else if (dir === 'left') { curr.left = false; next.right = false; }

            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    MazeState.grid = grid;

    // Cyber Core at (cols - 2, rows - 2)
    const coreR = rows - 2;
    const coreC = cols - 2;
    MazeState.core = {
        r: coreR,
        c: coreC,
        x: (coreC + 0.5) * MazeState.cellSize,
        y: (coreR + 0.5) * MazeState.cellSize,
        radius: 26
    };

    // Strategic Laser Firewall Gates
    MazeState.gates = [
        { id: 1, x: 4.5 * MazeState.cellSize, y: 3.5 * MazeState.cellSize, w: 60, h: 14, unlocked: false, color: '#f43f5e' },
        { id: 2, x: 8.5 * MazeState.cellSize, y: 5.5 * MazeState.cellSize, w: 14, h: 60, unlocked: false, color: '#f59e0b' },
        { id: 3, x: 11.5 * MazeState.cellSize, y: 7.5 * MazeState.cellSize, w: 60, h: 14, unlocked: false, color: '#f43f5e' }
    ];
}

function attemptMazeTurbo() {
    if (MazeState.paused || MazeState.gameEnded) return;
    if (MazeState.turboEnergy > 0) {
        MazeState.turboEnergy--;
        MazeState.player.turboTimer = 160; // ~2.6s
        SoundFX.turbo();
        updatePointsHUD();
        showToast('⚡ TURBO BOOST DIAKTIFKAN!', 'success');
    } else {
        SoundFX.noPoints();
        showToast('⚠️ Poin Turbo Habis! Klik "Buka Gerbang / Kuis" untuk mendapatkan +2 Turbo!', 'warning');
    }
}

function unlockNearbyMazeGate() {
    const p = MazeState.player;
    let unlockedAny = false;
    MazeState.gates.forEach(g => {
        const dist = Math.hypot(p.x - g.x, p.y - g.y);
        if (dist < 140 && !g.unlocked) {
            g.unlocked = true;
            unlockedAny = true;
            SoundFX.gateUnlock();
            spawnMazeParticles(g.x, g.y, '#10b981', 18);
            showToast('🔓 Gerbang Firewall Berhasil Diretas!', 'success');
        }
    });
    if (!unlockedAny) {
        showToast('⚡ +2 Turbo Boost Didapatkan!', 'success');
    }
}

function updateMazePhysics() {
    if (MazeState.paused || MazeState.gameEnded) return;
    const p = MazeState.player;

    const currentSpeed = p.turboTimer > 0 ? 8.2 : p.speed;
    if (p.turboTimer > 0) p.turboTimer--;

    let moveX = 0;
    let moveY = 0;
    if (MazeState.keys.left) moveX -= 1;
    if (MazeState.keys.right) moveX += 1;
    if (MazeState.keys.up) moveY -= 1;
    if (MazeState.keys.down) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
    }

    p.vx = moveX * currentSpeed;
    p.vy = moveY * currentSpeed;
    if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;

    // Circle collision with maze walls
    const cs = MazeState.cellSize;
    const newX = p.x + p.vx;
    const newY = p.y + p.vy;

    // Test X motion
    if (!checkMazeWallCollision(newX, p.y, p.radius)) {
        p.x = newX;
    }
    // Test Y motion
    if (!checkMazeWallCollision(p.x, newY, p.radius)) {
        p.y = newY;
    }

    // Laser Gate Collision
    MazeState.gates.forEach(g => {
        if (!g.unlocked) {
            if (Math.abs(p.x - g.x) < (p.radius + g.w / 2) && Math.abs(p.y - g.y) < (p.radius + g.h / 2)) {
                // Bounce back slightly
                p.x -= p.vx * 1.2;
                p.y -= p.vy * 1.2;
                SoundFX.wrong();
                showToast('🛑 Gerbang Terkunci! Jawab kuis untuk meretas!', 'warning');
            }
        }
    });

    // Distance to core
    const startDist = Math.hypot(MazeState.core.x - 1.5 * cs, MazeState.core.y - 1.5 * cs);
    const currDist = Math.hypot(MazeState.core.x - p.x, MazeState.core.y - p.y);
    const pct = Math.max(0, Math.min(100, Math.round((1 - (currDist / startDist)) * 100)));
    MazeState.progress = pct;

    // Check Core Finish
    if (currDist < (p.radius + MazeState.core.radius) && !MazeState.reachedCore) {
        MazeState.reachedCore = true;
        MazeState.progress = 100;
        SoundFX.victory();
        spawnMazeParticles(p.x, p.y, '#facc15', 30);
        triggerEndGameModal(true);
    }

    // Smooth camera tracking
    MazeState.cameraX += (p.x - MazeState.cameraX) * 0.12;
    MazeState.cameraY += (p.y - MazeState.cameraY) * 0.12;

    // Speed particles
    if (p.turboTimer > 0 && Math.random() < 0.6) {
        spawnMazeParticles(p.x, p.y, '#38bdf8', 2);
    }

    // Particles update
    for (let i = MazeState.particles.length - 1; i >= 0; i--) {
        const pt = MazeState.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.03;
        if (pt.alpha <= 0) MazeState.particles.splice(i, 1);
    }
}

function checkMazeWallCollision(x, y, radius) {
    const cs = MazeState.cellSize;
    const c = Math.floor(x / cs);
    const r = Math.floor(y / cs);

    if (r < 0 || r >= MazeState.rows || c < 0 || c >= MazeState.cols) return true;
    const cell = MazeState.grid[r] && MazeState.grid[r][c];
    if (!cell) return true;

    const cellLeft = c * cs;
    const cellRight = (c + 1) * cs;
    const cellTop = r * cs;
    const cellBottom = (r + 1) * cs;

    if (cell.top && (y - radius < cellTop + 4)) return true;
    if (cell.bottom && (y + radius > cellBottom - 4)) return true;
    if (cell.left && (x - radius < cellLeft + 4)) return true;
    if (cell.right && (x + radius > cellRight - 4)) return true;

    return false;
}

function drawMazeScene() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center view on player
    ctx.translate(canvas.width / 2 - MazeState.cameraX, canvas.height / 2 - MazeState.cameraY);

    const cs = MazeState.cellSize;
    const totalW = MazeState.cols * cs;
    const totalH = MazeState.rows * cs;

    // Dark grid background
    ctx.fillStyle = '#060b17';
    ctx.fillRect(0, 0, totalW, totalH);

    // Neon circuit lines
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= totalW; x += cs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, totalH); ctx.stroke();
    }
    for (let y = 0; y <= totalH; y += cs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(totalW, y); ctx.stroke();
    }

    // Draw Walls
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;

    for (let r = 0; r < MazeState.rows; r++) {
        for (let c = 0; c < MazeState.cols; c++) {
            const cell = MazeState.grid[r][c];
            const x1 = c * cs;
            const y1 = r * cs;
            const x2 = (c + 1) * cs;
            const y2 = (r + 1) * cs;

            ctx.beginPath();
            if (cell.top) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); }
            if (cell.right) { ctx.moveTo(x2, y1); ctx.lineTo(x2, y2); }
            if (cell.bottom) { ctx.moveTo(x1, y2); ctx.lineTo(x2, y2); }
            if (cell.left) { ctx.moveTo(x1, y1); ctx.lineTo(x1, y2); }
            ctx.stroke();
        }
    }
    ctx.shadowBlur = 0;

    // Laser Gates
    MazeState.gates.forEach(g => {
        ctx.save();
        if (g.unlocked) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            roundRect(ctx, g.x - g.w / 2, g.y - g.h / 2, g.w, g.h, 4);
            ctx.fill(); ctx.stroke();
        } else {
            ctx.shadowColor = g.color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = g.color;
            roundRect(ctx, g.x - g.w / 2, g.y - g.h / 2, g.w, g.h, 4);
            ctx.fill();

            // Laser beam animation
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (g.w > g.h) {
                ctx.moveTo(g.x - g.w / 2, g.y);
                ctx.lineTo(g.x + g.w / 2, g.y);
            } else {
                ctx.moveTo(g.x, g.y - g.h / 2);
                ctx.lineTo(g.x, g.y + g.h / 2);
            }
            ctx.stroke();
        }
        ctx.restore();
    });

    // Cyber Data Core (Finish)
    const core = MazeState.core;
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.radius, 0, Math.PI * 2);
    ctx.fill();

    // Rotating pulse ring
    const pulse = (Date.now() / 300) % (Math.PI * 2);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.radius + 6 + Math.sin(pulse) * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁', core.x, core.y + 6);
    ctx.restore();

    // Classmate Racers
    Object.values(NetworkManager.otherPlayers).forEach(op => {
        if (op.targetX !== undefined) {
            op.x += (op.targetX - op.x) * 0.2;
            op.y += (op.targetY - op.y) * 0.2;
        }
        drawRacerAvatar(ctx, op.x, op.y, op.color || '#ec4899', op.name, false);
    });

    // Local Player Racer
    const p = MazeState.player;
    drawRacerAvatar(ctx, p.x, p.y, p.color, currentStudentName, true, p.turboTimer > 0);

    // Particles
    MazeState.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore();

    // Floating Radar / Minimap on Top-Right Corner
    drawMazeMinimap();
}

function drawRacerAvatar(ctx, x, y, color, name, isLocal, isTurbo = false) {
    ctx.save();
    ctx.shadowColor = isTurbo ? '#38bdf8' : color;
    ctx.shadowBlur = isTurbo ? 18 : 10;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 3, y - 2, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(x + 4, y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Name tag
    ctx.shadowBlur = 0;
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, x, y - 22);

    if (isTurbo) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('⚡ TURBO', x, y + 26);
    }
    ctx.restore();
}

function drawMazeMinimap() {
    if (!canvas || !ctx) return;
    const pad = 12;
    const mapW = 120;
    const mapH = 90;
    const mapX = canvas.width - mapW - pad;
    const mapY = 12;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    roundRect(ctx, mapX, mapY, mapW, mapH, 10);
    ctx.fill(); ctx.stroke();

    const cs = MazeState.cellSize;
    const totalW = MazeState.cols * cs;
    const totalH = MazeState.rows * cs;
    const scaleX = mapW / totalW;
    const scaleY = mapH / totalH;

    // Core icon on minimap
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(mapX + MazeState.core.x * scaleX, mapY + MazeState.core.y * scaleY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Other players on minimap
    Object.values(NetworkManager.otherPlayers).forEach(op => {
        ctx.fillStyle = op.color || '#ec4899';
        ctx.beginPath();
        ctx.arc(mapX + (op.x || 0) * scaleX, mapY + (op.y || 0) * scaleY, 2.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Local player on minimap (pulsing green dot)
    const p = MazeState.player;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(mapX + p.x * scaleX, mapY + p.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function spawnMazeParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        MazeState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: Math.random() * 3 + 2,
            color: color,
            alpha: 1
        });
    }
}


// =====================================================================
// GAME 3: GALAXY TUG-OF-WAR ENGINE
// =====================================================================
const GalaxyState = {
    paused: false,
    gameEnded: false,
    galaxySeed: 12345,
    myTeam: 'solar', // 'solar' (Cyan) | 'nebula' (Magenta)
    myBatteries: 15,
    myPullPower: 0,
    corePos: 0, // -100 (Solar win) to +100 (Nebula win)
    solarPower: 0,
    nebulaPower: 0,
    stars: [],
    particles: [],
    shake: 0
};

function initGalaxyGame(seed = 12345) {
    GalaxyState.paused = false;
    GalaxyState.gameEnded = false;
    GalaxyState.galaxySeed = seed;
    GalaxyState.myBatteries = 15;
    GalaxyState.myPullPower = 0;
    GalaxyState.corePos = 0;
    GalaxyState.solarPower = 0;
    GalaxyState.nebulaPower = 0;
    GalaxyState.particles = [];
    GalaxyState.shake = 0;

    // Auto-balance or inherit team
    const room = getRoomData(currentRoomCode);
    if (room && room.students && room.students[currentStudentId] && room.students[currentStudentId].team) {
        GalaxyState.myTeam = room.students[currentStudentId].team;
    } else {
        GalaxyState.myTeam = Math.random() < 0.5 ? 'solar' : 'nebula';
    }

    // Generate 120 starfield stars
    GalaxyState.stars = [];
    for (let i = 0; i < 120; i++) {
        GalaxyState.stars.push({
            x: Math.random() * 1200,
            y: Math.random() * 800,
            size: Math.random() * 2.2 + 0.5,
            speed: Math.random() * 0.6 + 0.2,
            alpha: Math.random() * 0.8 + 0.2
        });
    }

    updatePointsHUD();
    updateHeightHUD();
}

function attemptGalaxyPull() {
    if (GalaxyState.paused || GalaxyState.gameEnded) return;
    const pullAmount = GalaxyState.myBatteries >= 5 ? 12 : 5;
    if (GalaxyState.myBatteries >= 5) {
        GalaxyState.myBatteries -= 5;
    }
    GalaxyState.myPullPower += pullAmount;

    applyGalaxyPull(GalaxyState.myTeam, pullAmount, currentStudentName);
    NetworkManager.sendGalaxyPull(GalaxyState.myTeam, pullAmount, currentStudentName);

    SoundFX.tugPull();
    GalaxyState.shake = 6;
    updatePointsHUD();
    showToast(`🚀 Tarikan ${pullAmount} MW dilepaskan!`, 'info');
}

function applyGalaxyPull(team, amount, studentName) {
    if (team === 'solar') {
        GalaxyState.solarPower += amount;
        spawnGalaxyParticles(canvas ? canvas.width * 0.25 : 200, canvas ? canvas.height * 0.5 : 250, '#06b6d4', 8);
    } else {
        GalaxyState.nebulaPower += amount;
        spawnGalaxyParticles(canvas ? canvas.width * 0.75 : 600, canvas ? canvas.height * 0.5 : 250, '#ec4899', 8);
    }
}

function updateGalaxyPhysics() {
    if (GalaxyState.paused || GalaxyState.gameEnded) return;

    // Drift starfield
    GalaxyState.stars.forEach(s => {
        s.x -= s.speed;
        if (s.x < 0) s.x = (canvas ? canvas.width : 1000) + 20;
    });

    // Core shift from pull force
    const netForce = GalaxyState.nebulaPower - GalaxyState.solarPower;
    GalaxyState.corePos += netForce * 0.05;

    // Natural cosmic dampening
    GalaxyState.solarPower *= 0.94;
    GalaxyState.nebulaPower *= 0.94;

    // Clamp core position
    if (GalaxyState.corePos < -100) GalaxyState.corePos = -100;
    if (GalaxyState.corePos > 100) GalaxyState.corePos = 100;

    // Check Victory condition (-85 Solar win, +85 Nebula win)
    if (GalaxyState.corePos <= -85 && !GalaxyState.gameEnded) {
        GalaxyState.gameEnded = true;
        SoundFX.victory();
        triggerEndGameModal(GalaxyState.myTeam === 'solar');
    } else if (GalaxyState.corePos >= 85 && !GalaxyState.gameEnded) {
        GalaxyState.gameEnded = true;
        SoundFX.victory();
        triggerEndGameModal(GalaxyState.myTeam === 'nebula');
    }

    if (GalaxyState.shake > 0) GalaxyState.shake *= 0.9;

    // Particles update
    for (let i = GalaxyState.particles.length - 1; i >= 0; i--) {
        const pt = GalaxyState.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.03;
        if (pt.alpha <= 0) GalaxyState.particles.splice(i, 1);
    }
}

function drawGalaxyScene() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Screen shake
    if (GalaxyState.shake > 0.5) {
        const rx = (Math.random() - 0.5) * GalaxyState.shake;
        const ry = (Math.random() - 0.5) * GalaxyState.shake;
        ctx.translate(rx, ry);
    }

    const W = canvas.width;
    const H = canvas.height;

    // Deep cosmic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#040817');
    bgGrad.addColorStop(0.5, '#0b0f2a');
    bgGrad.addColorStop(1, '#15061e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Starfield
    GalaxyState.stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x % W, s.y % H, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    const centerY = H * 0.52;
    const centerCoreX = W * 0.5 + (GalaxyState.corePos / 100) * (W * 0.32);

    // Draw Solar Flagship (Left)
    const solarShipX = W * 0.14;
    ctx.save();
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(solarShipX - 70, centerY - 65);
    ctx.lineTo(solarShipX + 60, centerY);
    ctx.lineTo(solarShipX - 70, centerY + 65);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Engine thruster flames
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(solarShipX - 70, centerY - 25);
    ctx.lineTo(solarShipX - 100 - Math.random() * 20, centerY);
    ctx.lineTo(solarShipX - 70, centerY + 25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TIM SURYA (CYAN)', solarShipX, centerY - 80);
    ctx.restore();

    // Draw Nebula Dreadnought (Right)
    const nebulaShipX = W * 0.86;
    ctx.save();
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#1e112a';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(nebulaShipX + 70, centerY - 65);
    ctx.lineTo(nebulaShipX - 60, centerY);
    ctx.lineTo(nebulaShipX + 70, centerY + 65);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Engine thruster flames
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(nebulaShipX + 70, centerY - 25);
    ctx.lineTo(nebulaShipX + 100 + Math.random() * 20, centerY);
    ctx.lineTo(nebulaShipX + 70, centerY + 25);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌌 TIM NEBULA (MAGENTA)', nebulaShipX, centerY - 80);
    ctx.restore();

    // Tractor Plasma Beams to Quantum Core
    // Solar beam (Left -> Core)
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4 + (GalaxyState.solarPower > 0 ? 4 : 0);
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(solarShipX + 60, centerY);
    ctx.lineTo(centerCoreX, centerY);
    ctx.stroke();

    // Nebula beam (Right -> Core)
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4 + (GalaxyState.nebulaPower > 0 ? 4 : 0);
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(nebulaShipX - 60, centerY);
    ctx.lineTo(centerCoreX, centerY);
    ctx.stroke();
    ctx.restore();

    // Event Horizon Threshold Markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(W * 0.24, centerY - 120); ctx.lineTo(W * 0.24, centerY + 120);
    ctx.moveTo(W * 0.76, centerY - 120); ctx.lineTo(W * 0.76, centerY + 120);
    ctx.stroke();
    ctx.setLineDash([]);

    // Quantum Singularity Core (Center Orb)
    ctx.save();
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerCoreX, centerY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Rotating containment rings
    const rot = (Date.now() / 250);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerCoreX, centerY, 48, 18, rot, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(centerCoreX, centerY, 48, 18, -rot, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚛️', centerCoreX, centerY + 6);
    ctx.restore();

    // Large Tug-of-War Balance Gauge on top of canvas
    drawTugGauge(W, H);

    // Particles
    GalaxyState.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    ctx.restore();
}

function drawTugGauge(W, H) {
    const barW = Math.min(500, W * 0.65);
    const barH = 18;
    const barX = (W - barW) / 2;
    const barY = 25;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    roundRect(ctx, barX, barY, barW, barH, 9);
    ctx.fill(); ctx.stroke();

    const solarPct = Math.round(50 - (GalaxyState.corePos / 100) * 50);
    const splitX = barX + (solarPct / 100) * barW;

    // Solar bar
    ctx.fillStyle = '#06b6d4';
    roundRect(ctx, barX + 2, barY + 2, Math.max(0, splitX - barX - 2), barH - 4, 7);
    ctx.fill();

    // Nebula bar
    ctx.fillStyle = '#ec4899';
    roundRect(ctx, splitX, barY + 2, Math.max(0, barX + barW - splitX - 2), barH - 4, 7);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`KESEIMBANGAN INTI: ${solarPct}% SURYA • ${100 - solarPct}% NEBULA`, W / 2, barY + 34);
    ctx.restore();
}

function spawnGalaxyParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        GalaxyState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 3 + 2,
            color: color,
            alpha: 1
        });
    }
}

// =====================================================================
// GAME 4: NEON FISH RAID ENGINE
// =====================================================================
const RaidState = {
    paused: false,
    gameEnded: false,
    raidSeed: 12345,
    myTotalDamage: 0,
    fishCaught: 0,
    boss: {
        x: 400,
        y: 150,
        w: 220,
        h: 130,
        hp: 1000,
        maxHp: 1000,
        state: 'normal',
        hitTimer: 0,
        tentacleAngle: 0
    },
    harpoon: {
        active: false,
        x: 400,
        y: 500,
        targetX: 400,
        targetY: 300,
        state: 'idle', // 'idle' | 'shooting' | 'hooked' | 'reeling'
        hookedFish: null
    },
    fishes: [],
    torpedoes: [],
    damageTexts: [],
    bubbles: []
};

function initRaidGame(seed = 12345) {
    RaidState.paused = false;
    RaidState.gameEnded = false;
    RaidState.raidSeed = seed;
    RaidState.myTotalDamage = 0;
    RaidState.fishCaught = 0;

    const room = getRoomData(currentRoomCode);
    const existingHp = (room && room.raidState && room.raidState.bossHp) !== undefined ? room.raidState.bossHp : 1000;
    RaidState.boss.hp = existingHp;
    RaidState.boss.maxHp = 1000;
    RaidState.boss.hitTimer = 0;
    RaidState.torpedoes = [];
    RaidState.damageTexts = [];

    // Spawn 6 cyber fishes
    const rand = createMulberry32(seed);
    const fishTypes = [
        { type: 'salmon', name: 'Laser Salmon', color: '#06b6d4', damage: 35, speed: 2.2 },
        { type: 'jelly', name: 'Shock Jellyfish', color: '#a855f7', damage: 50, speed: 1.6 },
        { type: 'shark', name: 'Plasma Shark', color: '#f43f5e', damage: 80, speed: 2.8 },
        { type: 'whale', name: 'Golden Whale', color: '#facc15', damage: 120, speed: 1.2 }
    ];

    RaidState.fishes = [];
    for (let i = 0; i < 6; i++) {
        const ft = fishTypes[i % fishTypes.length];
        RaidState.fishes.push({
            id: i,
            type: ft.type,
            name: ft.name,
            color: ft.color,
            damage: ft.damage,
            x: 80 + i * 130,
            y: 280 + (i % 3) * 60,
            vx: (i % 2 === 0 ? 1 : -1) * ft.speed,
            w: ft.type === 'whale' ? 65 : 44,
            h: 24
        });
    }

    // 40 Ocean Bubbles
    RaidState.bubbles = [];
    for (let i = 0; i < 40; i++) {
        RaidState.bubbles.push({
            x: Math.random() * 900,
            y: Math.random() * 700,
            r: Math.random() * 4 + 1.5,
            vy: Math.random() * 1.5 + 0.5
        });
    }

    updatePointsHUD();
    updateHeightHUD();
}

function castFishingLine(targetX, targetY) {
    if (RaidState.paused || RaidState.gameEnded) return;
    const hp = RaidState.harpoon;
    if (hp.state !== 'idle') return;

    hp.active = true;
    hp.x = canvas ? canvas.width / 2 : 400;
    hp.y = canvas ? canvas.height - 40 : 560;
    hp.targetX = targetX;
    hp.targetY = targetY;
    hp.state = 'shooting';

    SoundFX.fishStrike();
}

function triggerRaidShield() {
    showToast('🛡️ Tameng Cyber Aktif!', 'info');
}

function triggerBossStrikeFromQuiz() {
    const hooked = RaidState.harpoon.hookedFish;
    const dmg = hooked ? hooked.damage : 45;
    const fName = hooked ? hooked.name : 'Laser Salmon';

    RaidState.myTotalDamage += dmg;
    RaidState.fishCaught++;

    // Launch Torpedo from hook to Boss Mega-Red
    RaidState.torpedoes.push({
        x: RaidState.harpoon.x,
        y: RaidState.harpoon.y,
        targetX: canvas ? canvas.width / 2 : 400,
        targetY: 150,
        color: hooked ? hooked.color : '#06b6d4',
        damage: dmg,
        name: fName
    });

    RaidState.harpoon.state = 'idle';
    RaidState.harpoon.hookedFish = null;

    applyRaidDamage(dmg, currentStudentName, fName);
    NetworkManager.sendRaidDamage(dmg, currentStudentName, fName);
}

function applyRaidDamage(amount, studentName, fishType) {
    RaidState.boss.hp = Math.max(0, RaidState.boss.hp - amount);
    RaidState.boss.hitTimer = 16;
    SoundFX.bossHit();

    // Damage popup text
    RaidState.damageTexts.push({
        x: (canvas ? canvas.width / 2 : 400) + (Math.random() - 0.5) * 120,
        y: 140 + (Math.random() - 0.5) * 40,
        text: `-${amount} HP!`,
        sub: `${studentName} (${fishType})`,
        alpha: 1
    });

    if (RaidState.boss.hp <= 500 && RaidState.boss.state !== 'enraged') {
        RaidState.boss.state = 'enraged';
        SoundFX.bossRoar();
        showToast('🔥 BOSS MEGA-RED MEMASUKI FASE ENRAGED!', 'error');
    }

    if (RaidState.boss.hp <= 0 && !RaidState.gameEnded) {
        RaidState.boss.hp = 0;
        RaidState.gameEnded = true;
        SoundFX.victory();
        triggerEndGameModal(true);
    }
}

function updateRaidPhysics() {
    if (RaidState.paused || RaidState.gameEnded) return;

    // Bubbles
    const W = canvas ? canvas.width : 800;
    const H = canvas ? canvas.height : 600;
    RaidState.bubbles.forEach(b => {
        b.y -= b.vy;
        if (b.y < -10) b.y = H + 10;
    });

    // Boss animation
    RaidState.boss.tentacleAngle = Math.sin(Date.now() / 350) * 0.35;
    if (RaidState.boss.hitTimer > 0) RaidState.boss.hitTimer--;

    // Fish swim
    RaidState.fishes.forEach(f => {
        f.x += f.vx;
        if (f.x < 30 || f.x > W - 50) f.vx = -f.vx;
    });

    // Harpoon line
    const hp = RaidState.harpoon;
    if (hp.state === 'shooting') {
        const dx = hp.targetX - hp.x;
        const dy = hp.targetY - hp.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
            hp.x += (dx / dist) * 18;
            hp.y += (dy / dist) * 18;

            // Check collision with swimming fishes
            for (let i = 0; i < RaidState.fishes.length; i++) {
                const f = RaidState.fishes[i];
                if (Math.hypot(hp.x - f.x, hp.y - f.y) < 28) {
                    hp.state = 'hooked';
                    hp.hookedFish = f;
                    SoundFX.fishStrike();
                    showToast(`🐟 STRIKE! ${f.name} Tertangkap! Jawab soal untuk menyerang Boss!`, 'success');
                    openQuizModal();
                    break;
                }
            }
        } else {
            hp.state = 'idle';
        }
    }

    // Torpedoes
    for (let i = RaidState.torpedoes.length - 1; i >= 0; i--) {
        const tp = RaidState.torpedoes[i];
        const dx = tp.targetX - tp.x;
        const dy = tp.targetY - tp.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 20) {
            tp.x += (dx / dist) * 22;
            tp.y += (dy / dist) * 22;
        } else {
            RaidState.torpedoes.splice(i, 1);
        }
    }

    // Floating damage texts
    for (let i = RaidState.damageTexts.length - 1; i >= 0; i--) {
        const dt = RaidState.damageTexts[i];
        dt.y -= 1.2;
        dt.alpha -= 0.025;
        if (dt.alpha <= 0) RaidState.damageTexts.splice(i, 1);
    }
}

function drawRaidScene() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // Deep Underwater Ocean Gradient
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
    oceanGrad.addColorStop(0, '#04162e');
    oceanGrad.addColorStop(0.5, '#07244a');
    oceanGrad.addColorStop(1, '#020b18');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    // Sunlight Caustics rays
    ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(W * 0.15 * i, 0);
        ctx.lineTo(W * 0.15 * i + 80, H);
        ctx.lineTo(W * 0.15 * i + 140, H);
        ctx.lineTo(W * 0.15 * i + 40, 0);
        ctx.fill();
    }

    // Rising bubbles
    RaidState.bubbles.forEach(b => {
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x % W, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Draw Boss Mega-Red
    drawMegaRedBoss(W / 2, 140);

    // Swimming Cyber Fish
    RaidState.fishes.forEach(f => {
        ctx.save();
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = f.color;

        // Fish body
        ctx.beginPath();
        ctx.ellipse(f.x, f.y, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fish tail
        const tailDir = f.vx > 0 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(f.x + tailDir * (f.w / 2), f.y);
        ctx.lineTo(f.x + tailDir * (f.w / 2 + 14), f.y - 8);
        ctx.lineTo(f.x + tailDir * (f.w / 2 + 14), f.y + 8);
        ctx.closePath();
        ctx.fill();

        // Fish eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x - tailDir * (f.w / 3), f.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px Fredoka, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(f.name, f.x, f.y - 14);
        ctx.restore();
    });

    // Player Fishing Boat / Submarine at Bottom
    const subX = W / 2;
    const subY = H - 35;
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    roundRect(ctx, subX - 60, subY - 18, 120, 36, 12);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SUBMARINE SISWA', subX, subY + 5);
    ctx.restore();

    // Harpoon Line & Hook
    const hp = RaidState.harpoon;
    if (hp.state === 'shooting' || hp.state === 'hooked') {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(subX, subY);
        ctx.lineTo(hp.x, hp.y);
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Flying Torpedoes
    RaidState.torpedoes.forEach(tp => {
        ctx.save();
        ctx.shadowColor = tp.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = tp.color;
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Floating Damage Popups
    RaidState.damageTexts.forEach(dt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, dt.alpha);
        ctx.font = 'bold 22px Fredoka, sans-serif';
        ctx.fillStyle = '#f43f5e';
        ctx.textAlign = 'center';
        ctx.fillText(dt.text, dt.x, dt.y);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText(dt.sub, dt.x, dt.y + 16);
        ctx.restore();
    });
}

function drawMegaRedBoss(cx, cy) {
    const isHit = RaidState.boss.hitTimer > 0;
    const isEnraged = RaidState.boss.state === 'enraged';

    ctx.save();
    ctx.shadowColor = isHit ? '#ffffff' : (isEnraged ? '#ef4444' : '#f43f5e');
    ctx.shadowBlur = isEnraged ? 28 : 16;

    // Tentacles
    ctx.strokeStyle = isEnraged ? '#dc2626' : '#991b1b';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const tx = cx + i * 28;
        const angle = RaidState.boss.tentacleAngle * (i % 2 === 0 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(tx, cy + 20);
        ctx.quadraticCurveTo(tx + angle * 40, cy + 80, tx + angle * 25, cy + 130);
        ctx.stroke();
    }

    // Boss Main Body
    ctx.fillStyle = isHit ? '#ffffff' : (isEnraged ? '#7f1d1d' : '#881337');
    ctx.strokeStyle = isEnraged ? '#f87171' : '#f43f5e';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.ellipse(cx, cy, 95, 65, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Menacing Cyber Eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 8, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isEnraged ? '#fbbf24' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // Giant Boss Health Bar on top
    const barW = 280;
    const barH = 16;
    const barX = cx - barW / 2;
    const barY = cy - 90;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    roundRect(ctx, barX, barY, barW, barH, 8);
    ctx.fill(); ctx.stroke();

    const hpPct = Math.max(0, Math.min(1, RaidState.boss.hp / RaidState.boss.maxHp));
    ctx.fillStyle = isEnraged ? '#ef4444' : '#10b981';
    roundRect(ctx, barX + 2, barY + 2, (barW - 4) * hpPct, barH - 4, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`BOSS MEGA-RED: ${RaidState.boss.hp} / ${RaidState.boss.maxHp} HP`, cx, barY - 8);

    ctx.restore();
}


// =====================================================================
// UNIFIED GAME ENGINE LIFECYCLE & INPUT CONTROLLER
// =====================================================================
let canvas = null;
let ctx = null;
let animFrameId = null;

function initActiveGameEngine(seed = 12345) {
    canvas = document.getElementById('gameCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        resizeCanvas();
    }

    if (currentGameType === 'tower') {
        initTowerGame(seed);
    } else if (currentGameType === 'maze') {
        initMazeGame(seed);
    } else if (currentGameType === 'galaxy') {
        initGalaxyGame(seed);
    } else if (currentGameType === 'raid') {
        initRaidGame(seed);
    }

    if (animFrameId) cancelAnimationFrame(animFrameId);
    gameLoop();
}

function setGamePaused(isPaused) {
    if (currentGameType === 'tower') GameState.paused = isPaused;
    else if (currentGameType === 'maze') MazeState.paused = isPaused;
    else if (currentGameType === 'galaxy') GalaxyState.paused = isPaused;
    else if (currentGameType === 'raid') RaidState.paused = isPaused;
}

function getActiveGameEnded() {
    if (currentGameType === 'tower') return GameState.gameEnded;
    if (currentGameType === 'maze') return MazeState.gameEnded;
    if (currentGameType === 'galaxy') return GalaxyState.gameEnded;
    if (currentGameType === 'raid') return RaidState.gameEnded;
    return false;
}

function resetActiveGameState() {
    const room = getRoomData(currentRoomCode);
    const seed = room ? room.platformSeed : 12345;
    initActiveGameEngine(seed);
}

function triggerSpecialAction() {
    if (currentGameType === 'maze') attemptMazeTurbo();
    else if (currentGameType === 'galaxy') attemptGalaxyPull();
    else if (currentGameType === 'raid') triggerRaidShield();
}

function stopGameLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
}

function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);

function gameLoop() {
    if (currentGameType === 'tower') {
        updateTowerPhysics();
        drawTowerScene();
    } else if (currentGameType === 'maze') {
        updateMazePhysics();
        drawMazeScene();
    } else if (currentGameType === 'galaxy') {
        updateGalaxyPhysics();
        drawGalaxyScene();
    } else if (currentGameType === 'raid') {
        updateRaidPhysics();
        drawRaidScene();
    }
    animFrameId = requestAnimationFrame(gameLoop);
}

// Canvas tap/click listener for Neon Fish Raid
window.addEventListener('load', () => {
    const c = document.getElementById('gameCanvas');
    if (c) {
        c.addEventListener('pointerdown', (e) => {
            if (currentGameType === 'raid') {
                const rect = c.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                castFishingLine(clickX, clickY);
            }
        });
    }
});

// =====================================================================
// AVATAR RENDERING & HELPER UTILITIES
// =====================================================================
function drawPlayerAvatar(ctx, x, y, facing, color, name, isLocal) {
    ctx.save();
    const w = 34;
    const h = 42;

    if (isLocal) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
    }

    // Body
    ctx.fillStyle = color;
    roundRect(ctx, x, y + 10, w, h - 10, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Cap
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 8, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // Face / Eyes
    const eyeOffset = facing > 0 ? 3 : -3;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + w / 2 + eyeOffset - 3, y + 12, 2, 0, Math.PI * 2);
    ctx.arc(x + w / 2 + eyeOffset + 3, y + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + w / 2 + eyeOffset, y + 14, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Name tag floating
    ctx.shadowBlur = 0;
    ctx.font = 'bold 11px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isLocal ? '#38bdf8' : '#ffffff';
    ctx.fillText(name, x + w / 2, y - 8);

    if (isLocal) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y - 4);
        ctx.lineTo(x + w / 2 - 4, y - 7);
        ctx.lineTo(x + w / 2 + 4, y - 7);
        ctx.fill();
    }
    ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function triggerEndGameModal(isVictory) {
    setGamePaused(true);
    const modal = document.getElementById('endGameModal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const titleEl = document.getElementById('endGameTitle');
    const subEl = document.getElementById('endGameSubtitle');
    const trophyEl = document.getElementById('endGameTrophy');

    if (isVictory) {
        trophyEl.textContent = '🏆';
        titleEl.textContent = 'MISI SELESAI & MENANG!';
        subEl.textContent = `Luar biasa! Kamu dan tim berhasil menaklukkan ${GAME_DEFINITIONS[currentGameType].name}!`;
    } else {
        trophyEl.textContent = '⏱️';
        titleEl.textContent = 'WAKTU PERMAINAN HABIS!';
        subEl.textContent = 'Permainan telah berakhir. Kerja bagus untuk semua peserta!';
    }

    const room = getRoomData(currentRoomCode);
    const lbEl = document.getElementById('endGameLeaderboard');
    if (!room || !room.students) {
        lbEl.innerHTML = `<div class="text-slate-400 text-xs text-center py-4">Data permainan selesai tercatat.</div>`;
        return;
    }

    const studentsArr = Object.values(room.students);
    studentsArr.sort((a, b) => (b.points || b.damage || b.height || 0) - (a.points || a.damage || a.height || 0));

    lbEl.innerHTML = studentsArr.map((st, idx) => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
            <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'} flex items-center justify-center font-display">${idx + 1}</span>
                <span>${escapeHtml(st.name)}</span>
            </div>
            <span class="text-amber-300">${st.finished ? 'FINIS 🏆' : (st.height ? `${st.height}m` : (st.progress ? `${st.progress}%` : `${st.points || 0} Poin`))}</span>
        </div>
    `).join('');
}

function replayOrContinue() {
    document.getElementById('endGameModal').classList.add('hidden');
    resetActiveGameState();
    setGamePaused(false);
}

// =====================================================================
// UNIFIED KEYBOARD & TOUCH CONTROLS
// =====================================================================
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // Prevent default scrolling for game keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
        if (!document.getElementById('viewStudent').classList.contains('hidden') &&
            document.getElementById('quizModal').classList.contains('hidden')) {
            e.preventDefault();
        }
    }

    // Left
    if (key === 'a' || e.key === 'ArrowLeft') {
        GameState.keys.left = true;
        MazeState.keys.left = true;
    }
    // Right
    if (key === 'd' || e.key === 'ArrowRight') {
        GameState.keys.right = true;
        MazeState.keys.right = true;
    }
    // Up
    if (key === 'w' || e.key === 'ArrowUp') {
        MazeState.keys.up = true;
        if (currentGameType === 'tower') attemptPlayerJump();
    }
    // Down
    if (key === 's' || e.key === 'ArrowDown') {
        MazeState.keys.down = true;
    }

    // Space action
    if (e.key === ' ' || e.code === 'Space') {
        if (currentGameType === 'tower') attemptPlayerJump();
        else if (currentGameType === 'maze') attemptMazeTurbo();
        else if (currentGameType === 'galaxy') attemptGalaxyPull();
        else if (currentGameType === 'raid') castFishingLine(canvas ? canvas.width / 2 : 400, 320);
    }

    // Quiz shortcut
    if (key === 'enter' || key === 'q' || key === 'e') {
        if (document.getElementById('quizModal').classList.contains('hidden') &&
            !document.getElementById('viewStudent').classList.contains('hidden')) {
            openQuizModal();
        }
    }

    // Respawn shortcut (Tower)
    if (key === 'r' && currentGameType === 'tower') {
        triggerRespawn();
    }
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || e.key === 'ArrowLeft') {
        GameState.keys.left = false;
        MazeState.keys.left = false;
    }
    if (key === 'd' || e.key === 'ArrowRight') {
        GameState.keys.right = false;
        MazeState.keys.right = false;
    }
    if (key === 'w' || e.key === 'ArrowUp') {
        MazeState.keys.up = false;
    }
    if (key === 's' || e.key === 'ArrowDown') {
        MazeState.keys.down = false;
    }
});

function bindTouchHold(btnId, onDown, onUp) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onDown();
    });
    btn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        onUp();
    });
    btn.addEventListener('pointercancel', (e) => {
        e.preventDefault();
        onUp();
    });
}

function initTouchControls() {
    bindTouchHold('touchLeft', () => { GameState.keys.left = true; MazeState.keys.left = true; }, () => { GameState.keys.left = false; MazeState.keys.left = false; });
    bindTouchHold('touchRight', () => { GameState.keys.right = true; MazeState.keys.right = true; }, () => { GameState.keys.right = false; MazeState.keys.right = false; });
    bindTouchHold('touchUp', () => { MazeState.keys.up = true; }, () => { MazeState.keys.up = false; });
    bindTouchHold('touchDown', () => { MazeState.keys.down = true; }, () => { MazeState.keys.down = false; });

    const jumpBtn = document.getElementById('touchJump');
    if (jumpBtn) {
        jumpBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (currentGameType === 'tower') attemptPlayerJump();
            else if (currentGameType === 'maze') attemptMazeTurbo();
            else if (currentGameType === 'galaxy') attemptGalaxyPull();
            else if (currentGameType === 'raid') castFishingLine(canvas ? canvas.width / 2 : 400, 320);
        });
    }
}
window.addEventListener('DOMContentLoaded', initTouchControls);
setTimeout(initTouchControls, 500);

// =====================================================================
// GENERAL STRING & CLIPBOARD UTILITIES
// =====================================================================
function formatSeconds(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(str) {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(el);
}


