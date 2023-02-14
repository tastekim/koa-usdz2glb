import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import {
    getSampleData,
    getAllSampleData,
    deleteData, deleteSampleData
} from '../modules/firestore-func';
import { exec, spawn } from 'child_process';
import { createSampleDoc, uploadFile } from '../modules/cloud-storage-func';

const router = new Router({
    prefix : '/sample',
});

const sampleRouter = router
    .get('/', async (ctx: any, next: Next) => {
        try {
            const dataList = await getAllSampleData();
            ctx.status = 200;
            ctx.response.body = { dataList };
            console.log(`request /products getSampleData Success.`);
            await next();
        } catch (err) {
            if (err instanceof Error) {
                ctx.status ??= 500;
                ctx.response.body = {
                    message : err.message
                };
                console.error(err.stack);
            }
        }
    })
    .get('/:productId', async (ctx: any, next: Next) => {
        try {
            const { productId } = ctx.params;
            const productData = await getSampleData(productId);
            if (productData instanceof Error) {
                ctx.status = 400;
                ctx.throw(productData.message);
            } else {
                ctx.response.body = productData;
                console.log(`${productId} found.`);
            }
            await next();
        } catch
            (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message);
                console.log(err.stack);
                ctx.status ??= 500;
                ctx.response.body = {
                    message : err.message
                };
            }
        }
    })
    .post('/', async (ctx: any, next: Next) => {
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
                    console.log('test : ', data.toString());
                    ctx.status = 200;
                    ctx.response.body = { message : 'Ok.' };
                    console.log(`${usdzFileName} converted.`);
                    const glbFilePath = `${process.env.SAVEPATH}${glbFileName}`;
                    await uploadFile(`${convertName[0]}/${glbFileName}`, glbFilePath);
                    await uploadFile(`${convertName[0]}/${usdzFileName}`, usdzFilePath);
                    const result = await createSampleDoc(convertName[0]);
                    if (result instanceof Error) {
                        console.error(result.message);
                        console.error(result.stack);
                    } else {
                        console.log(`[Firestore] : ${convertName[0]} sample created.`);
                    }
                    exec('sh clearTmp.sh');
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
    })
    .delete('/:productId', async (ctx: any, next: Next) => {
        try {
            const { productId } = ctx.params;
            const result = await deleteSampleData(productId);
            if (result instanceof Error) {
                ctx.status = 400;
                ctx.throw(result.message);
            }
            ctx.status = 204;
            ctx.response.body = {
                success : true
            };
            console.log(`sample ${productId} => delete success`);
            await next();
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
                console.log(err.stack);
                ctx.status ??= 500;
                ctx.response.body = {
                    message : err.message
                };
            }
        }
    });


export { sampleRouter };