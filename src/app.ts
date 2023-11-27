// src/app.ts
import express, { Request, Response } from 'express';
import ApiClient from './api-client';
import { EventManager } from './event-manager';
import { RedisClient } from './redis-client';


const timeout = parseInt(process.env.TIMEOUT || "5000", 10);
const domain = process.env.DOMAIN || "";
const apikey = process.env.APIKEY || "";

const publisher = new RedisClient()
const subscriber = new RedisClient()
const eventManager = new EventManager(timeout, publisher, subscriber);
const client = new ApiClient(domain, apikey, timeout);

const app = express();
app.use(express.json());

app.post('/webhook', async (req: Request, res: Response) => {
  // emit message using req.body.external_id
  console.log('ASYNC RESPONSE -- ', req.body)
  await eventManager.trigger(req.body)
  return res.json({ message: 'Webhook received' });
});

// ask for a new QRCODE sync
app.post('/new-qrcode', async (req: Request, res: Response) => {
  const data = req.body;
  const eventId = data.external_id;

  // we add the reference before send 
  // to make sure that we will not loose
  // the notification
  console.log("event id", eventId)
  eventManager.watch(
    eventId,
    (data: any) => {
      res.json({
        message: "qrcode sucessfuly retrive",
        qr_code: data.br_code,
        cashin_id: data.cashin_id,
        external_id: data.external_id
      });
    }, () => {
      res.json({
        message: "please, try again",
        error: "timeout"
      });
    },
    (error) => {
      res.json({
        message: "Something is wrong",
        error,
      });
    });

  const syncResponse = await client.askNewItem({
    ...data,
    external_id: eventId,
  }).catch(
    err => {
      eventManager.throwError(eventId, err)
    }
  );

  console.log("cashin-id: ", syncResponse)
});

export default app;

