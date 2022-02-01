// module
import express from 'express';
// types
import { UserType } from '../../domain/types/user';
// functions
import { getUser } from '../../domain/functions/getUser';

// user
const user: UserType = getUser();

// express
const app: express.Express = express();
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  },
);

// top
app.get('/', (req: express.Request, res: express.Response) => {
  res.send(user);
});

// const
const PORT = 4000;
// start
app.listen(PORT, () => {
  console.log(`port: ${PORT}.`);
});
