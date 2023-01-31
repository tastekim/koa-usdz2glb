import { Context, Next } from 'koa';
import koaBody from 'koa-body';
import Router from '@koa/router';

const router = new Router();

const usdz2glb = router.get('/usdz2glb', (ctx: Context, next: Next) => {
    try {
        ctx.response.status = 200;
        ctx.response.body = {
            message : 'OK',
        };
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