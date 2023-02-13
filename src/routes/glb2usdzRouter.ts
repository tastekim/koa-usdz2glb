import { Context, Next } from 'koa';
import {
    createDoc,
    getFileUrl,
    uploadFile
} from '../modules/cloud-storage-func';
import koaBody from 'koa-body';
import { exec } from 'child_process';
import Router from '@koa/router';

const router = new Router({
        prefix : '/glb2usdz',
    }
);

const glb2usdz = router.post('/', async (ctx: any, next: Next) => {
    try {
        const glbFilePath = ctx.request.files.file.filepath; // 업로드하는 파일의 경로
        const glbFileName = ctx.request.files.file.originalFilename; // 업로드하는 glb 파일 이름

        // 확장자가 포함된 파일 이름 문자열에서 확장자 바꾸기 .glb => .usdz
        const convertName = glbFileName.split('.');
        convertName[1] = 'usdz';
        const usdzFileName = convertName.join('.');
        const gcsGlbFilePath = `${convertName[0]}/${glbFileName}`;
        const gcsUsdzFilePath = `${convertName[0]}/${usdzFileName}`;

        // form-data 로 받은 데이터 GCS 에 업로드
        const result: unknown = await uploadFile(gcsGlbFilePath, glbFilePath);
        if (result instanceof Error) {
            ctx.status = 400;
            console.log(result.stack);
            ctx.throw(result.message);
        }
        console.log(`[Cloud Storage] : ${glbFileName} uploaded successfully`);

        // 업로드된 파일의 다운로드 url을 return
        const [uploadFileUrl, size]: any = await getFileUrl(gcsGlbFilePath);

        // temp 폴더에 uploadFileUrl 로 glb 파일을 받은 후 그 파일로 usdz 파일 변환해서 temp 폴더에 저장 => 파라미터만 넘기면 되는데 넘겼다.... 파라미터 나누는 공백이 빠져 있었나보다.
        const execCommand = `sh ./glb2usdz.sh ${usdzFileName} ${glbFileName} ${uploadFileUrl}`;

        // 자식 프로세스가 종료되면 콜백이 실행되는데 로그가 찍히는 순서를 보면 이 친구 콜백에 있는 로그가 가장 마지막에 찍힘.
        await new Promise((resolve, reject) => {
            exec(execCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(stdout);
                    console.log(stderr);
                }
            })
                .on('close', resolve)
                .on('error', reject);
        }).then(async (data) => {
            console.log('test : ', data);
            ctx.status = 200;
            ctx.response.body = { message : 'glb file upload' };
            console.log(`${glbFileName} converted.`);
            const usdzFilePath = `${process.env.SAVEPATH}${usdzFileName}`;
            await uploadFile(gcsGlbFilePath, glbFilePath);
            await uploadFile(gcsUsdzFilePath, usdzFilePath);
            const result = await createDoc(convertName[0]);
            if (result instanceof Error) {
                console.error(result.message);
                console.error(result.stack);
            } else {
                console.log(`[Firestore] : ${convertName[0]} created.`);
            }
        });

        await next();
    } catch (err: unknown) {
        if (err instanceof Error) {
            ctx.status ??= 500;
            ctx.response.body = {
                message : err.message
            };
            console.error(err.stack);
        }
    }
})
    .post('/glbUpload', async (ctx: any, next: Next) => {
        try {
            console.log('[Server] : .glb => .usdz convert success.');
            const filePath = ctx.request.files.file.filepath;
            const usdzFileName = ctx.request.files.file.originalFilename;
            const { nonSpaceName } = ctx.request.body;
            const usdzUploadFileName = `${nonSpaceName}/${usdzFileName}`;

            // form-data 로 받은 데이터 GCS 에 업로드
            const result: unknown = await uploadFile(usdzUploadFileName, filePath).catch(console.error);
            if (result instanceof Error) {
                ctx.status = 500;
                console.log(result.stack);
                ctx.throw(result.message);
            }
            console.log(`[Cloud Storage] : ${usdzFileName} uploaded successfully`);
            ctx.response.status = 204;
            await next();
        } catch (err: unknown) {
            if (err instanceof Error) {
                ctx.response.body = {
                    message : err.message
                };
                console.error(err.stack);
            }
        }
    });

export { glb2usdz };
