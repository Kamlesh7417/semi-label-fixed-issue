import { v4 as uuidv4 } from 'uuid';

// Types
export interface Product {
  name: string;
  dimensions: string;
  weight: string;
  quantity: number;
}

export interface Order {
  order_id: string;
  order_placed_timestamp: string;
  order_status: 'OPEN' | 'SHIPPED' | 'DELIVERED';
  product: Product;
  customer_address: string;
  warehouse_address: string;
  seller_address: string;
}

export interface Document {
  id: string;
  orderId: string;
  name: string;
  type: 'Invoice' | 'Packing List' | 'Certificate of Origin' | 'Label';
  date: string;
  size: string;
  status: 'Draft' | 'Final' | 'Approved' | 'Rejected';
  url: string;
  carrier?: string;
  trackingNumber?: string;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  orderId: string;
  origin: string;
  destination: string;
  status: 'Order Received' | 'Order Picked' | 'Order in Transit' | 'Out For Delivery' | 'Reached Destination';
  carrier: string;
  type: string;
  eta: string;
  lastUpdate: string;
  progress: number;
  tracking: Array<{
    id: string;
    timestamp: string;
    location: string;
    status: string;
    description: string;
    type: 'Order Received' | 'Order Picked' | 'Order in Transit' | 'Out For Delivery' | 'Reached Destination';
  }>;
}

const destinations = [
  'John Smith, 123 Main Street, New York, NY 10001, USA',
  'Emily Roberts, 45 Victoria Street, Manchester, M2 3NH, United Kingdom',
  'James Cook, 78 Digital Avenue, Sydney, NSW 2000, Australia'
];

const warehouseAddress = 'GADA RETAIL PRIVATE LIMITED, Suburb Residency Private Limited Plot No 01, Omshree Industrial Park PO, PS -, MUMBAI, 400001, INDIA';

// Mock Orders
export const MOCK_ORDERS: Record<string, Order> = {
  'ORD334256': {
    order_id: 'ORD334256',
    order_placed_timestamp: new Date().toISOString(),
    order_status: 'OPEN',
    product: {
      name: 'iPhone 15 Pro Max',
      dimensions: '15.9 x 7.67 x 0.83 cm',
      weight: '221g',
      quantity: 2
    },
    customer_address: destinations[0],
    warehouse_address: warehouseAddress,
    seller_address: warehouseAddress
  }
};

// Generate past orders
for (let i = 1; i <= 29; i++) {
  const orderNumber = 334257 + i;
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);

  MOCK_ORDERS[`ORD${orderNumber}`] = {
    order_id: `ORD${orderNumber}`,
    order_placed_timestamp: timestamp.toISOString(),
    order_status: 'DELIVERED',
    product: {
      name: 'iPhone 15 Pro Max',
      dimensions: '15.9 x 7.67 x 0.83 cm',
      weight: '221g',
      quantity: Math.floor(Math.random() * 3) + 1
    },
    customer_address: destinations[Math.floor(Math.random() * destinations.length)],
    warehouse_address: warehouseAddress,
    seller_address: warehouseAddress
  };
}

// Mock Shipments
export const MOCK_SHIPMENTS: Record<string, Shipment> = {};

Object.keys(MOCK_ORDERS).forEach((orderId) => {
  const shipmentId = `SHP-${orderId}`;
  const order = MOCK_ORDERS[orderId];
  const carrier = ['DHL Express', 'FedEx', 'UPS'][Math.floor(Math.random() * 3)];
  const trackingNumber = `TRK${Math.floor(100000 + Math.random() * 900000)}`;
  
  MOCK_SHIPMENTS[shipmentId] = {
    id: shipmentId,
    tracking_number: trackingNumber,
    orderId: orderId,
    origin: 'Mumbai, India',
    destination: order.customer_address.split(',').slice(-2, -1)[0].trim(),
    status: orderId === 'ORD334256' ? 'Order Received' : 
           order.order_status === 'DELIVERED' ? 'Reached Destination' : 
           'Order in Transit',
    carrier: carrier,
    type: 'Express Air Freight',
    eta: new Date(order.order_placed_timestamp).toISOString(),
    lastUpdate: orderId === 'ORD334256' ? 'Order received and processing' :
               order.order_status === 'DELIVERED' ? 'Package delivered' : 
               'Package in transit',
    progress: orderId === 'ORD334256' ? 20 :
             order.order_status === 'DELIVERED' ? 100 : 
             60,
    tracking: [
      {
        id: uuidv4(),
        timestamp: order.order_placed_timestamp,
        location: 'Mumbai, India',
        status: 'Order Received',
        description: 'Order has been received',
        type: 'Order Received'
      },
      {
        id: uuidv4(),
        timestamp: order.order_placed_timestamp,
        location: 'Mumbai, India',
        status: orderId === 'ORD334256' ? 'Order Received' :
               order.order_status === 'DELIVERED' ? 'Reached Destination' : 
               'Order in Transit',
        description: orderId === 'ORD334256' ? 'Order received and processing' :
                    order.order_status === 'DELIVERED' ? 'Package delivered' : 
                    'Package in transit',
        type: orderId === 'ORD334256' ? 'Order Received' :
              order.order_status === 'DELIVERED' ? 'Reached Destination' : 
              'Order in Transit'
      }
    ]
  };
});

// Mock Documents
export const MOCK_DOCUMENTS: Record<string, Document> = {};

Object.keys(MOCK_ORDERS).forEach((orderId) => {
  // Add standard documents
  const docTypes = ['Invoice', 'Packing List', 'Certificate of Origin'];
  docTypes.forEach((type) => {
    const docId = `DOC-${orderId}-${type.toUpperCase()}`;
    MOCK_DOCUMENTS[docId] = {
      id: docId,
      orderId: orderId,
      name: type,
      type: type as Document['type'],
      date: MOCK_ORDERS[orderId].order_placed_timestamp,
      size: '245 KB',
      status: 'Final',
      url: orderId === 'ORD334256' ? 
        'https://aws-exportedge-dev-order-processing-bucket.s3.us-east-1.amazonaws.com/orders_docs/ORD334256/ORD334256_invoice.pdf' :
        `https://aws-exportedge-dev-order-processing-bucket.s3.us-east-1.amazonaws.com/orders_docs/${orderId}/${orderId}_${type.toLowerCase()}.pdf`
    };
  });

  // Add shipping label for all orders except the open one
  if (MOCK_ORDERS[orderId].order_status === 'DELIVERED') {
    const shipment = MOCK_SHIPMENTS[`SHP-${orderId}`];
    const labelId = `DOC-${orderId}-LABEL`;
    MOCK_DOCUMENTS[labelId] = {
      id: labelId,
      orderId: orderId,
      name: 'Shipping Label',
      type: 'Label',
      date: MOCK_ORDERS[orderId].order_placed_timestamp,
      size: '125 KB',
      status: 'Final',
      url: `https://aws-exportedge-dev-order-processing-bucket.s3.us-east-1.amazonaws.com/orders_docs/${orderId}/${orderId}_label.pdf`,
      carrier: shipment.carrier,
      trackingNumber: shipment.tracking_number
    };
  }
});