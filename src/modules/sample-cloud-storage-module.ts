import { setSampleData } from './sample-firestore-module';
import { getFileUrl, getProductFile } from './cloud-storage-module';

const saveDataBucketName: any = process.env.BUCKET_NAME;

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