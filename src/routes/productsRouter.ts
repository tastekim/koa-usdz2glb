import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';
import { getAllData, getData, deleteData } from '../modules/firestore-func';

const router = new Router({
    prefix : '/products',
});

const productsRouter = router
    .get('/', async (ctx: any, next: Next) => {
        try {
            const dataList = await getAllData();
            ctx.status = 200;
            ctx.response.body = { dataList };
            console.log(`request /products getAllData Success.`);
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
            const productData = await getData(productId);
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
    .delete('/:productId', async (ctx: any, next: Next) => {
        try {
            const { productId } = ctx.params;
            const result = await deleteData(productId);
            if (result instanceof Error) {
                ctx.status = 400;
                ctx.throw(result.message);
            }
            ctx.status = 204;
            ctx.response.body = {
                success : true
            };
            console.log(`${productId} => delete success`);
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

export { productsRouter };