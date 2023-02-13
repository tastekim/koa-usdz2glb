import { storage } from '../repositories/cloudstorage';
import { setData, setSampleData } from './firestore-func';

const saveDataBucketName: any = process.env.BUCKET_NAME;

export async function uploadFile(newFileName: string, filePath: string) {
    try {
        const options = {
            destination : newFileName,
        };

        await storage.bucket(saveDataBucketName).upload(filePath, options).catch((err: unknown) => {
            console.error(err);
            return err;
        });
        return 204;
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return err;
        }
    }

}

// bucket 객체 삭제
export async function deleteObject(fileName: string) {
    try {
        await storage.bucket(saveDataBucketName).file(`${fileName}/${fileName}.glb`).delete();
        await storage.bucket(saveDataBucketName).file(`${fileName}/${fileName}.usdz`).delete();
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return err;
        }
    }
}


// Cloud Storage 에 있는 파일에 접근하는 경로 가져오기
export async function getFileUrl(fileName: string) {
    try {
        const bucket = storage.bucket(saveDataBucketName);
        const file = bucket.file(fileName);
        const metadata = await file.getMetadata();
        // 파일 용량 MB로 계산 후 소수점 두자리로 반올림
        const size = `${Math.round((Number(metadata[0].size) / 1024 / 1024) * 100) / 100} Mb`;
        const [url] = await file.getSignedUrl({
            action : 'read',
            expires : Date.now() + Date.now(),
        });
        return [url, size];
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return err;
        }
    }
}

// productName 으로 glb, usdz 파일 경로 가져오기
export async function getProductFile(productName: string) {
    try {
        const bucket = storage.bucket(saveDataBucketName);
        const [[glb, usdz]] = await bucket.getFiles({
            prefix : `${productName}/`,
        });
        return [glb.metadata.name, usdz.metadata.name];
    } catch (err) {
        if (err instanceof Error) {
            console.error(err);
            return err;
        }
    }
}

export async function createDoc(fileName: string) {
    try {
        const [glbFile, usdzFile]: any = await getProductFile(fileName);
        const [glbUrl, glbSize]: any = await getFileUrl(glbFile);
        const [usdzUrl, usdzSize]: any = await getFileUrl(usdzFile);
        return await setData(fileName, glbUrl, glbSize, usdzUrl, usdzSize);
    } catch (err) {
        if (err instanceof Error) {
            return err;
        }
    }
}

// 샘플 데이터 업로드
export async function createSampleDoc(fileName: string) {
    try {
        const [glbFile, usdzFile]: any = await getProductFile(fileName);
        const [glbUrl, glbSize]: any = await getFileUrl(glbFile);
        const [usdzUrl, usdzSize]: any = await getFileUrl(usdzFile);
        return await setSampleData(fileName, glbUrl, glbSize, usdzUrl, usdzSize);
    } catch (err) {
        if (err instanceof Error) {
            return err;
        }
    }
}