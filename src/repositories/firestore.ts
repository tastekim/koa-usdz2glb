import * as admin from 'firebase-admin';
import firestore from 'firebase-admin/firestore';

admin.initializeApp({
    credential : admin.credential.cert(`${process.env.KEYFILENAME}`)
});

export const db = firestore.getFirestore();


