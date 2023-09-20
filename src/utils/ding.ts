import Ding from '@ding-live/sdk';

const dingClient = new Ding(process.env.CUSTOMER_UUID || '', process.env.SECRET_TOKEN || '');
export default dingClient;
