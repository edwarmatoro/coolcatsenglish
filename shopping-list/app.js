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
// Allowed users — add both Google UIDs here
// (see instructions below to get them)
// ──────────────────────────────────────────────
const ALLOWED_UIDS = [
    "mOaWpDNNlgTd2CAkQ59uck8Q1Uc2",  // edwarmatoro
    "PAREJA_UID_HERE"                  // pareja (añadir después)
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
const authScreen   = document.getElementById("authScreen");
const appContent   = document.getElementById("appContent");
const googleSignIn = document.getElementById("googleSignIn");
const signOutBtn   = document.getElementById("signOutBtn");
const authError    = document.getElementById("authError");
const addForm      = document.getElementById("addForm");
const itemInput    = document.getElementById("itemInput");
const shoppingList = document.getElementById("shoppingList");
const emptyState   = document.getElementById("emptyState");
const itemCount    = document.getElementById("itemCount");
const clearChecked = document.getElementById("clearChecked");

// Sync dot
const syncDot = document.createElement("div");
syncDot.className = "sync-dot";
document.body.appendChild(syncDot);

// Firestore unsubscribe handle
let unsubscribe = null;

// ──────────────────────────────────────────────
// Auth state listener
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
            authError.textContent = `⛔ Access denied for ${user.email}`;
            signOut(auth);
        }

        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    }
});

// ──────────────────────────────────────────────
// Sign in with Google (popup)
// ──────────────────────────────────────────────
googleSignIn.addEventListener("click", async () => {
    authError.textContent = "";
    try {
        await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
        console.error("❌ Sign-in error:", err.code, err.message);
        authError.textContent = `Error: ${err.code}`;
    }
});

// ──────────────────────────────────────────────
// Sign out
// ──────────────────────────────────────────────
signOutBtn.addEventListener("click", () => signOut(auth));

// ──────────────────────────────────────────────
// Real-time Firestore listener
// ──────────────────────────────────────────────
function startListening() {
    if (unsubscribe) return;

    const q = query(itemsRef, orderBy("createdAt", "asc"));
    unsubscribe = onSnapshot(q,
        (snapshot) => {
            syncDot.classList.remove("offline");
            renderList(snapshot.docs);
        },
        () => syncDot.classList.add("offline")
    );
}

// ──────────────────────────────────────────────
// Render list
// ──────────────────────────────────────────────
function renderList(docs) {
    shoppingList.querySelectorAll(".list-item").forEach(el => el.remove());

    if (docs.length === 0) {
        emptyState.style.display = "block";
        itemCount.textContent    = "";
        return;
    }

    emptyState.style.display = "none";
    const total   = docs.length;
    const checked = docs.filter(d => d.data().checked).length;
    itemCount.textContent = `${checked}/${total} checked`;

    docs.forEach(docSnap => {
        const { text, checked } = docSnap.data();
        shoppingList.appendChild(createItemElement(docSnap.id, text, checked));
    });
}

// ──────────────────────────────────────────────
// Create list item element
// ──────────────────────────────────────────────
function createItemElement(id, text, checked) {
    const li = document.createElement("li");
    li.className  = `list-item${checked ? " checked" : ""}`;
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
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Delete item");
    deleteBtn.addEventListener("click", () => removeItem(id));

    li.append(checkbox, label, deleteBtn);
    return li;
}

// ──────────────────────────────────────────────
// Add item
// ──────────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = itemInput.value.trim();
    if (!text) return;
    itemInput.value = "";
    itemInput.focus();
    await addDoc(itemsRef, { text, checked: false, createdAt: serverTimestamp() });
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
