import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import { getSampleData } from '../modules/firestore-func';

const router = new Router({
    prefix : '/sample',
});

const sampleRouter = router
    .get('/', async (ctx: any, next: Next) => {
        try {
            const dataList = await getSampleData();
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
    });


export { sampleRouter };