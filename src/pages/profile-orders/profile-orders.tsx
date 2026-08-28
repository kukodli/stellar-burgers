import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  getUserOrders,
  selectIsLoading,
  selectUserOrders,
  updateUserOrders
} from '../../services/slices/orderSlice';
import { Preloader } from '@ui';
import { getUserOrdersSocketUrl } from '../../utils/burger-socket';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(getUserOrders());

    const socket = new WebSocket(getUserOrdersSocketUrl());
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.success && Array.isArray(data.orders)) {
        dispatch(updateUserOrders(data.orders));
      }
    };

    return () => {
      socket.close();
    };
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
