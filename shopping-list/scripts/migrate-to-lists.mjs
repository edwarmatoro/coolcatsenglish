/**
 * migrate-to-lists.mjs
 * ─────────────────────────────────────────────────────────────────
 * Migra todos los documentos de la colección raíz "items" a
 * "lists/family/items", preservando todos los campos y el ID.
 *
 * Uso (una sola vez, con Node.js ≥18):
 *   npm install firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node migrate-to-lists.mjs
 *
 * Necesitas descargar la clave de servicio desde:
 *   Firebase Console → Configuración del proyecto → Cuentas de servicio
 *   → Generar nueva clave privada → guardar como serviceAccountKey.json
 *   (NO subas ese archivo a git)
 * ─────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("../serviceAccountKey.json", "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function migrate() {
    const sourceRef = db.collection("items");
    const destRef   = db.collection("lists").doc("family").collection("items");

    const snapshot = await sourceRef.get();

    if (snapshot.empty) {
        console.log("✅ La colección 'items' está vacía. Nada que migrar.");
        return;
    }

    console.log(`📦 Migrando ${snapshot.size} documentos a lists/family/items ...`);

    let ok = 0;
    let fail = 0;

    for (const docSnap of snapshot.docs) {
        try {
            // Preservar mismo ID
            await destRef.doc(docSnap.id).set(docSnap.data());
            ok++;
            process.stdout.write(".");
        } catch (err) {
            fail++;
            console.error(`\n❌ Error en doc ${docSnap.id}:`, err.message);
        }
    }

    console.log(`\n\n✅ Migrados: ${ok}  ❌ Errores: ${fail}`);
    console.log("\n⚠️  Los documentos originales en 'items' NO han sido eliminados.");
    console.log("   Verifica la app, y si todo va bien, bórralos manualmente desde la consola de Firebase.");
}

migrate().catch(console.error);
