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
    getDocs,
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
const itemCount       = document.getElementById("itemCount");
const clearChecked    = document.getElementById("clearChecked");
const clearAll        = document.getElementById("clearAll");
const autoCatHint     = document.getElementById("autoCatHint");

// Sync dot
const syncDot = document.createElement("div");
syncDot.className = "sync-dot";
document.body.appendChild(syncDot);

let unsubscribe = null;

// ──────────────────────────────────────────────
// Auth state
// ──────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    if (user && ALLOWED_UIDS.includes(user.uid)) {
        authScreen.style.display = "none";
        appContent.style.display = "block";
        authError.textContent    = "";
        startListening();
    } else {
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
        (snapshot) => { syncDot.classList.remove("offline"); renderList(snapshot.docs); },
        () => syncDot.classList.add("offline")
    );
}

// ──────────────────────────────────────────────
// Render list grouped by category
// ──────────────────────────────────────────────
function renderList(docs) {
    shoppingList.querySelectorAll(".category-group, .list-item").forEach(el => el.remove());

    if (docs.length === 0) {
        emptyState.style.display = "block";
        itemCount.textContent = "";
        return;
    }

    emptyState.style.display = "none";
    const total   = docs.length;
    const checked = docs.filter(d => d.data().checked).length;
    itemCount.textContent = checked + "/" + total + " marcados";

    // Group docs by category in CATEGORIES order
    const grouped = {};
    CATEGORIES.forEach(cat => { grouped[cat] = []; });

    docs.forEach(docSnap => {
        const cat = docSnap.data().category || "Otros";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(docSnap);
    });

    CATEGORIES.forEach(cat => {
        if (grouped[cat].length === 0) return;

        const section = document.createElement("div");
        section.className = "category-group";

        const heading = document.createElement("h3");
        heading.className = "category-heading";
        heading.textContent = cat;
        section.appendChild(heading);

        const ul = document.createElement("ul");
        ul.className = "category-items";
        grouped[cat]
            .sort((a, b) => (a.data().text || "").localeCompare(b.data().text || "", "es"))
            .forEach(docSnap => {
            const data = docSnap.data();
            ul.appendChild(createItemElement(docSnap.id, data.text, data.checked, data.purchaseHistory));
        });

        section.appendChild(ul);
        shoppingList.appendChild(section);
    });
}

// ──────────────────────────────────────────────
// Create list item element
// ──────────────────────────────────────────────
function createItemElement(id, text, checked, purchaseHistory) {
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
    label.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        toggleItem(id, checkbox.checked);
    });

    textWrapper.appendChild(label);

    if (purchaseHistory && purchaseHistory.length > 0) {
        const dates = purchaseHistory.map(ts => {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
        });
        // Eliminar fechas duplicadas (mismo día)
        const uniqueDates = [...new Set(dates)];
        const dateSpan = document.createElement("span");
        dateSpan.className = "item-checked-date";
        dateSpan.textContent = "🛒 Compra: " + uniqueDates.join(", ");
        textWrapper.appendChild(dateSpan);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className   = "btn-delete";
    deleteBtn.textContent = "x";
    deleteBtn.setAttribute("aria-label", "Eliminar");
    deleteBtn.addEventListener("click", () => removeItem(id));

    li.append(checkbox, textWrapper, deleteBtn);
    return li;
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
});

// ──────────────────────────────────────────────
// Add item
// ──────────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = itemInput.value.trim();
    if (!text) return;
    // Use auto-detected category if user didn't manually change it
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

clearChecked.addEventListener("click", async () => {
    const snapshot = await getDocs(query(itemsRef));
    const toDelete = snapshot.docs.filter(d => d.data().checked);
    await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
});

clearAll.addEventListener("click", async () => {
    if (!confirm("¿Seguro que quieres vaciar toda la lista?")) return;
    const snapshot = await getDocs(query(itemsRef));
    await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
});

// ──────────────────────────────────────────────
// Ticket scanner (Tesseract.js OCR)
// ──────────────────────────────────────────────
const scanTicketBtn  = document.getElementById("scanTicket");
const scanModal      = document.getElementById("scanModal");
const scanClose      = document.getElementById("scanClose");
const scanFileInput  = document.getElementById("scanFileInput");
const scanUploadLabel = document.getElementById("scanUploadLabel");
const scanPreview    = document.getElementById("scanPreview");
const scanProgress   = document.getElementById("scanProgress");
const scanProgressBar = document.getElementById("scanProgressBar");
const scanProgressText = document.getElementById("scanProgressText");
const scanResults    = document.getElementById("scanResults");
const scanResultsList = document.getElementById("scanResultsList");
const scanAddAll     = document.getElementById("scanAddAll");
const scanCancel     = document.getElementById("scanCancel");

let tesseractLoaded = false;
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
    scanUploadLabel.style.display = "flex";
    scanResultsList.innerHTML = "";
    scanFileInput.value = "";
    detectedProducts = [];
}

// Load Tesseract.js lazily
async function loadTesseract() {
    if (tesseractLoaded) return;
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.onload = () => { tesseractLoaded = true; resolve(); };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

scanFileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const url = URL.createObjectURL(file);
    scanPreview.src = url;
    scanPreview.style.display = "block";
    scanUploadLabel.style.display = "none";
    scanProgress.style.display = "flex";
    scanProgressText.textContent = "Cargando OCR...";
    scanProgressBar.style.setProperty("--progress", "10%");

    try {
        await loadTesseract();
        scanProgressText.textContent = "Leyendo ticket...";
        scanProgressBar.style.setProperty("--progress", "30%");

        const result = await Tesseract.recognize(file, "spa", {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    const pct = Math.round(30 + m.progress * 60);
                    scanProgressBar.style.setProperty("--progress", pct + "%");
                    scanProgressText.textContent = "Leyendo... " + Math.round(m.progress * 100) + "%";
                }
            }
        });

        scanProgressBar.style.setProperty("--progress", "95%");
        scanProgressText.textContent = "Analizando productos...";

        const products = parseTicket(result.data.text);
        scanProgressBar.style.setProperty("--progress", "100%");

        if (products.length === 0) {
            scanProgressText.textContent = "No se detectaron productos. Intenta con otra foto.";
            return;
        }

        detectedProducts = products;
        renderScanResults(products);
        scanProgress.style.display = "none";
        scanResults.style.display = "block";

    } catch (err) {
        console.error("OCR error:", err);
        scanProgressText.textContent = "Error al procesar. Intenta con otra foto.";
    }
});

// ──────────────────────────────────────────────
// Parse ticket text into product names
// ──────────────────────────────────────────────
function parseTicket(rawText) {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const products = [];

    // Líneas completas a descartar
    const skipPatterns = [
        /^(total|subtotal|iva|i\.v\.a|base\s*impon|cambio|efectivo|tarjeta|visa|mastercard|importe)/i,
        /^(nif|cif|c\.i\.f|tel[eé]f|factura|ticket|n[uú]m|fecha|hora|caja|op[\.:]\s*\d)/i,
        /^(gracias|bienvenid|atendid|le\s+ha\s+atendido|vuelva|fidelidad|cliente)/i,
        /^(dto\.?|descuento|ahorro|promo|oferta|tarjeta\s+(cl|banc))/i,
        /^(mercadona|lidl|carrefour|aldi|dia\b|eroski|alcampo|hipercor|bonpreu|condis|caprabo|consum)/i,
        /^(supermercado|s\.a\.|s\.l\.|sociedad|direc|www\.|http)/i,
        /^(descripci[oó]n|p[\.\s]*unit|unid|precio|imp[\.\s]*€)/i,
        /^\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4}/,           // Fechas: 22/03/2022
        /^\d{5,}/,                                      // Códigos largos
        /^[\d\s.,€$%()]+$/,                             // Solo números/precios
        /^[\*\-=_\.]{3,}$/,                             // Separadores
        /^[A-Z]{1,3}\d{6,}/,                           // Códigos de barras
        /^op\s*:/i,                                     // OP: 100020
    ];

    // Regex para línea de producto: "2 AGUA MINERAL  0,63  1,26"
    const productLineRegex = /^(\d+\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñ][\w\s.\-\/(),áéíóúñÁÉÍÓÚÑ]+?)(?:\s{2,}|\s+)(\d+[.,]\d{2})\s*(?:[€]?\s*(\d+[.,]\d{2})?\s*[€]?)?$/;

    for (const line of lines) {
        if (line.length < 3 || line.length > 80) continue;
        if (skipPatterns.some(p => p.test(line))) continue;

        let name = null;

        // Intento 1: regex estructurado
        const match = line.match(productLineRegex);
        if (match) {
            name = match[2].trim();
        }

        // Intento 2: limpiar manualmente
        if (!name) {
            name = line
                .replace(/\s+\d+[.,]\d{2}\s*[€]?\s*/g, " ")  // Quitar precios
                .replace(/^\d+\s+/,                       "")   // Quitar cantidad "2 "
                .replace(/\s*[—–\-]{2,}\s*/g,             "")   // Guiones largos
                .replace(/\s*\d{2,}\s*$/,                 "")   // Números sueltos al final
                .replace(/\s{2,}/g,                       " ")
                .trim();
        }

        if (!name || name.length < 3) continue;

        // Limpiar caracteres basura de OCR
        name = name
            .replace(/[£|{}~`¢¥°©®™\[\]<>]/g, "")
            .replace(/\b\d{2,}\b/g, "")
            .replace(/\s{2,}/g, " ")
            .trim();

        if (!name || name.length < 3) continue;
        if (/^[\d\s.,€$%\-]+$/.test(name)) continue;
        if (/^(descripci|p[\.\s]*unit|importe|unid)/i.test(name)) continue;

        // Capitalizar cada palabra
        name = name.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());

        // Expandir abreviaturas comunes
        name = expandAbbreviations(name);

        if (!name || name.length < 3) continue;

        // Evitar duplicados
        if (!products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            products.push({ name, selected: true });
        }
    }

    return products;
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
// Add scanned products to Firestore
// ──────────────────────────────────────────────
scanAddAll.addEventListener("click", async () => {
    const toAdd = detectedProducts.filter(p => p.selected && p.name.trim());
    if (toAdd.length === 0) return;

    scanAddAll.disabled = true;
    scanAddAll.textContent = "Añadiendo...";

    const promises = toAdd.map(p =>
        addDoc(itemsRef, {
            text: p.name,
            category: guessCategory(p.name),
            checked: false,
            createdAt: serverTimestamp()
        })
    );

    await Promise.all(promises);
    closeScanModal();
});
