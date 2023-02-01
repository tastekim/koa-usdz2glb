import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import { spawn } from 'child_process';

const router = new Router();

const usdz2glb = router.post('/usdz2glb', async (ctx: any, next: Next) => {
    try {
        const filePath = ctx.request.files.file.filepath; // 업로드하는 파일의 경로
        const usdzFileName = ctx.request.files.file.originalFilename; // 업로드하는 usdz 파일 이름

        // 확장자가 포함된 파일 이름 문자열에서 확장자 바꾸기 .glb => .usdz
        const convertName = usdzFileName.split('.');
        convertName[1] = 'usdz';
        const glbFileName = convertName.join('.');
        const usdz2glbConvertProcess = spawn('python', ['usdz2glb.py', filePath, glbFileName]);
        usdz2glbConvertProcess.stdout.on('data', (data: Buffer) => {
            console.log(data.toString());
            ctx.status = 200;
            ctx.response.body ={message: 'Success'}
        })
        usdz2glbConvertProcess.stderr.on('data', (data: Buffer) => {
            console.log(data.toString());
            ctx.status = 500;
            ctx.response.body ={message: 'usdz2glb.py failed'}
        })
        await next();
    } catch (err) {
        if (err instanceof Error) {
            ctx.response.status = 500;
            ctx.response.body = {
                message : err.message
            };
            console.error(err.message);
            console.error(err.stack);
        }
    }
});

export { usdz2glb };