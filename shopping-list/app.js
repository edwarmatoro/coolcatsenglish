// ──────────────────────────────────────────────
// Firebase configuration
// Replace the values below with your own config
// from: Firebase Console → Project settings → Your apps
// ──────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
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

const firebaseConfig = {
    apiKey:            "AIzaSyDPgwJeDcUnlekEDIEeAB5qRt6AAY22vt4",
    authDomain:        "shopping-list-db55b.firebaseapp.com",
    projectId:         "shopping-list-db55b",
    storageBucket:     "shopping-list-db55b.firebasestorage.app",
    messagingSenderId: "511359469906",
    appId:             "1:511359469906:web:c29b0994d958fee8b9928b"
};

// ──────────────────────────────────────────────
// Init Firebase
// ──────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const itemsRef = collection(db, "items");

// ──────────────────────────────────────────────
// DOM references
// ──────────────────────────────────────────────
const addForm      = document.getElementById("addForm");
const itemInput    = document.getElementById("itemInput");
const shoppingList = document.getElementById("shoppingList");
const emptyState   = document.getElementById("emptyState");
const itemCount    = document.getElementById("itemCount");
const clearChecked = document.getElementById("clearChecked");

// Sync indicator dot
const syncDot = document.createElement("div");
syncDot.className = "sync-dot";
document.body.appendChild(syncDot);

// ──────────────────────────────────────────────
// Real-time listener — Firestore → UI
// ──────────────────────────────────────────────
const q = query(itemsRef, orderBy("createdAt", "asc"));

onSnapshot(q,
    (snapshot) => {
        syncDot.classList.remove("offline");
        renderList(snapshot.docs);
    },
    () => {
        syncDot.classList.add("offline");
    }
);

function renderList(docs) {
    // Remove all list items (keep empty state element)
    shoppingList.querySelectorAll(".list-item").forEach(el => el.remove());

    if (docs.length === 0) {
        emptyState.style.display = "block";
        itemCount.textContent = "";
        return;
    }

    emptyState.style.display = "none";

    const total   = docs.length;
    const checked = docs.filter(d => d.data().checked).length;
    itemCount.textContent = `${checked}/${total} checked`;

    docs.forEach(docSnap => {
        const { text, checked } = docSnap.data();
        const li = createItemElement(docSnap.id, text, checked);
        shoppingList.appendChild(li);
    });
}

// ──────────────────────────────────────────────
// Create a list item DOM element
// ──────────────────────────────────────────────
function createItemElement(id, text, checked) {
    const li = document.createElement("li");
    li.className = `list-item${checked ? " checked" : ""}`;
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

    await addDoc(itemsRef, {
        text,
        checked:   false,
        createdAt: serverTimestamp()
    });
});

// ──────────────────────────────────────────────
// Toggle checked
// ──────────────────────────────────────────────
async function toggleItem(id, checked) {
    await updateDoc(doc(db, "items", id), { checked });
}

// ──────────────────────────────────────────────
// Remove single item
// ──────────────────────────────────────────────
async function removeItem(id) {
    await deleteDoc(doc(db, "items", id));
}

// ──────────────────────────────────────────────
// Clear all checked items
// ──────────────────────────────────────────────
clearChecked.addEventListener("click", async () => {
    const snapshot = await new Promise(resolve =>
        onSnapshot(query(itemsRef), resolve, { once: true })
    );
    const checkedDocs = snapshot.docs.filter(d => d.data().checked);
    await Promise.all(checkedDocs.map(d => deleteDoc(d.ref)));
});
