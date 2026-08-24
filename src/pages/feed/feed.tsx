import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  getFeeds,
  selectFeedLoading,
  selectOrders,
  updateFeed
} from '../../services/slices/feedSlice';
import { getAllOrdersSocketUrl } from '../../utils/burger-socket';

export const Feed: FC = () => {
  const orders = useSelector(selectOrders);
  const isLoading = useSelector(selectFeedLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFeeds());

    const socket = new WebSocket(getAllOrdersSocketUrl());
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.success) {
        dispatch(
          updateFeed({
            orders: data.orders,
            total: data.total,
            totalToday: data.totalToday
          })
        );
      }
    };

    return () => {
      socket.close();
    };
  }, [dispatch]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  return (
    <FeedUI
      orders={orders}
      handleGetFeeds={() => {
        dispatch(getFeeds());
      }}
    />
  );
};
