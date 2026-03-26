import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const FAMILY  = { listId: "family", label: "🏠 Lista familiar" };
const COLBCN  = { listId: "pytp",   label: "🛒 ColBcn" };

const updates = [
    // Susana — solo familiar
    { uid: "8y0qijBnTeflWPbJV23tY5FfFe63", lists: [FAMILY], listIds: ["family"] },
    // Edwar Macias — familiar + ColBcn
    { uid: "mOaWpDNNlgTd2CAkQ59uck8Q1Uc2", lists: [FAMILY, COLBCN], listIds: ["family", "pytp"] },
];

for (const { uid, lists, listIds } of updates) {
    await db.collection("userLists").doc(uid).set({ lists, listIds });
    console.log(`✅ ${uid.slice(0,8)}… → [${listIds.join(", ")}]`);
}
console.log("\nHecho.");
