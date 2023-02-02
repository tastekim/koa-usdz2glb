import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';


admin.initializeApp({
    credential : admin.credential.cert(`${process.env.KEYFILENAME}`)
});

export const db = getFirestore();

