import 'dotenv/config';
import Koa, { Next } from 'koa';
import { koaBody } from 'koa-body';
import * as Sentry from '@sentry/node';
import {
    extractTraceparentData,
    Span,
    stripUrlQueryAndFragment
} from '@sentry/tracing';

import domain from 'domain';
import cors from '@koa/cors';
// routing
import { glb2usdz } from './src/routes/glb2usdzRouter';
import { usdz2glb } from './src/routes/usdz2glbRouter';
import { productsRouter } from './src/routes/productsRouter';
import { sampleRouter } from './src/routes/sampleRouter';

const app = new Koa({
    proxy : true,
});

Sentry.init({ dsn : `${process.env.SENTRY_KEY}` });

app.use(cors({
    'origin' : '*',
}));

app.use(koaBody({
    multipart : true,
    formLimit : 300 * 1024 * 1024,
}));

app.use(usdz2glb.routes()).use(usdz2glb.allowedMethods());
app.use(glb2usdz.routes()).use(glb2usdz.allowedMethods());
app.use(productsRouter.routes()).use(productsRouter.allowedMethods());
app.use(sampleRouter.routes()).use(sampleRouter.allowedMethods());

app.on('error', (err, ctx) => {
    console.log('errorlog : ', err);
    Sentry.withScope(function (scope) {
        scope.addEventProcessor(function (event) {
            return Sentry.addRequestDataToEvent(event, ctx.request);
        });
        Sentry.captureException(err);
    });
});

app.listen(3000, () => console.log('Server is running on port 3000'));