import { getCookie } from './cookie';

const getWsBase = () =>
  (process.env.BURGER_API_URL || '')
    .replace(/^http/, 'ws')
    .replace(/\/api\/?$/, '');

export const getAllOrdersSocketUrl = () => `${getWsBase()}/orders/all`;

export const getUserOrdersSocketUrl = () => {
  const token = (getCookie('accessToken') || '').replace('Bearer ', '');
  return `${getWsBase()}/orders?token=${token}`;
};
