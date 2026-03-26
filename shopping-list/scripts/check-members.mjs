import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

const snap = await db.collection("userLists").get();
for (const doc of snap.docs) {
    const uid = doc.id;
    const data = doc.data();
    const lists = data.lists?.map(l => l.label).join(", ") || data.label || "?";
    try {
        const user = await auth.getUser(uid);
        console.log(`${uid} | ${user.displayName || user.email} → [${lists}]`);
    } catch {
        console.log(`${uid} | ??? → [${lists}]`);
    }
}
