import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import { getAllData } from '../modules/firestore-func';

const router = new Router({
    prefix : '/products',
});

const productsRouter = router.get('/', async (ctx: any, next: Next) => {
    try {
        const dataList = await getAllData();
        ctx.status = 200;
        ctx.response.body = { dataList };
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

export { productsRouter };