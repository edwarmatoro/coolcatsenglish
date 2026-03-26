/**
 * seed-multiuser.mjs
 * ─────────────────────────────────────────────────────────────────
 * Migra userLists al nuevo formato multi-lista y crea invitaciones.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node seed-multiuser.mjs
 * ─────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Configuración de usuarios ────────────────────────────────────
// lists: todas las listas a las que pertenece el usuario
const USERS = [
    {
        uid: "mOaWpDNNlgTd2CAkQ59uck8Q1Uc2",
        lists: [
            { listId: "family", label: "🏠 Lista familiar" },
            { listId: "pytp",   label: "🛒 ColBcn" },       // ← ajusta el emoji/nombre si quieres
        ]
    },
    {
        uid: "cEcLQyRnSVcsZ7Tuk5pl0jlHwbu2",
        lists: [
            { listId: "family", label: "🏠 Lista familiar" },
            { listId: "pytp",   label: "🛒 ColBcn" },
        ]
    },
    {
        uid: "8y0qijBnTeflWPbJV23tY5FfFe63",
        lists: [
            { listId: "family", label: "🏠 Lista familiar" },
            { listId: "pytp",   label: "🛒 ColBcn" },
        ]
    },
];

// ── Códigos de invitación ────────────────────────────────────────
const INVITE_CODES = [
    { code: "FAMILIA2025", listId: "family", label: "🏠 Lista familiar" },
    { code: "PYTP2025",    listId: "pytp",   label: "🛒 ColBcn" },
];

async function seed() {
    console.log("📋 Actualizando userLists al nuevo formato multi-lista...");
    for (const { uid, lists } of USERS) {
        const listIds = lists.map(l => l.listId);
        await db.collection("userLists").doc(uid).set({ lists, listIds });
        console.log(`  ✅ ${uid.slice(0, 8)}… → [${listIds.join(", ")}]`);
    }

    console.log("\n🔑 Creando códigos de invitación...");
    for (const { code, listId, label } of INVITE_CODES) {
        await db.collection("invites").doc(code).set({ listId, label });
        console.log(`  ✅ ${code} → ${listId}`);
    }

    console.log("\n🎉 Listo.");
    console.log("   Códigos de prueba: FAMILIA2025 / PYTP2025");
}

seed().catch(console.error);
