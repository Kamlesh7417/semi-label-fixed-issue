import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, MOCK_ORDERS } from '../../utils/mockData';
import { addShippingLabel } from './documentSlice';
import { AppDispatch } from '../store';

interface OrderState {
  orders: Record<string, Order>;
  loading: boolean;
  error: string | null;
  selectedOrderId: string | null;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  filters: {
    search: string;
    status: string | null;
  };
}

const initialState: OrderState = {
  orders: MOCK_ORDERS,
  loading: false,
  error: null,
  selectedOrderId: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 10
  },
  filters: {
    search: '',
    status: null
  }
};

// Thunk to update order status and generate label
export const updateOrderStatusAndGenerateLabel = (orderId: string, status: string) => {
  return async (dispatch: AppDispatch) => {
    // Update order status
    dispatch(updateOrderStatus({ orderId, status }));

    // If status is SHIPPED, generate shipping label document
    if (status === 'SHIPPED') {
      const shipment = MOCK_SHIPMENTS[`SHP-${orderId}`];
      dispatch(addShippingLabel({
        id: `DOC-${orderId}-LABEL`,
        orderId: orderId,
        name: 'Shipping Label',
        type: 'Label',
        date: new Date().toISOString(),
        size: '125 KB',
        status: 'Final',
        url: `https://aws-exportedge-dev-order-processing-bucket.s3.us-east-1.amazonaws.com/orders_docs/${orderId}/${orderId}_label.pdf`,
        carrier: shipment.carrier,
        trackingNumber: shipment.tracking_number
      }));
    }
  };
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Record<string, Order>>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
      const { orderId, status } = action.payload;
      if (state.orders[orderId]) {
        state.orders[orderId].order_status = status as Order['order_status'];
      }
    },
    setFilters: (state, action: PayloadAction<Partial<OrderState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    }
  }
});

export const { setOrders, updateOrderStatus, setFilters, setPage, clearFilters } = orderSlice.actions;
export default orderSlice.reducer;