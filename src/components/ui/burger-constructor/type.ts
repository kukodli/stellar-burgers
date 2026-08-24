import { TOrder } from '@utils-types';

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrder | null;
  orderError?: string | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
};
