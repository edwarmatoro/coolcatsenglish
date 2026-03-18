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
    "cEcLQyRnSVcsZ7Tuk5pl0jlHwbu2"
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
        grouped[cat].forEach(docSnap => {
            ul.appendChild(createItemElement(docSnap.id, docSnap.data().text, docSnap.data().checked));
        });

        section.appendChild(ul);
        shoppingList.appendChild(section);
    });
}

// ──────────────────────────────────────────────
// Create list item element
// ──────────────────────────────────────────────
function createItemElement(id, text, checked) {
    const li = document.createElement("li");
    li.className  = "list-item" + (checked ? " checked" : "");
    li.dataset.id = id;

    const checkbox = document.createElement("input");
    checkbox.type    = "checkbox";
    checkbox.checked = checked;
    checkbox.addEventListener("change", () => toggleItem(id, checkbox.checked));

    const label = document.createElement("span");
    label.className   = "item-label";
    label.textContent = text;
    label.addEventListener("click", () => {
        checkbox.checked = !checkbox.checked;
        toggleItem(id, checkbox.checked);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className   = "btn-delete";
    deleteBtn.textContent = "x";
    deleteBtn.setAttribute("aria-label", "Eliminar");
    deleteBtn.addEventListener("click", () => removeItem(id));

    li.append(checkbox, label, deleteBtn);
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
    await updateDoc(doc(db, "items", id), { checked });
}

async function removeItem(id) {
    await deleteDoc(doc(db, "items", id));
}

clearChecked.addEventListener("click", async () => {
    const snapshot = await getDocs(query(itemsRef));
    const toDelete = snapshot.docs.filter(d => d.data().checked);
    await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
});
