import { firestore } from 'firebase-admin';
import WriteResult = firestore.WriteResult;
import '../repositories/firestore';
import { db } from '../repositories/firestore';
import { deleteObject } from './cloud-storage-module';

// 상품명으로 객체화해서 Sample DB 저장
export async function setSampleData(productName: string, glbUrl: string, glbSize: string, usdzUrl: string, usdzSize: string) {
    try {
        const collection = db.collection('samples');
        const docRef = collection.doc();
        return await docRef.set({
            name : productName,
            glb_url : glbUrl,
            glbSize : glbSize,
            usdz_url : usdzUrl,
            usdzSize : usdzSize,
            created_at : new Date(),
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
    }
}

// samples 내용 조회
export async function getSampleData(productId: string) {
    try {
        const collection = db.collection('samples');
        const docRef = collection.doc(productId);
        const doc = await docRef.get();
        if (!doc.exists) {
            throw new Error('Sample does not exist');
        }
        const data = doc.data();
        return {
            id : doc.id,
            data : data,
        };
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
    }
}

// 페어 샘플용 내용 조회
export async function getAllSampleData() {
    try {
        const collection = db.collection('samples');
        const docs = await collection.get();
        let dataArr: object[] = [];
        docs.forEach((d: any) => {
            let id = d.id;
            let data = d.data();
            dataArr.push({ id, data });
        });
        return dataArr;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
    }
}

// 샘플 데이터 삭제
export async function deleteSampleData(productId: string) {
    try {
        const collection = db.collection('samples');
        const docRef = collection.doc(productId);
        const doc: any = await docRef.get();
        if (!doc.exists) {
            throw new Error('Sample does not exist');
        }
        const docDeleteResult = await deleteObject(doc.data().name);
        if (typeof docDeleteResult !== 'undefined') {
            throw new Error('Sample does not exist');
        }
        return await docRef.delete()
            .then((s: WriteResult) => s);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
    }
}