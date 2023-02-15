import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import {
    getSampleData,
    getAllSampleData,
    deleteSampleData
} from '../modules/sample-firestore-module';
import { createSampleDoc } from '../modules/sample-cloud-storage-module';
import { getFileUrl, uploadFile } from '../modules/cloud-storage-module';
import { exec, spawn } from 'child_process';

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
                console.log(`Sample ${productId} found.`);
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
    .post('/usdz', async (ctx: any, next: Next) => {
        try {
            const usdzFilePath = ctx.request.files.file.filepath;
            const usdzFileName = ctx.request.files.file.originalFilename;
            console.log('received sample file: ' + usdzFileName);

            if (usdzFileName.split('.')[1] !== 'usdz') {
                ctx.status = 400;
                ctx.throw('Not usdz file.');
            }

            const convertName = usdzFileName.split('.');
            convertName[1] = 'glb';
            const glbFileName = convertName.join('.');

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
                        console.log(`[Firestore] : Sample ${convertName[0]} sample created.`);
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
    .post('/glb', async (ctx: any, next: Next) => {
        try {
            const glbFilePath = ctx.request.files.file.filepath;
            const glbFileName = ctx.request.files.file.originalFilename;
            const convertName = glbFileName.split('.');
            convertName[1] = 'usdz';
            const usdzFileName = convertName.join('.');
            const gcsGlbFilePath = `${convertName[0]}/${glbFileName}`;
            const gcsUsdzFilePath = `${convertName[0]}/${usdzFileName}`;

            const result: unknown = await uploadFile(gcsGlbFilePath, glbFilePath);
            if (result instanceof Error) {
                ctx.status = 400;
                console.log(result.stack);
                ctx.throw(result.message);
            }
            console.log(`[Cloud Storage] : Sample ${glbFileName} uploaded successfully`);

            const [uploadFileUrl, size]: any = await getFileUrl(gcsGlbFilePath);
            const execCommand = `sh ./glb2usdz.sh ${usdzFileName} ${glbFileName} ${uploadFileUrl}`;

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
                ctx.response.body = { message : 'glb sample file upload' };
                console.log(`${glbFileName} converted.`);
                const usdzFilePath = `${process.env.SAVEPATH_LOCAL}${usdzFileName}`;
                await uploadFile(gcsGlbFilePath, glbFilePath);
                await uploadFile(gcsUsdzFilePath, usdzFilePath);
                const result = await createSampleDoc(convertName[0]);
                if (result instanceof Error) {
                    console.error(result.message);
                    console.error(result.stack);
                } else {
                    console.log(`[Firestore] : Sample ${convertName[0]} created.`);
                }
            }).catch((err) => {
                console.log(err);
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