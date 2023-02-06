import 'dotenv/config';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import cors from '@koa/cors';
// routing
import { glb2usdz } from './src/routes/glb2usdzRouter';
import { usdz2glb } from './src/routes/usdz2glbRouter';
import { productsRouter } from './src/routes/productsRouter';

const app = new Koa({
    proxy : true,
});

app.use(cors({
    'origin' : '*',
}));

app.use(koaBody({
    multipart : true,
}));

app.use(usdz2glb.routes()).use(usdz2glb.allowedMethods());
app.use(glb2usdz.routes()).use(glb2usdz.allowedMethods());
app.use(productsRouter.routes()).use(productsRouter.allowedMethods());

app.on('error', (err: Error) => {
    console.error(err);
    console.error(err.stack);
});

app.listen(3000, () => console.log('Server is running on port 3000'));