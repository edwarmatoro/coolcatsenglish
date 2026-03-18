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
    "Lacteos y Huevos",
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
const authScreen      = document.getElementById("authScreen");
const appContent      = document.getElementById("appContent");
const googleSignIn    = document.getElementById("googleSignIn");
const signOutBtn      = document.getElementById("signOutBtn");
const authError       = document.getElementById("authError");
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
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
        console.error(err.code, err.message);
        authError.textContent = "Error al iniciar sesión: " + err.code;
    }
});

signOutBtn.addEventListener("click", () => signOut(auth));

// ──────────────────────────────────────────────
// Firestore real-time listener
// ──────────────────────────────────────────────
function startListening() {
    if (unsubscribe) return;
    const q = query(itemsRef, orderBy("category", "asc"), orderBy("createdAt", "asc"));
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
    const snapshot = await new Promise(resolve =>
        onSnapshot(query(itemsRef), resolve, { once: true })
    );
    const toDelete = snapshot.docs.filter(d => d.data().checked);
    await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
});
