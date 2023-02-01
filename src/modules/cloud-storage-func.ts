import { storage } from '../repositories/cloudstorage';
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

// Cloud Storage 에 있는 파일에 접근하는 경로 가져오기
export async function getFileUrl(fileName: string) {
    const bucket = storage.bucket(saveDataBucketName);
    const file = bucket.file(fileName);
    return await file.getSignedUrl({
        action : 'read',
        expires : Date.now() + Date.now(),
    });
}

// productName 으로 glb, usdz 파일 경로 가져오기
export async function getProductFile(productName: string) {
    const bucket = storage.bucket(saveDataBucketName);
    const [[glb, usdz]]: any = await bucket.getFiles({
        prefix : `${productName}/`,
    });
    return [glb.metadata.name, usdz.metadata.name];
}