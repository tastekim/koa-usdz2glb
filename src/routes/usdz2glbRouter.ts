import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import { spawn, exec } from 'child_process';
import { uploadFile } from '../modules/cloud-storage-func';

const router = new Router();

const usdz2glb = router.post('/usdz2glb', async (ctx: any, next: Next) => {
    try {
        const usdzFilePath = ctx.request.files.file.filepath; // 업로드하는 파일의 경로
        const usdzFileName = ctx.request.files.file.originalFilename; // 업로드하는 usdz 파일 이름
        console.log('received file: ' + usdzFileName);

        // formdata validation.
        if (usdzFileName.split('.')[1] !== 'usdz') {
            ctx.status = 400;
            ctx.throw('Not usdz file.');
        }

        // 확장자가 포함된 파일 이름 문자열에서 확장자 바꾸기 .usdz => .glb
        const convertName = usdzFileName.split('.');
        convertName[1] = 'glb';
        const glbFileName = convertName.join('.');

        // child_process 가 끝난 후에 ctx.response 할 수 있게 Promise 로 실행.
        await new Promise((resolve, reject) => {
            // usdz to glb Convert
            const usdz2glbConvertProcess = spawn('python3', ['usdz2glb.py', usdzFilePath, glbFileName]);
            usdz2glbConvertProcess.stdout.on('data', (data: Buffer) => resolve(data));
            usdz2glbConvertProcess.stderr.on('data', (data: Buffer) => reject(data));
        }).then(async (data) => {
            if (data instanceof Buffer) {
                console.log(data.toString());
                ctx.status = 200;
                ctx.response.body = { message : 'Ok.' };
                const glbFilePath = `${process.env.SAVEPATH}${glbFileName}`;
                await uploadFile(`${convertName[0]}/${glbFileName}`, glbFilePath);
                await uploadFile(`${convertName[0]}/${usdzFileName}`, usdzFilePath);
                // exec('sh clearTmp.sh');
            }
        }).catch((stderr) => {
            console.log(stderr.toString());
            ctx.status = 500;
            ctx.response.body = { message : 'failed.' };
        });
        await next();
    } catch (err) {
        if (err instanceof Error) {
            ctx.response.status ??= 500;
            ctx.response.body = {
                message : err.message
            };
            console.error(err.message);
            console.error(err.stack);
        }
    }
});

export { usdz2glb };