// ──────────────────────────────────────────────
// Firebase imports
// ──────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    onSnapshot,
    doc,
    serverTimestamp,
    deleteField,
    arrayUnion,
    Timestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ──────────────────────────────────────────────
// Firebase config
// ──────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyDPgwJeDcUnlekEDIEeAB5qRt6AAY22vt4",
    authDomain:        "shopping-list-db55b.firebaseapp.com",
    projectId:         "shopping-list-db55b",
    storageBucket:     "shopping-list-db55b.firebasestorage.app",
    messagingSenderId: "511359469906",
    appId:             "1:511359469906:web:c29b0994d958fee8b9928b"
};

// ──────────────────────────────────────────────
// Allowed users
// ──────────────────────────────────────────────
const ALLOWED_UIDS = [
    "mOaWpDNNlgTd2CAkQ59uck8Q1Uc2",
    "cEcLQyRnSVcsZ7Tuk5pl0jlHwbu2",
    "8y0qijBnTeflWPbJV23tY5FfFe63"
];

// ──────────────────────────────────────────────
// Categories (ordered for display)
// ──────────────────────────────────────────────
const CATEGORIES = [
    "Fruta y Verdura",
    "Lácteos y Huevos",
    "Carne y Pescado",
    "Pan y Cereales",
    "Limpieza e Higiene",
    "Despensa",
    "Congelados",
    "Otros"
];

// ──────────────────────────────────────────────
// Auto-categorization dictionary
// ──────────────────────────────────────────────
const AUTO_CATEGORY = {
    "Fruta y Verdura": [
        "acelga","aguacate","ajo","apio","berenjena","berro","brócoli","brécol",
        "calabacín","calabaza","cebolla","cebolleta","cereza","champiñón","ciruela",
        "clementina","col","coliflor","dátil","endivia","espárrago","espinaca",
        "frambuesa","fresa","fresón","granada","guisante","higo","judía verde",
        "kiwi","lechuga","limón","mandarina","mango","manzana","melocotón","melón",
        "mora","naranja","nectarina","níspero","papaya","patata","pepino","pera",
        "perejil","pimiento","piña","plátano","pomelo","puerro","rábano","remolacha",
        "repollo","rúcula","sandía","seta","tomate","uva","zanahoria","arándano",
        "alcachofa","boniato","maíz dulce","canónigos","jengibre","lima","coco",
        "hierbabuena","cilantro","albahaca","romero","tomillo","menta","eneldo",
        "pisto","menestra","verdura","fruta","ensalada","migas de coliflor",
        "pisto de verduras"
    ],
    "Lácteos y Huevos": [
        "leche","yogur","yogurt","queso","mantequilla","margarina","nata","natilla",
        "flan","cuajada","requesón","kéfir","huevo","huevos","crema","batido",
        "helado","mozzarella","parmesano","queso fresco","queso rallado",
        "leche entera","leche desnatada","leche semidesnatada","leche sin lactosa",
        "queso manchego","queso de cabra","queso cremoso","petit suisse",
        "chocolate con leche","choco-leche"
    ],
    "Carne y Pescado": [
        "pollo","ternera","cerdo","cordero","pavo","conejo","buey","hamburguesa",
        "salchicha","chorizo","jamón","lomo","costilla","chuleta","filete",
        "pechuga","muslo","alita","carne picada","carne","bacon","panceta",
        "morcilla","longaniza","fuet","salchichón","mortadela",
        "salmón","atún","merluza","bacalao","sardina","anchoa","boquerón",
        "gamba","langostino","mejillón","calamar","pulpo","sepia","lubina",
        "dorada","trucha","rape","lenguado","pescado","marisco",
        "pechuga de pavo","jamón serrano","jamón cocido","jamón york"
    ],
    "Pan y Cereales": [
        "pan","baguette","chapata","pan de molde","pan integral","pan rallado",
        "tostada","biscote","cereal","cereales","muesli","granola","avena",
        "arroz","pasta","espagueti","macarrón","macarrones","tallarín","fideos",
        "lasaña","tortellini","ravioli","cuscús","quinoa","trigo",
        "harina","galleta","galletas","magdalena","croissant","bizcocho",
        "cereal trigo entero","rosquilla","donut"
    ],
    "Limpieza e Higiene": [
        "jabón","champú","gel","desodorante","pasta de dientes","crema dental",
        "cepillo","pañuelo","pañal","compresa","tampón","algodón",
        "papel higiénico","toallita","esponja","fregasuelos","lejía",
        "lavavajillas","detergente","suavizante","limpiador","amoniaco",
        "bolsa de basura","bolsas de basura","estropajo","bayeta","escoba",
        "recambio fregona","guante","ambientador","insecticida",
        "crema hidratante","protector solar","maquinilla","cuchilla",
        "bastoncillo","hilo dental","colonia","perfume",
        "discos activos","b. basura","papel de cocina","servilleta",
        "film transparente","papel de aluminio","papel aluminio","arena"
    ],
    "Despensa": [
        "aceite","vinagre","sal","azúcar","pimienta","especias","orégano",
        "pimentón","comino","canela","curry","cúrcuma","laurel",
        "tomate frito","tomate triturado","tomate natural","salsa",
        "mayonesa","kétchup","mostaza","soja","miel","mermelada",
        "cacao","café","té","infusión","chocolate","chocolate puro",
        "chocolate almendra","cápsulas","nespresso",
        "atún en lata","conserva","legumbre","lenteja","garbanzo",
        "alubia","judía","aceituna","pepinillo","maíz",
        "agua","agua mineral","zumo","refresco","cerveza","vino",
        "caldo","sopa","puré","leche condensada","levadura",
        "gelatina","almendra","nuez","cacahuete","pipa","anacardo",
        "fruto seco","turrón","patatas fritas","snack","palomitas",
        "cola cao","colacao","nocilla","nutella"
    ],
    "Congelados": [
        "congelado","congelada","pizza","croqueta","empanada","empanadilla",
        "nugget","palito de pescado","guisante congelado","menestra congelada",
        "helado","polo","sorbete","verdura congelada","marisco congelado",
        "patata congelada","san jacobo","varitas","fingers"
    ]
};

// ──────────────────────────────────────────────
// Static product bank — common supermarket products
// Used for: suggestions, ticket matching, auto-complete
// ──────────────────────────────────────────────
const PRODUCT_BANK = [
    // Fruta y Verdura
    "Acelga","Aguacate","Ajo","Apio","Berenjena","Brócoli","Calabacín","Calabaza",
    "Cebolla","Cebolleta","Champiñón","Clementina","Col","Coliflor","Espárrago",
    "Espinaca","Frambuesa","Fresa","Judía Verde","Kiwi","Lechuga","Limón",
    "Mandarina","Mango","Manzana","Melocotón","Melón","Naranja","Patata","Pepino",
    "Pera","Perejil","Pimiento","Piña","Plátano","Puerro","Remolacha","Rúcula",
    "Sandía","Seta","Tomate","Uva","Zanahoria","Arándano","Boniato","Canónigos",
    "Jengibre","Lima","Albahaca","Cilantro","Hierbabuena","Romero","Tomillo","Menta",
    "Pisto de Verduras","Menestra","Ensalada","Migas de Coliflor",
    // Lácteos y Huevos
    "Leche","Leche Entera","Leche Semidesnatada","Leche Desnatada","Leche Sin Lactosa",
    "Yogur","Yogur Natural","Yogur Griego","Queso","Queso Fresco","Queso Rallado",
    "Queso Manchego","Queso de Cabra","Mozzarella","Parmesano","Mantequilla","Nata",
    "Natillas","Flan","Huevos","Batido","Helado","Kéfir","Requesón",
    // Carne y Pescado
    "Pollo","Pechuga de Pollo","Muslo de Pollo","Ternera","Cerdo","Cordero","Pavo",
    "Pechuga de Pavo","Hamburguesa","Carne Picada","Salchicha","Chorizo","Jamón Serrano",
    "Jamón Cocido","Jamón York","Lomo","Costilla","Chuleta","Filete","Bacon","Panceta",
    "Fuet","Salchichón","Mortadela","Salmón","Atún","Merluza","Bacalao","Sardina",
    "Gamba","Langostino","Mejillón","Calamar","Pulpo","Sepia","Lubina","Dorada","Trucha",
    // Pan y Cereales
    "Pan","Pan de Molde","Pan Integral","Baguette","Tostadas","Cereal","Cereales",
    "Muesli","Granola","Avena","Arroz","Pasta","Espagueti","Macarrones","Fideos",
    "Lasaña","Cuscús","Quinoa","Harina","Galletas","Magdalenas","Croissant","Bizcocho",
    // Limpieza e Higiene
    "Jabón","Champú","Gel de Ducha","Desodorante","Pasta de Dientes","Papel Higiénico",
    "Papel de Cocina","Servilletas","Toallitas","Lejía","Lavavajillas","Detergente",
    "Suavizante","Limpiador","Fregasuelos","Amoniaco","Bolsas de Basura","Estropajo",
    "Bayeta","Esponja","Discos Activos","Film Transparente","Papel de Aluminio",
    "Ambientador","Crema Hidratante","Cuchillas","Arena",
    // Despensa
    "Aceite de Oliva","Aceite de Girasol","Vinagre","Sal","Azúcar","Pimienta",
    "Orégano","Pimentón","Comino","Canela","Tomate Frito","Tomate Triturado",
    "Mayonesa","Kétchup","Mostaza","Miel","Mermelada","Café","Cápsulas Nespresso",
    "Té","Infusiones","Chocolate","Chocolate Puro","Cola Cao","Nocilla","Nutella",
    "Atún en Lata","Lentejas","Garbanzos","Alubias","Aceitunas","Maíz","Agua","Zumo",
    "Refresco","Cerveza","Vino","Caldo","Sopa","Leche Condensada","Almendras",
    "Nueces","Cacahuetes","Patatas Fritas","Palomitas",
    // Congelados
    "Pizza","Croquetas","Empanadillas","Nuggets","San Jacobo","Guisantes Congelados",
    "Verdura Congelada","Patatas Congeladas","Helado"
];

// Build lowercase set for fast lookup
const _productBankLower = new Set(PRODUCT_BANK.map(p => p.toLowerCase()));
// Build lookup map: lowercase → proper name
const _productBankMap = new Map(PRODUCT_BANK.map(p => [p.toLowerCase(), p]));

// Build lookup: normalized word → category
const _categoryLookup = {};
for (const [cat, words] of Object.entries(AUTO_CATEGORY)) {
    for (const w of words) {
        _categoryLookup[w.toLowerCase()] = cat;
    }
}

/**
 * Guess category for a product name.
 * Tries exact match first, then partial (longest match wins).
 */
function guessCategory(productName) {
    const lower = productName.toLowerCase().trim();

    // Exact match
    if (_categoryLookup[lower]) return _categoryLookup[lower];

    // Try matching from longest dictionary entries first
    const entries = Object.keys(_categoryLookup).sort((a, b) => b.length - a.length);
    for (const key of entries) {
        if (lower.includes(key) || key.includes(lower)) {
            return _categoryLookup[key];
        }
    }

    return "Otros";
}

// ──────────────────────────────────────────────
// Init Firebase
// ──────────────────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);
const itemsRef    = collection(db, "items");

// ──────────────────────────────────────────────
// DOM references
// ──────────────────────────────────────────────
const authScreen     = document.getElementById("authScreen");
const appContent     = document.getElementById("appContent");
const googleSignIn   = document.getElementById("googleSignIn");
const clearAuthCache = document.getElementById("clearAuthCache");
const signOutBtn     = document.getElementById("signOutBtn");
const authError      = document.getElementById("authError");
const addForm         = document.getElementById("addForm");
const itemInput       = document.getElementById("itemInput");
const categorySelect  = document.getElementById("categorySelect");
const shoppingList    = document.getElementById("shoppingList");
const emptyState      = document.getElementById("emptyState");
const filterPending   = document.getElementById("filterPending");
const showFrequentBtn = document.getElementById("showFrequent");
const frequentPanel   = document.getElementById("frequentPanel");
const frequentChips   = document.getElementById("frequentChips");
const autoCatHint     = document.getElementById("autoCatHint");
const suggestions     = document.getElementById("suggestions");

// Known products map: lowercase name → { id, text, checked }
let knownProducts = new Map();

// Filter state
let showOnlyPending = false;
let lastDocs = [];

// Collapsed categories state (persisted in sessionStorage)
const collapsedCategories = new Set(
    JSON.parse(sessionStorage.getItem("collapsedCats") || "[]")
);

function toggleCollapse(cat, section) {
    if (collapsedCategories.has(cat)) {
        collapsedCategories.delete(cat);
        section.classList.remove("collapsed");
    } else {
        collapsedCategories.add(cat);
        section.classList.add("collapsed");
    }
    sessionStorage.setItem("collapsedCats", JSON.stringify([...collapsedCategories]));
}

// Sync dot
const syncDot = document.createElement("div");
syncDot.className = "sync-dot";
document.body.appendChild(syncDot);

let unsubscribe = null;
let currentUser = null;   // set in onAuthStateChanged

// ──────────────────────────────────────────────
// Dark mode toggle
// ──────────────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

// Apply saved theme or respect system preference
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
}
updateThemeIcon();

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon();
    // Update meta theme-color for mobile browser bar
    document.querySelector('meta[name="theme-color"]').content = next === "dark" ? "#0f172a" : "#0891b2";
});

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.title = isDark ? "Modo claro" : "Modo oscuro";
}

// ──────────────────────────────────────────────
// Register Service Worker (PWA)
// ──────────────────────────────────────────────
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
}

// ──────────────────────────────────────────────
// PWA Install button (solo en smartphones)
// ──────────────────────────────────────────────
const installBtn = document.getElementById("installBtn");
let deferredPrompt = null;
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (isMobile) {
        installBtn.style.display = "inline-flex";
    }
});

installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
        installBtn.style.display = "none";
    }
    deferredPrompt = null;
});

// Hide button if already installed (standalone mode)
if (window.matchMedia("(display-mode: standalone)").matches) {
    installBtn.style.display = "none";
}

// ──────────────────────────────────────────────
// Auth state
// ──────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user && ALLOWED_UIDS.includes(user.uid)) {
        currentUser = user;
        authScreen.style.display = "none";
        appContent.style.display = "block";
        authError.textContent    = "";
        startListening();
        preloadOCR(); // Pre-load Tesseract in background while user browses
    } else {
        currentUser = null;
        appContent.style.display = "none";
        authScreen.style.display = "flex";
        if (user && !ALLOWED_UIDS.includes(user.uid)) {
            authError.textContent = "Acceso denegado para " + user.email;
            signOut(auth);
        }
        if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    }
});

googleSignIn.addEventListener("click", async () => {
    authError.textContent = "";
    googleSignIn.disabled = true;
    googleSignIn.textContent = "Abriendo Google...";
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(auth, provider);
    } catch (err) {
        console.error(err.code, err.message);
        if (err.code === "auth/popup-blocked") {
            authError.textContent = "El popup fue bloqueado. Permite popups para este sitio en tu navegador.";
        } else if (err.code === "auth/popup-closed-by-user") {
            authError.textContent = "Cerraste el popup antes de entrar. Inténtalo de nuevo.";
        } else {
            authError.textContent = "Error: " + err.code;
        }
        googleSignIn.disabled = false;
        googleSignIn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20"> Entrar con Google';
    }
});

signOutBtn.addEventListener("click", () => signOut(auth));

// ──────────────────────────────────────────────
// Clear corrupted Auth cache
// ──────────────────────────────────────────────
clearAuthCache.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (_) {}

    // Clear all Firebase-related localStorage keys
    Object.keys(localStorage)
        .filter(k => k.includes("firebase") || k.includes("firebaseLocalStorage"))
        .forEach(k => localStorage.removeItem(k));

    // Clear IndexedDB (Firebase stores auth state there)
    const dbsToDelete = ["firebaseLocalStorageDb", "firebase-heartbeat-database"];
    dbsToDelete.forEach(name => indexedDB.deleteDatabase(name));

    authError.textContent = "Caché limpiada. Intentando de nuevo...";
    setTimeout(() => window.location.reload(), 1000);
});

// ──────────────────────────────────────────────
// Firestore real-time listener
// ──────────────────────────────────────────────
function startListening() {
    if (unsubscribe) return;
    const q = query(itemsRef, orderBy("createdAt", "asc"));
    unsubscribe = onSnapshot(q,
        (snapshot) => {
            syncDot.classList.remove("offline");
            lastDocs = snapshot.docs;
            renderList(lastDocs);
        },
        () => syncDot.classList.add("offline")
    );
}

// ──────────────────────────────────────────────
// Filter toggle
// ──────────────────────────────────────────────
filterPending.addEventListener("click", () => {
    showOnlyPending = !showOnlyPending;
    filterPending.classList.toggle("active", showOnlyPending);
    filterPending.innerHTML = showOnlyPending ? "&#128064; Ver todo" : "&#128065; Por comprar";
    // Force full rebuild when filter changes
    shoppingList.querySelectorAll(".category-group").forEach(el => el.remove());
    renderedItems.clear();
    renderList(lastDocs);
});

// ──────────────────────────────────────────────
// "Repetir" panel — products bought before but not pending now
// ──────────────────────────────────────────────
showFrequentBtn.addEventListener("click", () => {
    const isOpen = frequentPanel.style.display !== "none";
    if (isOpen) {
        frequentPanel.style.display = "none";
        showFrequentBtn.classList.remove("active");
        return;
    }
    renderRepeatChips();
    frequentPanel.style.display = "block";
    showFrequentBtn.classList.add("active");
});

function renderRepeatChips() {
    frequentChips.innerHTML = "";

    // Products currently pending (unchecked) — we don't suggest these
    const pendingNames = new Set(
        lastDocs.filter(d => !d.data().checked).map(d => d.data().text.toLowerCase())
    );

    // Gather checked products (already bought) that are NOT pending
    const candidates = [];
    lastDocs.forEach(d => {
        const data = d.data();
        const name = (data.text || "").trim();
        const lower = name.toLowerCase();
        if (!name) return;
        if (pendingNames.has(lower)) return;
        if (!data.checked) return;
        const count = (data.purchaseHistory && data.purchaseHistory.length) || 0;
        // Get last purchase date
        let lastDate = null;
        if (data.purchaseHistory && data.purchaseHistory.length > 0) {
            const last = data.purchaseHistory[data.purchaseHistory.length - 1];
            lastDate = last.toDate ? last.toDate() : new Date(last);
        }
        candidates.push({ text: name, count, id: d.id, lastDate });
    });

    // Sort: most purchased first, then alphabetical
    candidates.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.text.localeCompare(b.text, "es");
    });

    if (candidates.length === 0) {
        frequentChips.innerHTML = '<span class="frequent-empty">No hay productos comprados para repetir 👍</span>';
        return;
    }

    // Panel title
    const panelTitle = document.createElement("p");
    panelTitle.className = "frequent-panel-title";
    panelTitle.textContent = "Toca un producto para volver a ponerlo como pendiente:";
    frequentChips.appendChild(panelTitle);

    // "Add all" button
    const addAllBtn = document.createElement("button");
    addAllBtn.className = "frequent-chip frequent-chip-all";
    addAllBtn.textContent = `🔄 Poner todos pendientes (${candidates.length})`;
    addAllBtn.addEventListener("click", async () => {
        addAllBtn.disabled = true;
        addAllBtn.textContent = "Añadiendo...";
        for (const item of candidates) {
            await updateDoc(doc(db, "items", item.id), { checked: false });
        }
        frequentPanel.style.display = "none";
        showFrequentBtn.classList.remove("active");
    });
    frequentChips.appendChild(addAllBtn);

    candidates.forEach(item => {
        const chip = document.createElement("button");
        chip.className = "frequent-chip";

        // Build descriptive label
        let label = item.text;
        const extras = [];
        if (item.count > 1) extras.push(`${item.count} compras`);
        if (item.lastDate) {
            const daysDiff = Math.round((Date.now() - item.lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 0) extras.push("hoy");
            else if (daysDiff === 1) extras.push("ayer");
            else if (daysDiff < 7) extras.push(`hace ${daysDiff} días`);
            else if (daysDiff < 30) extras.push(`hace ${Math.round(daysDiff / 7)} sem.`);
            else extras.push(`hace ${Math.round(daysDiff / 30)} mes${Math.round(daysDiff / 30) > 1 ? "es" : ""}`);
        }
        if (extras.length > 0) {
            chip.innerHTML = `${label} <span class="frequent-detail">${extras.join(" · ")}</span>`;
        } else {
            chip.textContent = label;
        }
        chip.title = `Volver a poner "${item.text}" como pendiente`;

        chip.addEventListener("click", async () => {
            await updateDoc(doc(db, "items", item.id), { checked: false });
            chip.classList.add("just-added");
            chip.disabled = true;
            setTimeout(() => {
                chip.remove();
                if (frequentChips.querySelectorAll(".frequent-chip:not(.frequent-chip-all)").length === 0) {
                    frequentPanel.style.display = "none";
                    showFrequentBtn.classList.remove("active");
                }
            }, 500);
        });

        frequentChips.appendChild(chip);
    });
}

// ──────────────────────────────────────────────
// Render list grouped by category (smart diff)
// ──────────────────────────────────────────────
let renderedItems = new Map(); // id → { checked, text, note, purchaseHistory }

function renderList(docs) {
    // Update known products for suggestions (always from ALL docs)
    knownProducts.clear();
    docs.forEach(d => {
        const t = (d.data().text || "").trim();
        if (t) knownProducts.set(t.toLowerCase(), { id: d.id, text: t, checked: !!d.data().checked });
    });

    if (docs.length === 0) {
        shoppingList.querySelectorAll(".category-group").forEach(el => el.remove());
        emptyState.style.display = "block";
        emptyState.textContent = "La lista está vacía. ¡Añade algo! 🧺";
        renderedItems.clear();
        return;
    }

    // No counter — removed by design

    // Apply filter
    const visibleDocs = showOnlyPending ? docs.filter(d => !d.data().checked) : docs;

    if (visibleDocs.length === 0) {
        shoppingList.querySelectorAll(".category-group").forEach(el => el.remove());
        emptyState.style.display = "block";
        emptyState.textContent = "✅ ¡Todo comprado!";
        renderedItems.clear();
        return;
    }

    emptyState.style.display = "none";

    // Build desired state: grouped & sorted
    const grouped = {};
    CATEGORIES.forEach(cat => { grouped[cat] = []; });
    visibleDocs.forEach(docSnap => {
        const cat = docSnap.data().category || "Otros";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(docSnap);
    });

    // Track which IDs should be visible
    const visibleIds = new Set(visibleDocs.map(d => d.id));

    // Remove items no longer visible
    renderedItems.forEach((_, id) => {
        if (!visibleIds.has(id)) {
            const el = shoppingList.querySelector(`.list-item[data-id="${id}"]`);
            if (el) {
                const wrapper = el.closest(".swipe-container") || el;
                wrapper.remove();
            }
            renderedItems.delete(id);
        }
    });

    // For each category, ensure section exists and update items
    CATEGORIES.forEach(cat => {
        const catDocs = grouped[cat];
        let section = shoppingList.querySelector(`.category-group[data-cat="${cat}"]`);

        if (catDocs.length === 0) {
            if (section) section.remove();
            return;
        }

        // Create section if missing
        if (!section) {
            section = document.createElement("div");
            section.className = "category-group";
            section.dataset.cat = cat;
            const heading = document.createElement("h3");
            heading.className = "category-heading";
            heading.textContent = cat;
            heading.addEventListener("click", () => toggleCollapse(cat, section));
            section.appendChild(heading);
            const ul = document.createElement("ul");
            ul.className = "category-items";
            section.appendChild(ul);

            // Restore collapsed state
            if (collapsedCategories.has(cat)) {
                section.classList.add("collapsed");
            }

            // Insert in correct category order
            const catIndex = CATEGORIES.indexOf(cat);
            let inserted = false;
            for (const existingSec of shoppingList.querySelectorAll(".category-group")) {
                const existingCatIndex = CATEGORIES.indexOf(existingSec.dataset.cat);
                if (existingCatIndex > catIndex) {
                    shoppingList.insertBefore(section, existingSec);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) shoppingList.appendChild(section);
        }

        const ul = section.querySelector(".category-items");
        const sortedDocs = catDocs.sort((a, b) =>
            (a.data().text || "").localeCompare(b.data().text || "", "es")
        );

        sortedDocs.forEach(docSnap => {
            const data = docSnap.data();
            const id = docSnap.id;
            const prev = renderedItems.get(id);

            // Serialize purchaseHistory for comparison
            const phKey = (data.purchaseHistory || []).map(ts => {
                const d = ts.toDate ? ts.toDate() : new Date(ts);
                return d.getTime();
            }).join(",");
            const prevPhKey = prev ? prev.phKey : "";

            const changed = !prev
                || prev.checked !== !!data.checked
                || prev.text !== data.text
                || prev.note !== (data.note || "")
                || phKey !== prevPhKey;

            if (changed) {
                // Remove old element if exists
                const oldEl = ul.querySelector(`.list-item[data-id="${id}"]`);
                if (oldEl) {
                    const oldWrapper = oldEl.closest(".swipe-container") || oldEl;
                    oldWrapper.remove();
                }

                // Create new element (returns swipe-container wrapping a .list-item)
                const newEl = createItemElement(id, data.text, data.checked, data.purchaseHistory, data.note);

                // Insert in sorted position (compare against .list-item labels inside containers)
                const existingContainers = [...ul.querySelectorAll(".swipe-container")];
                let insertedItem = false;
                for (const container of existingContainers) {
                    const itemText = container.querySelector(".item-label")?.textContent || "";
                    if (data.text.localeCompare(itemText, "es") < 0) {
                        ul.insertBefore(newEl, container);
                        insertedItem = true;
                        break;
                    }
                }
                if (!insertedItem) ul.appendChild(newEl);

                // Don't animate on updates, only on new items
                if (prev) {
                    const innerLi = newEl.querySelector(".list-item");
                    if (innerLi) innerLi.style.animation = "none";
                }

                renderedItems.set(id, {
                    checked: !!data.checked,
                    text: data.text,
                    note: data.note || "",
                    phKey
                });
            }
        });

        // Remove items from this category that shouldn't be here anymore
        ul.querySelectorAll(".list-item").forEach(el => {
            const id = el.dataset.id;
            if (!sortedDocs.some(d => d.id === id)) {
                const wrapper = el.closest(".swipe-container") || el;
                wrapper.remove();
                renderedItems.delete(id);
            }
        });
    });
}

// ──────────────────────────────────────────────
// Create list item element
// ──────────────────────────────────────────────
function createItemElement(id, text, checked, purchaseHistory, note) {
    const li = document.createElement("li");
    li.className  = "list-item" + (checked ? " checked" : "");
    li.dataset.id = id;

    const checkbox = document.createElement("input");
    checkbox.type    = "checkbox";
    checkbox.checked = checked;
    checkbox.addEventListener("change", () => toggleItem(id, checkbox.checked));

    const textWrapper = document.createElement("div");
    textWrapper.className = "item-text-wrapper";

    const label = document.createElement("span");
    label.className   = "item-label";
    label.textContent = text;

    // Long-press to edit name, tap to toggle — scroll-safe
    let longPressTimer = null;
    let didLongPress = false;
    let didMove = false;
    let labelTouchStartY = 0;

    label.addEventListener("touchstart", (e) => {
        didLongPress = false;
        didMove = false;
        labelTouchStartY = e.touches[0].clientY;
        longPressTimer = setTimeout(() => {
            didLongPress = true;
            e.preventDefault();
            startEditName(id, text, label, textWrapper);
        }, 500);
    }, { passive: false });

    label.addEventListener("touchmove", (e) => {
        // If finger moved more than 10px vertically, it's a scroll — cancel everything
        const dy = Math.abs(e.touches[0].clientY - labelTouchStartY);
        if (dy > 10) {
            didMove = true;
            clearTimeout(longPressTimer);
        }
    }, { passive: true });

    label.addEventListener("touchend", (e) => {
        clearTimeout(longPressTimer);
        // Don't toggle if user scrolled or long-pressed
        if (didLongPress) { e.preventDefault(); return; }
        if (didMove) return;
        checkbox.checked = !checkbox.checked;
        toggleItem(id, checkbox.checked);
    });

    // Desktop: click to toggle, dblclick to edit
    label.addEventListener("click", (e) => {
        // Only for non-touch (mouse) — touch is handled above
        if (didLongPress || didMove) return;
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
        checkbox.checked = !checkbox.checked;
        toggleItem(id, checkbox.checked);
    });
    label.addEventListener("dblclick", (e) => {
        e.preventDefault();
        startEditName(id, text, label, textWrapper);
    });

    textWrapper.appendChild(label);

    // Note display + inline editor
    const noteRow = document.createElement("div");
    noteRow.className = "item-note-row";

    const noteBtn = document.createElement("button");
    noteBtn.className = "btn-note" + (note ? " has-note" : "");
    noteBtn.textContent = "📝";
    noteBtn.title = note ? "Editar nota" : "Añadir nota";

    const noteDisplay = document.createElement("span");
    noteDisplay.className = "item-note-text";
    noteDisplay.textContent = note || "";
    if (!note) noteDisplay.style.display = "none";

    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.className = "item-note-input";
    noteInput.placeholder = "Ej: marca, tamaño, tipo...";
    noteInput.value = note || "";
    noteInput.style.display = "none";

    noteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isEditing = noteInput.style.display !== "none";
        if (isEditing) {
            // Save and close
            saveNote(id, noteInput.value.trim(), noteDisplay, noteBtn);
            noteInput.style.display = "none";
        } else {
            // Open editor
            noteDisplay.style.display = "none";
            noteInput.style.display = "";
            noteInput.focus();
        }
    });

    noteInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveNote(id, noteInput.value.trim(), noteDisplay, noteBtn);
            noteInput.style.display = "none";
        }
        if (e.key === "Escape") {
            noteInput.value = note || "";
            noteInput.style.display = "none";
            if (note) noteDisplay.style.display = "";
        }
    });

    noteInput.addEventListener("blur", () => {
        // Small delay to allow button click to fire first
        setTimeout(() => {
            if (noteInput.style.display !== "none") {
                saveNote(id, noteInput.value.trim(), noteDisplay, noteBtn);
                noteInput.style.display = "none";
            }
        }, 150);
    });

    noteRow.append(noteBtn, noteDisplay, noteInput);
    textWrapper.appendChild(noteRow);

    const deleteBtn = document.createElement("button");
    deleteBtn.className   = "btn-delete";
    deleteBtn.textContent = "x";
    deleteBtn.setAttribute("aria-label", "Eliminar");
    deleteBtn.addEventListener("click", () => removeItem(id));

    // Swipe action backgrounds
    const swipeContainer = document.createElement("div");
    swipeContainer.className = "swipe-container";

    const swipeBgLeft = document.createElement("div");
    swipeBgLeft.className = "swipe-bg swipe-bg-left";
    swipeBgLeft.innerHTML = "🗑️ Eliminar";

    const swipeBgRight = document.createElement("div");
    swipeBgRight.className = "swipe-bg swipe-bg-right";
    swipeBgRight.innerHTML = checked ? "🔄 Pendiente" : "✅ Comprado";

    li.append(checkbox, textWrapper, deleteBtn);
    swipeContainer.append(swipeBgLeft, swipeBgRight, li);

    // Swipe gestures (mobile) — only horizontal swipes, vertical scrolling never triggers actions
    let touchStartX = 0;
    let touchStartY = 0;
    let swiping = false;
    let directionLocked = null; // "h" = horizontal, "v" = vertical
    let hasVibratedThreshold = false;

    li.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        swiping = false;
        directionLocked = null;
        hasVibratedThreshold = false;
        li.style.transition = "none";
        swipeBgLeft.classList.remove("ready");
        swipeBgRight.classList.remove("ready");
    }, { passive: true });

    li.addEventListener("touchmove", (e) => {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;

        // Lock direction once finger has moved enough
        if (!directionLocked) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            // Stricter horizontal detection: need much more horizontal than vertical
            if (absDx > 30 || absDy > 10) {
                // Must be clearly horizontal: dx > 3× dy and at least 30px
                directionLocked = (absDx > absDy * 3 && absDx > 30) ? "h" : "v";
            }
        }

        // If scrolling vertically, do nothing — never interfere with scroll
        if (directionLocked !== "h") return;

        // Horizontal swipe confirmed
        swiping = true;
        const clamped = Math.max(-120, Math.min(120, dx));
        li.style.transform = `translateX(${clamped}px)`;

        // Show relevant background
        if (dx < 0) {
            swipeBgLeft.style.opacity = Math.min(1, Math.abs(dx) / 60);
            swipeBgRight.style.opacity = 0;
            swipeBgLeft.classList.toggle("ready", dx < -60);
        } else {
            swipeBgRight.style.opacity = Math.min(1, dx / 60);
            swipeBgLeft.style.opacity = 0;
            swipeBgRight.classList.toggle("ready", dx > 60);
        }

        // Haptic feedback when crossing threshold
        if (Math.abs(dx) > 60 && !hasVibratedThreshold) {
            hasVibratedThreshold = true;
            if (navigator.vibrate) navigator.vibrate(15);
        }
        if (Math.abs(dx) <= 60) hasVibratedThreshold = false;
    }, { passive: true });

    li.addEventListener("touchend", () => {
        li.style.transition = "transform 0.25s ease, opacity 0.25s ease";

        if (directionLocked !== "h") {
            // Was a vertical scroll — reset and bail
            li.style.transform = "";
            swipeBgLeft.style.opacity = 0;
            swipeBgRight.style.opacity = 0;
            swiping = false;
            directionLocked = null;
            return;
        }

        const currentX = parseFloat(li.style.transform.replace(/[^-\d.]/g, "")) || 0;

        if (currentX < -60) {
            // Swipe left → delete
            li.style.transform = "translateX(-100%)";
            li.style.opacity = "0";
            setTimeout(() => removeItem(id), 250);
        } else if (currentX > 60) {
            // Swipe right → toggle checked
            li.style.transform = "translateX(100%)";
            li.style.opacity = "0";
            setTimeout(() => {
                checkbox.checked = !checked;
                toggleItem(id, !checked);
            }, 250);
        } else {
            // Snap back
            li.style.transform = "";
            setTimeout(() => {
                swipeBgLeft.style.opacity = 0;
                swipeBgRight.style.opacity = 0;
            }, 150);
        }
        swipeBgLeft.classList.remove("ready");
        swipeBgRight.classList.remove("ready");
        swiping = false;
        directionLocked = null;
    });

    return swipeContainer;
}

// Save note to Firestore
async function saveNote(id, noteText, noteDisplay, noteBtn) {
    if (noteText) {
        noteDisplay.textContent = noteText;
        noteDisplay.style.display = "";
        noteBtn.classList.add("has-note");
        noteBtn.title = "Editar nota";
        await updateDoc(doc(db, "items", id), { note: noteText });
    } else {
        noteDisplay.textContent = "";
        noteDisplay.style.display = "none";
        noteBtn.classList.remove("has-note");
        noteBtn.title = "Añadir nota";
        await updateDoc(doc(db, "items", id), { note: deleteField() });
    }
}

// Edit product name inline
function startEditName(id, currentText, label, textWrapper) {
    // Avoid duplicate editors
    if (textWrapper.querySelector(".edit-name-input")) return;

    label.style.display = "none";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-name-input";
    input.value = currentText;
    textWrapper.insertBefore(input, textWrapper.firstChild);
    input.focus();
    input.select();

    const save = async () => {
        const newText = input.value.trim();
        input.remove();
        label.style.display = "";
        if (newText && newText !== currentText) {
            label.textContent = newText;
            const newCat = guessCategory(newText);
            await updateDoc(doc(db, "items", id), { text: newText, category: newCat });
        }
    };

    input.addEventListener("blur", () => setTimeout(save, 100));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); input.blur(); }
        if (e.key === "Escape") {
            input.value = currentText;
            input.blur();
        }
    });
}

// ──────────────────────────────────────────────
// Auto-categorize as user types
// ──────────────────────────────────────────────
let userManuallySelectedCategory = false;

categorySelect.addEventListener("change", () => {
    userManuallySelectedCategory = true;
});

itemInput.addEventListener("input", () => {
    if (userManuallySelectedCategory) return;
    const text = itemInput.value.trim();
    if (text.length < 2) {
        autoCatHint.textContent = "";
        return;
    }
    const cat = guessCategory(text);
    categorySelect.value = cat;
    autoCatHint.textContent = cat !== "Otros" ? "→ " + cat : "";

    // Show suggestions
    showSuggestions(text);
});

// ──────────────────────────────────────────────
// Suggestions while typing (uses product bank + known products)
// ──────────────────────────────────────────────
function showSuggestions(text) {
    suggestions.innerHTML = "";
    if (text.length < 2) { suggestions.style.display = "none"; return; }

    const lower = text.toLowerCase();

    // Combine: known products from Firestore + static bank
    const allNames = new Set();
    for (const v of knownProducts.values()) allNames.add(v.text);
    for (const p of PRODUCT_BANK) allNames.add(p);

    const matches = [...allNames]
        .filter(p => p.toLowerCase().includes(lower))
        .sort((a, b) => {
            // Prioritize products that START with the typed text
            const aStarts = a.toLowerCase().startsWith(lower) ? 0 : 1;
            const bStarts = b.toLowerCase().startsWith(lower) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            // Then prioritize known products (already in list)
            const aKnown = knownProducts.has(a.toLowerCase()) ? 0 : 1;
            const bKnown = knownProducts.has(b.toLowerCase()) ? 0 : 1;
            if (aKnown !== bKnown) return aKnown - bKnown;
            return a.localeCompare(b, "es");
        })
        .slice(0, 10);

    if (matches.length === 0 || (matches.length === 1 && matches[0].toLowerCase() === lower)) {
        suggestions.style.display = "none";
        return;
    }

    matches.forEach(name => {
        const li = document.createElement("li");
        li.className = "suggestion-item";

        // Highlight matched portion
        const idx = name.toLowerCase().indexOf(lower);
        if (idx >= 0) {
            li.appendChild(document.createTextNode(name.slice(0, idx)));
            const strong = document.createElement("strong");
            strong.textContent = name.slice(idx, idx + text.length);
            li.appendChild(strong);
            li.appendChild(document.createTextNode(name.slice(idx + text.length)));
        } else {
            li.textContent = name;
        }

        li.addEventListener("mousedown", (e) => {
            e.preventDefault(); // prevent blur before click
            selectSuggestion(name);
        });
        suggestions.appendChild(li);
    });

    suggestions.style.display = "block";
}

function selectSuggestion(name) {
    itemInput.value = name;
    suggestions.style.display = "none";
    suggestions.innerHTML = "";
    // Trigger auto-categorize
    userManuallySelectedCategory = false;
    const cat = guessCategory(name);
    categorySelect.value = cat;
    autoCatHint.textContent = cat !== "Otros" ? "→ " + cat : "";
    itemInput.focus();
}

// Hide suggestions on blur / Escape
itemInput.addEventListener("blur", () => {
    // Small delay so mousedown on suggestion fires first
    setTimeout(() => { suggestions.style.display = "none"; }, 150);
});

itemInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        suggestions.style.display = "none";
    }
    // Keyboard navigation
    const items = suggestions.querySelectorAll(".suggestion-item");
    if (items.length === 0) return;
    const active = suggestions.querySelector(".suggestion-item.active");
    let idx = [...items].indexOf(active);

    if (e.key === "ArrowDown") {
        e.preventDefault();
        if (active) active.classList.remove("active");
        idx = (idx + 1) % items.length;
        items[idx].classList.add("active");
        items[idx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active) active.classList.remove("active");
        idx = idx <= 0 ? items.length - 1 : idx - 1;
        items[idx].classList.add("active");
        items[idx].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && active) {
        e.preventDefault();
        selectSuggestion(active.textContent);
    }
});

// ──────────────────────────────────────────────
// Add item
// ──────────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = itemInput.value.trim();
    if (!text) return;
    suggestions.style.display = "none";

    // Check if product already exists
    const existing = knownProducts.get(text.toLowerCase());

    if (existing) {
        // Product exists → mark as purchased (add purchase date)
        itemInput.value = "";
        itemInput.focus();
        userManuallySelectedCategory = false;
        categorySelect.value = "Fruta y Verdura";

        if (existing.checked) {
            autoCatHint.textContent = "🛒 Nueva compra registrada";
        } else {
            autoCatHint.textContent = "✅ Marcado como comprado";
        }
        autoCatHint.style.color = "#16a34a";
        setTimeout(() => { autoCatHint.textContent = ""; autoCatHint.style.color = ""; }, 2000);

        // Always register purchase: mark checked + add timestamp
        await toggleItem(existing.id, true);
        return;
    }

    // New product → add
    const category = userManuallySelectedCategory ? categorySelect.value : guessCategory(text);
    categorySelect.value = category;
    itemInput.value = "";
    itemInput.focus();
    userManuallySelectedCategory = false;
    autoCatHint.textContent = "";
    categorySelect.value = "Fruta y Verdura"; // reset to first
    await addDoc(itemsRef, { text, category, checked: false, createdAt: serverTimestamp() });
});

// ──────────────────────────────────────────────
// Toggle / Delete / Clear
// ──────────────────────────────────────────────
async function toggleItem(id, checked) {
    const data = { checked };
    if (checked) {
        data.checkedAt = serverTimestamp();
        data.purchaseHistory = arrayUnion(Timestamp.now());
    } else {
        data.checkedAt = deleteField();
    }
    await updateDoc(doc(db, "items", id), data);
}

async function removeItem(id) {
    await deleteDoc(doc(db, "items", id));
}

// ──────────────────────────────────────────────
// Ticket scanner (Tesseract.js OCR)
// ──────────────────────────────────────────────
const scanTicketBtn   = document.getElementById("scanTicket");
const scanModal       = document.getElementById("scanModal");
const scanClose       = document.getElementById("scanClose");
const scanCameraInput = document.getElementById("scanCameraInput");
const scanGalleryInput = document.getElementById("scanGalleryInput");
const scanUploadOptions = document.getElementById("scanUploadOptions");
const scanPreview     = document.getElementById("scanPreview");
const scanRetryPhoto  = document.getElementById("scanRetryPhoto");
const scanProgress    = document.getElementById("scanProgress");
const scanProgressBar = document.getElementById("scanProgressBar");
const scanProgressText = document.getElementById("scanProgressText");
const scanResults     = document.getElementById("scanResults");
const scanResultsList = document.getElementById("scanResultsList");
const scanAddAll      = document.getElementById("scanAddAll");
const scanConfirmAdd  = document.getElementById("scanConfirmAdd");
const scanSummary     = document.getElementById("scanSummary");
const scanCancel      = document.getElementById("scanCancel");

let tesseractLoaded = false;
let tesseractWorker = null;  // Pre-initialized worker
let detectedProducts = [];

scanTicketBtn.addEventListener("click", () => {
    scanModal.style.display = "flex";
    resetScanUI();
});

scanClose.addEventListener("click", closeScanModal);
scanCancel.addEventListener("click", closeScanModal);
scanModal.addEventListener("click", (e) => {
    if (e.target === scanModal) closeScanModal();
});

function closeScanModal() {
    scanModal.style.display = "none";
    resetScanUI();
}

function resetScanUI() {
    scanPreview.style.display = "none";
    scanProgress.style.display = "none";
    scanResults.style.display = "none";
    scanRetryPhoto.style.display = "none";
    scanUploadOptions.style.display = "flex";
    scanResultsList.innerHTML = "";
    scanResultsList.style.display = "";
    scanCameraInput.value = "";
    scanGalleryInput.value = "";
    detectedProducts = [];
    productsToConfirm = [];
    productsToMark = [];
    scanAddAll.disabled = false;
    scanAddAll.style.display = "";
    scanAddAll.textContent = "✓ Añadir todos";
    scanSummary.style.display = "none";
    scanSummary.innerHTML = "";
    scanConfirmAdd.style.display = "none";
}

// "Retry photo" button
scanRetryPhoto.addEventListener("click", () => {
    resetScanUI();
});

// ──────────────────────────────────────────────
// Tesseract.js — pre-load script + warm up worker
// ──────────────────────────────────────────────
async function loadTesseractScript() {
    if (tesseractLoaded) return;
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.onload = () => { tesseractLoaded = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Pre-load OCR engine in background after login.
 * Creates a Tesseract worker with Spanish lang ready to go.
 * This way, when user scans, the heavy download+init is already done.
 */
async function preloadOCR() {
    try {
        await loadTesseractScript();
        if (!tesseractWorker) {
            console.log("⏳ Pre-loading Tesseract worker...");
            tesseractWorker = await Tesseract.createWorker("spa", 1, {
                logger: () => {} // silent during preload
            });
            console.log("✅ Tesseract worker ready");
        }
    } catch (err) {
        console.warn("OCR preload failed (will retry on scan):", err);
    }
}

/**
 * Get a ready-to-use Tesseract worker.
 * Returns the pre-loaded one if available, otherwise creates one on the fly.
 */
async function getOCRWorker(logger) {
    if (tesseractWorker) return tesseractWorker;
    // Fallback: load on demand
    await loadTesseractScript();
    tesseractWorker = await Tesseract.createWorker("spa", 1, { logger });
    return tesseractWorker;
}

/**
 * Resize image for faster OCR.
 * Tickets don't need 4000px — 1500px width is plenty for text recognition.
 * Returns a Blob of the resized image.
 */
function resizeImageForOCR(file, maxWidth = 1500) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // If already small enough, use original
            if (img.width <= maxWidth) {
                resolve(file);
                return;
            }
            const scale = maxWidth / img.width;
            const canvas = document.createElement("canvas");
            canvas.width = maxWidth;
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext("2d");
            // Use high quality downscaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                console.log(`📐 Image resized: ${img.width}x${img.height} → ${canvas.width}x${canvas.height} (${(file.size/1024).toFixed(0)}KB → ${(blob.size/1024).toFixed(0)}KB)`);
                resolve(blob);
            }, "image/jpeg", 0.85);
        };
        img.src = URL.createObjectURL(file);
    });
}

// Both inputs trigger the same processing
scanCameraInput.addEventListener("change", (e) => processTicketFile(e.target.files[0]));
scanGalleryInput.addEventListener("change", (e) => processTicketFile(e.target.files[0]));

async function processTicketFile(file) {
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    scanPreview.src = url;
    scanPreview.style.display = "block";
    scanUploadOptions.style.display = "none";
    scanProgress.style.display = "flex";

    const workerReady = !!tesseractWorker;
    scanProgressText.textContent = workerReady ? "Preparando imagen..." : "Cargando OCR...";
    scanProgressBar.style.setProperty("--progress", workerReady ? "20%" : "5%");

    try {
        const startTime = performance.now();

        // Resize image (runs in parallel with worker init if needed)
        const [resizedImage, worker] = await Promise.all([
            resizeImageForOCR(file),
            getOCRWorker((m) => {
                if (m.status === "recognizing text") {
                    const pct = Math.round(30 + m.progress * 60);
                    scanProgressBar.style.setProperty("--progress", pct + "%");
                    scanProgressText.textContent = "Leyendo... " + Math.round(m.progress * 100) + "%";
                }
            })
        ]);

        scanProgressText.textContent = "Leyendo ticket...";
        scanProgressBar.style.setProperty("--progress", "30%");

        const result = await worker.recognize(resizedImage);

        const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
        scanProgressBar.style.setProperty("--progress", "95%");
        scanProgressText.textContent = "Analizando productos...";

        // Log raw OCR for debugging
        console.log(`──── OCR (${elapsed}s) ────\n${result.data.text}\n──────────────────────`);

        const products = parseTicket(result.data.text);
        scanProgressBar.style.setProperty("--progress", "100%");

        if (products.length === 0) {
            scanProgressText.textContent = `No se detectaron productos (${elapsed}s). Intenta con otra foto.`;
            scanRetryPhoto.style.display = "block";
            return;
        }

        detectedProducts = products;
        renderScanResults(products);
        scanProgress.style.display = "none";
        scanResults.style.display = "block";
        scanRetryPhoto.style.display = "block";

    } catch (err) {
        console.error("OCR error:", err);
        // If worker crashed, reset it for next attempt
        tesseractWorker = null;
        scanProgressText.textContent = "Error al procesar. Intenta con otra foto.";
        scanRetryPhoto.style.display = "block";
    }
}

// ──────────────────────────────────────────────
// Parse ticket text into product names (enhanced NLP)
// Strategy: extract candidate names, then score each
// against the product bank + known products.
// Only keep candidates with high confidence.
// ──────────────────────────────────────────────
function parseTicket(rawText) {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const candidates = [];

    // ── Phase 1: Skip obviously non-product lines ──
    const skipLine = [
        // Store headers & footers
        /^(mercadona|lidl|carrefour|aldi|dia\b|eroski|alcampo|hipercor|bonpreu|condis|caprabo|consum|bonàrea|simply)/i,
        /^(supermercado|s\.a\.|s\.l\.|sociedad|grupo|direc|calle|avda|avenida|plaza|c\/)/i,
        /^(www\.|http|\.com|\.es)/i,
        // Financial/admin
        /^(total|subtotal|suma|iva|i\.v\.a|igic|base\s*impon|cambio|efectivo|tarjeta|visa|mastercard|importe|pago)/i,
        /^(nif|cif|c\.i\.f|n\.i\.f|tel[eé]f|fax|factura\s*(simpl)?|ticket|recibo|n[uú]m|documento)/i,
        /^(fecha|hora|caja|terminal|turno|op[\.:]\s*\d|operaci|cajero)/i,
        // Pleasantries
        /^(gracias|bienvenid|atendid|le\s+ha\s+atendido|vuelva|hasta\s+pronto)/i,
        /^(fidelidad|cliente|tarjeta\s+(cl|banc|fidel)|socio|puntos|acumulado)/i,
        // Discounts/promos
        /^(dto\.?|descuento|ahorro|promo|oferta|rebaja|2[\s×x]\s*1|segunda\s+unid)/i,
        // Table headers
        /^(descripci[oó]n|p[\.\s]*v[\.\s]*p|p[\.\s]*unit|unid|precio|imp[\.\s]*€|cant[\.\s]|art[ií]culo)/i,
        // Pure numeric / separators / codes
        /^\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4}/,     // Dates
        /^\d{5,}/,                                 // Long codes
        /^[\d\s.,€$%()]+$/,                        // Only numbers/prices
        /^[\*\-=_\.#]{3,}$/,                        // Separators
        /^[A-Z]{1,3}\d{6,}/,                       // Barcodes
        /^op\s*:/i,
        /^\(\d+\)/,                                 // (1), (2) etc
        /^[A-Z]\s*$/,                               // Single letter
        /^[\d\s]+$/,                                 // Only digits/spaces
        /^reg\s*[\.:]/i,                            // REG:
        // Weight/quantity lines
        /^\d+[.,]\d+\s*(kg|g|l|ml|ud|un)\b/i,
        /^peso\s/i,
        // Payment methods
        /^(débito|crédito|contactless|pin|autorización|ref[\.\s]*\d)/i,
    ];

    // Words that if they appear anywhere in the line, it's probably not a product
    const skipWords = [
        /\btotal\b/i, /\bsubtotal\b/i, /\bcambio\b/i, /\befectivo\b/i,
        /\btarjeta\b/i, /\bfactura\b/i, /\bticket\b/i, /\bfidelidad\b/i,
        /\bpuntos\b/i, /\biva\b/i, /\bi\.v\.a\b/i, /\bbase\s*imp/i,
        /\brecibo\b/i, /\bautorizac/i, /\bterminal\b/i,
    ];

    for (const line of lines) {
        if (line.length < 3 || line.length > 80) continue;
        if (skipLine.some(p => p.test(line))) continue;
        if (skipWords.some(p => p.test(line))) continue;

        // ── Phase 2: Extract product name from line ──
        let name = extractProductName(line);
        if (!name || name.length < 2) continue;

        // Clean OCR junk
        name = name
            .replace(/[£|{}~`¢¥°©®™\[\]<>\\@#^]/g, "")
            .replace(/\b\d{3,}\b/g, "")          // remove 3+ digit numbers (codes)
            .replace(/\s{2,}/g, " ")
            .trim();

        if (!name || name.length < 2) continue;
        if (/^[\d\s.,€$%\-]+$/.test(name)) continue;

        // Capitalize
        name = name.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());

        // Expand abbreviations
        name = expandAbbreviations(name);
        if (!name || name.length < 2) continue;

        candidates.push(name);
    }

    // ── Phase 3: Score and filter candidates ──
    const products = [];
    const seenLower = new Set();

    for (const candidate of candidates) {
        const result = scoreCandidate(candidate);

        // Only keep if confidence is above threshold
        if (result.score < 30) {
            console.log(`  ✗ REJECTED (score ${result.score}): "${candidate}" → "${result.name}"`);
            continue;
        }

        const key = result.name.toLowerCase();
        if (seenLower.has(key)) continue;
        seenLower.add(key);

        console.log(`  ✓ ACCEPTED (score ${result.score}): "${candidate}" → "${result.name}"`);
        products.push({ name: result.name, selected: true, score: result.score });
    }

    // Sort by score descending
    products.sort((a, b) => b.score - a.score);

    return products;
}

/**
 * Extract the product name from a ticket line.
 * Handles formats like:
 *   "2 AGUA MINERAL  0,63  1,26"
 *   "LECHE ENTERA 1L    1,05€"
 *   "PLATANOS      1,29"
 *   "0,850 PECHUGA POLLO  3,29  2,80"
 */
function extractProductName(line) {
    // Try structured regex: [qty] NAME [prices]
    // Pattern: optional leading number/weight, then text, then price(s)
    const structured = line.match(
        /^(?:\d+[.,]?\d*\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñ][\wáéíóúñÁÉÍÓÚÑ\s.\-\/(),]+?)(?:\s{2,}|\s+)(\d+[.,]\d{2})\s*[€]?/
    );
    if (structured) {
        return structured[1].trim();
    }

    // Fallback: strip prices and quantities aggressively
    let name = line
        .replace(/\s+\d+[.,]\d{2}\s*[€]?\s*/g, " ")   // prices "1,29€"
        .replace(/^\d+[.,]?\d*\s+/,              "")     // leading qty "2 " or "0,850 "
        .replace(/\s+\d+[.,]\d{2}$/,             "")     // trailing price
        .replace(/\s*[—–\-]{2,}\s*/g,            "")     // long dashes
        .replace(/\s*\d{2,}\s*$/,                "")     // trailing numbers
        .replace(/\s+[A-Z]?\d+[.,]\d+\s*$/,     "")     // "A4,50" at end
        .replace(/\s{2,}/g,                      " ")
        .trim();

    return name || null;
}

/**
 * Score a candidate product name.
 * Returns { name: "Clean Name", score: 0-100 }
 * Score > 70: very likely a product (exact/close match)
 * Score 40-70: probable product (partial match or reasonable text)
 * Score < 30: probably noise
 */
function scoreCandidate(candidate) {
    const lower = candidate.toLowerCase().trim();

    // 1) Exact match in product bank → 100
    if (_productBankMap.has(lower)) {
        return { name: _productBankMap.get(lower), score: 100 };
    }

    // 2) Exact match in known products (Firestore) → 95
    for (const [key, val] of knownProducts) {
        if (key === lower) return { name: val.text, score: 95 };
    }

    // 3) Product bank contains/is contained by candidate
    let bestMatch = null;
    let bestMatchScore = 0;

    for (const bankProduct of PRODUCT_BANK) {
        const bankLower = bankProduct.toLowerCase();

        // Candidate contains bank product name
        if (lower.includes(bankLower) && bankLower.length >= 4) {
            const overlap = bankLower.length / lower.length;
            const s = 60 + Math.round(overlap * 30); // 60-90
            if (s > bestMatchScore) {
                bestMatch = bankProduct;
                bestMatchScore = s;
            }
        }
        // Bank product contains candidate
        if (bankLower.includes(lower) && lower.length >= 4) {
            const overlap = lower.length / bankLower.length;
            const s = 55 + Math.round(overlap * 30); // 55-85
            if (s > bestMatchScore) {
                bestMatch = bankProduct;
                bestMatchScore = s;
            }
        }
    }

    // 4) Check known Firestore products the same way
    for (const [key, val] of knownProducts) {
        if (lower.includes(key) && key.length >= 4) {
            const overlap = key.length / lower.length;
            const s = 65 + Math.round(overlap * 30);
            if (s > bestMatchScore) {
                bestMatch = val.text;
                bestMatchScore = s;
            }
        }
        if (key.includes(lower) && lower.length >= 4) {
            const overlap = lower.length / key.length;
            const s = 60 + Math.round(overlap * 30);
            if (s > bestMatchScore) {
                bestMatch = val.text;
                bestMatchScore = s;
            }
        }
    }

    if (bestMatch && bestMatchScore >= 50) {
        return { name: bestMatch, score: bestMatchScore };
    }

    // 5) Fuzzy match (Levenshtein) against bank
    if (lower.length >= 4) {
        let closestDist = Infinity;
        let closestName = null;
        for (const bankProduct of PRODUCT_BANK) {
            const bankLower = bankProduct.toLowerCase();
            if (Math.abs(bankLower.length - lower.length) > 2) continue;
            const dist = levenshtein(lower, bankLower);
            const threshold = Math.max(1, Math.floor(lower.length * 0.25));
            if (dist < closestDist && dist <= threshold) {
                closestDist = dist;
                closestName = bankProduct;
            }
        }
        if (closestName) {
            const s = 70 - (closestDist * 15); // 70 for dist=0, 55 for dist=1, etc.
            return { name: closestName, score: Math.max(40, s) };
        }
    }

    // 6) Also fuzzy-check Firestore products
    if (lower.length >= 4) {
        let closestDist = Infinity;
        let closestName = null;
        for (const [key, val] of knownProducts) {
            if (Math.abs(key.length - lower.length) > 2) continue;
            const dist = levenshtein(lower, key);
            const threshold = Math.max(1, Math.floor(lower.length * 0.25));
            if (dist < closestDist && dist <= threshold) {
                closestDist = dist;
                closestName = val.text;
            }
        }
        if (closestName) {
            const s = 65 - (closestDist * 15);
            return { name: closestName, score: Math.max(40, s) };
        }
    }

    // 7) No match found — apply heuristic score
    //    Check if it "looks like" a product name
    let heuristicScore = 25; // base: low confidence

    // Bonus: it's in AUTO_CATEGORY dictionary
    if (guessCategory(candidate) !== "Otros") heuristicScore += 25;

    // Bonus: contains mostly letters (not numbers/symbols)
    const letterRatio = (candidate.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/g) || []).length / candidate.length;
    if (letterRatio > 0.8) heuristicScore += 10;
    if (letterRatio < 0.5) heuristicScore -= 15;

    // Penalty: too short
    if (candidate.length < 4) heuristicScore -= 15;

    // Penalty: looks like a code or gibberish
    if (/\d{3,}/.test(candidate)) heuristicScore -= 20;
    if (/[A-Z]{5,}/.test(candidate) && !/[aeiouáéíóú]/i.test(candidate)) heuristicScore -= 20;

    // Penalty: single word that's very short
    if (!candidate.includes(" ") && candidate.length < 5) heuristicScore -= 10;

    return { name: candidate, score: Math.max(0, Math.min(100, heuristicScore)) };
}

/**
 * Simple Levenshtein distance
 */
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i-1] === b[j-1]
                ? dp[i-1][j-1]
                : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

// ──────────────────────────────────────────────
// Expand common Spanish supermarket abbreviations
// ──────────────────────────────────────────────
function expandAbbreviations(name) {
    const abbrevs = [
        [/\bAgua Min\b/i,              "Agua Mineral"],
        [/\bChoco[\.\-\s]?Leche\b/i,   "Chocolate Con Leche"],
        [/\bChoco\s+Almendra\b/i,       "Chocolate Almendra"],
        [/\bCap\.\s*/i,                 "Cápsulas "],
        [/\bC\.\s+/i,                   "Café "],
        [/\bC,\s+/i,                    "Café "],
        [/\b1£,\s*/i,                   "Café "],
        [/\bB\.\s*Basura\b/i,           "Bolsas De Basura"],
        [/\bB\.basura\b/i,              "Bolsas De Basura"],
        [/\bExt\.?\s*C\.?\s*F[aá]cil\b/i, "Extra Cierre Fácil"],
        [/\bAlum\b/i,                   "Aluminio"],
        [/\bAlu\b/i,                    "Aluminio"],
        [/\bDob\.\s*/i,                 "Doble "],
        [/\bPechuga\s+Pr\s*Me\b/i,      "Pechuga De Pavo Al Horno"],
        [/\bPechuga\s+Pavo\b/i,         "Pechuga De Pavo"],
        [/\bMigas\s+De\s+Co\s*Me\b/i,   "Migas De Coliflor"],
        [/\bMigas\s+De\s+Co\b/i,        "Migas De Coliflor"],
        [/\bPisto\s+De\s+Ve\b/i,        "Pisto De Verduras"],
        [/\bDiscos\s+Act\b/i,           "Discos Activos"],
        [/\bDiscos\s+A\b/i,             "Discos Activos"],
        [/\bLch\b/i,                    "Leche"],
        [/\bEntr\b/i,                   "Entera"],
        [/\bDesn\b/i,                   "Desnatada"],
        [/\bSemid\b/i,                  "Semidesnatada"],
        [/\bYog\b/i,                    "Yogur"],
        [/\bMant\b/i,                   "Mantequilla"],
        [/\bJam[oó]n?\s*S\b/i,          "Jamón Serrano"],
        [/\bJam[oó]n?\s*C\b/i,          "Jamón Cocido"],
        [/\bAceit\.\s*/i,               "Aceite "],
        [/\bOliv\.\s*/i,                "Oliva "],
        [/\bVirg\.\s*/i,                "Virgen "],
        [/\bExtra\.\s*/i,               "Extra "],
        [/\bAldo\s+E\s+Ne\b/i,          ""],
        [/\bPuro\s*[—–\-]+\s*,?\s*$/i,  "Puro"],
    ];

    for (const [pattern, replacement] of abbrevs) {
        name = name.replace(pattern, replacement);
    }

    return name.replace(/\s{2,}/g, " ").trim();
}

// ──────────────────────────────────────────────
// Render detected products in modal
// ──────────────────────────────────────────────
function renderScanResults(products) {
    scanResultsList.innerHTML = "";
    products.forEach((p, i) => {
        const li = document.createElement("li");
        li.className = "scan-result-item";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = p.selected;
        cb.addEventListener("change", () => { detectedProducts[i].selected = cb.checked; });

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.className = "scan-item-name-input";
        nameInput.value = p.name;
        nameInput.addEventListener("input", () => {
            detectedProducts[i].name = nameInput.value.trim();
        });

        const removeBtn = document.createElement("button");
        removeBtn.className = "scan-item-remove";
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", () => {
            detectedProducts.splice(i, 1);
            renderScanResults(detectedProducts);
        });

        li.append(cb, nameInput, removeBtn);
        scanResultsList.appendChild(li);
    });
}

// ──────────────────────────────────────────────
// Add scanned products to Firestore (2-step: review → confirm)
// Existing products → mark as purchased
// New products → add to list
// ──────────────────────────────────────────────
let productsToConfirm = [];
let productsToMark = [];

scanAddAll.addEventListener("click", () => {
    const toAdd = detectedProducts.filter(p => p.selected && p.name.trim());
    if (toAdd.length === 0) return;

    // Classify: new vs existing (to mark as purchased)
    const newProducts = [];
    const existingProducts = [];
    for (const p of toAdd) {
        const existing = knownProducts.get(p.name.trim().toLowerCase());
        if (existing) {
            existingProducts.push({ ...p, firestoreId: existing.id, alreadyChecked: existing.checked });
        } else {
            newProducts.push(p);
        }
    }

    // Build summary HTML
    let html = "";
    if (existingProducts.length > 0) {
        html += `<p class="scan-summary-title match">🛒 Se marcarán como comprados (${existingProducts.length}):</p><ul class="scan-summary-list match">`;
        for (const p of existingProducts) {
            const icon = p.alreadyChecked ? "✅" : "🔄";
            html += `<li>${icon} ${p.name}</li>`;
        }
        html += `</ul>`;
    }
    if (newProducts.length > 0) {
        html += `<p class="scan-summary-title new">➕ Se añadirán como comprados (${newProducts.length}):</p><ul class="scan-summary-list new">`;
        for (const p of newProducts) {
            const cat = guessCategory(p.name);
            html += `<li>${p.name} <span class="scan-summary-cat">→ ${cat}</span></li>`;
        }
        html += `</ul>`;
    }
    if (newProducts.length === 0 && existingProducts.length === 0) {
        html += `<p class="scan-summary-empty">No hay productos que procesar.</p>`;
    }

    scanSummary.innerHTML = html;
    scanSummary.style.display = "block";
    scanResultsList.style.display = "none";

    // Toggle buttons
    scanAddAll.style.display = "none";
    const totalActions = newProducts.length + existingProducts.length;
    if (totalActions > 0) {
        scanConfirmAdd.style.display = "";
        scanConfirmAdd.textContent = `✓ Confirmar (${totalActions})`;
        scanConfirmAdd.disabled = false;
    }

    productsToConfirm = newProducts;
    productsToMark = existingProducts;
});

scanConfirmAdd.addEventListener("click", async () => {
    if (productsToConfirm.length === 0 && productsToMark.length === 0) return;

    scanConfirmAdd.disabled = true;
    scanConfirmAdd.textContent = "Procesando...";

    const promises = [];

    // Mark existing products as purchased
    for (const p of productsToMark) {
        promises.push(toggleItem(p.firestoreId, true));
    }

    // Add new products as already purchased
    for (const p of productsToConfirm) {
        promises.push(
            addDoc(itemsRef, {
                text: p.name,
                category: guessCategory(p.name),
                checked: true,
                createdAt: serverTimestamp(),
                checkedAt: serverTimestamp(),
                purchaseHistory: [Timestamp.now()]
            })
        );
    }

    await Promise.all(promises);
    productsToConfirm = [];
    productsToMark = [];
    closeScanModal();
});
