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

// Sync dot
const syncDot = document.createElement("div");
syncDot.className = "sync-dot";
document.body.appendChild(syncDot);

let unsubscribe = null;

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
    // These are candidates for "buy again"
    const candidates = [];
    lastDocs.forEach(d => {
        const data = d.data();
        const name = (data.text || "").trim();
        const lower = name.toLowerCase();
        if (!name) return;
        if (pendingNames.has(lower)) return;           // already pending, skip
        if (!data.checked) return;                      // unchecked but somehow not pending? skip
        const count = (data.purchaseHistory && data.purchaseHistory.length) || 0;
        candidates.push({ text: name, count, id: d.id });
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

    // "Add all" button
    const addAllBtn = document.createElement("button");
    addAllBtn.className = "frequent-chip frequent-chip-all";
    addAllBtn.textContent = "➕ Añadir todos";
    addAllBtn.addEventListener("click", async () => {
        addAllBtn.disabled = true;
        addAllBtn.textContent = "Añadiendo...";
        for (const item of candidates) {
            // Uncheck them so they become pending again
            await updateDoc(doc(db, "items", item.id), { checked: false });
        }
        frequentPanel.style.display = "none";
        showFrequentBtn.classList.remove("active");
    });
    frequentChips.appendChild(addAllBtn);

    candidates.forEach(item => {
        const chip = document.createElement("button");
        chip.className = "frequent-chip";
        if (item.count > 1) {
            chip.innerHTML = `${item.text} <span class="frequent-count">×${item.count}</span>`;
        } else {
            chip.textContent = item.text;
        }
        chip.title = `Volver a poner "${item.text}" como pendiente`;

        chip.addEventListener("click", async () => {
            // Uncheck → becomes pending again
            await updateDoc(doc(db, "items", item.id), { checked: false });
            chip.classList.add("just-added");
            chip.disabled = true;
            setTimeout(() => {
                chip.remove();
                // If no more chips, close panel
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
        itemCount.textContent = "";
        renderedItems.clear();
        return;
    }

    const total   = docs.length;
    const checked = docs.filter(d => d.data().checked).length;
    itemCount.textContent = checked + "/" + total + " marcados";

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
            if (el) el.remove();
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
            section.appendChild(heading);
            const ul = document.createElement("ul");
            ul.className = "category-items";
            section.appendChild(ul);
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
                if (oldEl) oldEl.remove();

                // Create new element
                const newEl = createItemElement(id, data.text, data.checked, data.purchaseHistory, data.note);

                // Insert in sorted position
                const existingItems = [...ul.querySelectorAll(".list-item")];
                let insertedItem = false;
                for (const item of existingItems) {
                    const itemText = item.querySelector(".item-label")?.textContent || "";
                    if (data.text.localeCompare(itemText, "es") < 0) {
                        ul.insertBefore(newEl, item);
                        insertedItem = true;
                        break;
                    }
                }
                if (!insertedItem) ul.appendChild(newEl);

                // Don't animate on updates, only on new items
                if (prev) newEl.style.animation = "none";

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
                el.remove();
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
    label.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        toggleItem(id, checkbox.checked);
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

    if (purchaseHistory && purchaseHistory.length > 0) {
        const dates = purchaseHistory.map(ts => {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
        });
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
// Suggestions while typing
// ──────────────────────────────────────────────
function showSuggestions(text) {
    suggestions.innerHTML = "";
    if (text.length < 2) { suggestions.style.display = "none"; return; }

    const lower = text.toLowerCase();
    const allNames = [...knownProducts.values()].map(v => v.text);
    const matches = allNames
        .filter(p => p.toLowerCase().includes(lower))
        .sort((a, b) => {
            // Prioritize products that START with the typed text
            const aStarts = a.toLowerCase().startsWith(lower) ? 0 : 1;
            const bStarts = b.toLowerCase().startsWith(lower) ? 0 : 1;
            if (aStarts !== bStarts) return aStarts - bStarts;
            return a.localeCompare(b, "es");
        })
        .slice(0, 8);

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
const scanConfirmAdd = document.getElementById("scanConfirmAdd");
const scanSummary    = document.getElementById("scanSummary");
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
    scanResultsList.style.display = "";
    scanFileInput.value = "";
    detectedProducts = [];
    productsToConfirm = [];
    scanAddAll.disabled = false;
    scanAddAll.style.display = "";
    scanAddAll.textContent = "✓ Añadir todos";
    scanSummary.style.display = "none";
    scanSummary.innerHTML = "";
    scanConfirmAdd.style.display = "none";
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
// Add scanned products to Firestore (2-step: review → confirm)
// ──────────────────────────────────────────────
let productsToConfirm = [];

scanAddAll.addEventListener("click", () => {
    const toAdd = detectedProducts.filter(p => p.selected && p.name.trim());
    if (toAdd.length === 0) return;

    // Classify: new vs duplicates
    const newProducts = [];
    const duplicates  = [];
    for (const p of toAdd) {
        const isDup = knownProducts.has(p.name.trim().toLowerCase());
        if (isDup) duplicates.push(p);
        else newProducts.push(p);
    }

    // Build summary HTML
    let html = "";
    if (newProducts.length > 0) {
        html += `<p class="scan-summary-title new">✅ Se añadirán (${newProducts.length}):</p><ul class="scan-summary-list new">`;
        for (const p of newProducts) {
            const cat = guessCategory(p.name);
            html += `<li>${p.name} <span class="scan-summary-cat">→ ${cat}</span></li>`;
        }
        html += `</ul>`;
    }
    if (duplicates.length > 0) {
        html += `<p class="scan-summary-title dup">⚠️ Ya en la lista (${duplicates.length}):</p><ul class="scan-summary-list dup">`;
        for (const p of duplicates) html += `<li>${p.name}</li>`;
        html += `</ul>`;
    }
    if (newProducts.length === 0) {
        html += `<p class="scan-summary-empty">No hay productos nuevos que añadir.</p>`;
    }

    scanSummary.innerHTML = html;
    scanSummary.style.display = "block";
    scanResultsList.style.display = "none";

    // Toggle buttons
    scanAddAll.style.display = "none";
    if (newProducts.length > 0) {
        scanConfirmAdd.style.display = "";
        scanConfirmAdd.textContent = `✓ Confirmar (${newProducts.length})`;
        scanConfirmAdd.disabled = false;
    }

    productsToConfirm = newProducts;
});

scanConfirmAdd.addEventListener("click", async () => {
    if (productsToConfirm.length === 0) return;

    scanConfirmAdd.disabled = true;
    scanConfirmAdd.textContent = "Añadiendo...";

    const promises = productsToConfirm.map(p =>
        addDoc(itemsRef, {
            text: p.name,
            category: guessCategory(p.name),
            checked: false,
            createdAt: serverTimestamp()
        })
    );

    await Promise.all(promises);
    productsToConfirm = [];
    closeScanModal();
});
