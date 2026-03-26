import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const uids = [
    "cEcLQyRnSVcsZ7Tuk5pl0jlHwbu2",
    "utMjDPP8Dyd3aHCpc0PmvdjJ6Y53",
];

for (const uid of uids) {
    await db.collection("userLists").doc(uid).delete();
    console.log(`🗑️  ${uid.slice(0,8)}… eliminado`);
}
