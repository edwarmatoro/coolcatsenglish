/**
 * seed-multiuser.mjs
 * ─────────────────────────────────────────────────────────────────
 * Crea en Firestore:
 *   - userLists/{uid}  para los 3 usuarios existentes
 *   - invites/{CODE}   con un código de invitación de prueba
 *
 * Uso (una sola vez, con Node.js ≥18):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node seed-multiuser.mjs
 * ─────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Usuarios existentes ──────────────────────────────────────────
const EXISTING_USERS = [
    { uid: "mOaWpDNNlgTd2CAkQ59uck8Q1Uc2", listId: "family", label: "🏠 Lista familiar" },
    { uid: "cEcLQyRnSVcsZ7Tuk5pl0jlHwbu2", listId: "family", label: "🏠 Lista familiar" },
    { uid: "8y0qijBnTeflWPbJV23tY5FfFe63", listId: "family", label: "🏠 Lista familiar" },
];

// ── Códigos de invitación ────────────────────────────────────────
const INVITE_CODES = [
    { code: "FAMILIA2025", listId: "family", label: "🏠 Lista familiar" },
];

async function seed() {
    console.log("📋 Registrando usuarios en userLists...");
    for (const { uid, listId, label } of EXISTING_USERS) {
        await db.collection("userLists").doc(uid).set({ listId, label });
        console.log(`  ✅ ${uid.slice(0, 8)}… → ${listId}`);
    }

    console.log("\n🔑 Creando códigos de invitación en invites...");
    for (const { code, listId, label } of INVITE_CODES) {
        await db.collection("invites").doc(code).set({ listId, label });
        console.log(`  ✅ ${code} → ${listId}`);
    }

    console.log("\n🎉 Listo. Ya puedes probar el flujo de invitación.");
    console.log("   Código de prueba: FAMILIA2025");
}

seed().catch(console.error);
