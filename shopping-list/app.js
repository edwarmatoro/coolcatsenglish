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
// Add item
// ──────────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text     = itemInput.value.trim();
    const category = categorySelect.value;
    if (!text) return;
    itemInput.value = "";
    itemInput.focus();
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

    // Palabras/patrones a ignorar (cabeceras, totales, datos tienda, etc.)
    const skipPatterns = [
        /^(total|subtotal|iva|i\.v\.a|base|imponible|cambio|efectivo|tarjeta|visa|mastercard)/i,
        /^(nif|cif|c\.i\.f|tel[eé]f|factura|ticket|n[uú]m|fecha|hora|caja|op\.|tienda)/i,
        /^(gracias|bienvenid|atendid|le\s+ha\s+atendido|vuelva|fidelidad)/i,
        /^(dto|descuento|ahorro|promo|oferta|tarjeta\s+cl)/i,
        /^(mercadona|lidl|carrefour|aldi|dia|eroski|alcampo|hipercor|bonpreu|condis|caprabo|consum)/i,
        /^(supermercado|s\.a\.|s\.l\.|sociedad|direc)/i,
        /^\d{2}[\/\-.]\d{2}[\/\-.]\d{2,4}/,     // Fechas
        /^\d{5,}/,                                // Códigos largos
        /^[\d\s.,€$%]+$/,                         // Solo números/precios
        /^\*+/,                                   // Separadores
        /^-+$/,                                   // Separadores
        /^=+$/,                                   // Separadores
        /^[A-Z]{1,3}\d{6,}/,                     // Códigos de barras
        /^\d+[xX]\s/,                            // "2x ..." cantidad
    ];

    for (const line of lines) {
        // Ignorar líneas muy cortas o muy largas
        if (line.length < 3 || line.length > 60) continue;

        // Comprobar si es línea a ignorar
        if (skipPatterns.some(p => p.test(line))) continue;

        // Extraer nombre del producto:
        // Los tickets suelen tener: NOMBRE_PRODUCTO  PRECIO
        // Quitamos precio del final (números con , o . como decimales)
        let name = line
            .replace(/\s+\d+[.,]\d{2}\s*[€]?\s*$/,  "")  // "  2,35 €" al final
            .replace(/\s+\d+[.,]\d{2}$/,              "")  // "  2.35" al final
            .replace(/^\d+\s+/,                        "")  // "2 " al inicio (cantidad)
            .replace(/^\d+[.,]\d{3}\s*/,               "")  // código tipo "123.456"
            .replace(/\s{2,}/g,                        " ") // múltiples espacios
            .trim();

        // Ignorar si quedó vacío, solo números, o muy corto
        if (!name || name.length < 3 || /^[\d\s.,€%]+$/.test(name)) continue;

        // Capitalizar: primera letra mayúscula, resto minúscula
        name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

        // Evitar duplicados
        if (!products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            products.push({ name, selected: true });
        }
    }

    return products;
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

        const nameSpan = document.createElement("span");
        nameSpan.className = "scan-item-name";
        nameSpan.textContent = p.name;

        const removeBtn = document.createElement("button");
        removeBtn.className = "scan-item-remove";
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", () => {
            detectedProducts.splice(i, 1);
            renderScanResults(detectedProducts);
        });

        li.append(cb, nameSpan, removeBtn);
        scanResultsList.appendChild(li);
    });
}

// ──────────────────────────────────────────────
// Add scanned products to Firestore
// ──────────────────────────────────────────────
scanAddAll.addEventListener("click", async () => {
    const toAdd = detectedProducts.filter(p => p.selected);
    if (toAdd.length === 0) return;

    scanAddAll.disabled = true;
    scanAddAll.textContent = "Añadiendo...";

    const promises = toAdd.map(p =>
        addDoc(itemsRef, {
            text: p.name,
            category: "Otros",
            checked: false,
            createdAt: serverTimestamp()
        })
    );

    await Promise.all(promises);
    closeScanModal();
});
