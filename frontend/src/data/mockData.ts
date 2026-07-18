// CropCare — Mock data for UI development
// Replace with real API calls once backend is wired up.

export const MOCK_USER = {
  name: 'Demo Farmer',
  phone_number: '+919876543210',
  is_new_user: false,
};

export const MOCK_DIAGNOSIS = {
  diagnosis_id: 'mock-001',
  disease: {
    code: 'cotton_leaf_curl',
    name: 'Cotton Leaf Curl Virus',
    confidence_label: 'high' as const,
  },
  explanation:
    'Cotton Leaf Curl Virus (CLCuV) is a serious disease caused by a whitefly-transmitted begomovirus. Affected leaves show upward curling, thickening of veins, and dark green discoloration.',
  treatment: {
    organic: [
      'Remove and destroy infected plants',
      'Use yellow sticky traps to control whitefly population',
      'Apply neem oil spray (5ml/litre) every 7 days',
    ],
    chemical: [
      'Apply Imidacloprid 17.8 SL @ 0.3ml/litre',
      'Spray Acetamiprid 20 SP @ 0.2g/litre',
      'Thiamethoxam 25 WG @ 0.3g/litre as systemic insecticide',
    ],
  },
  status: 'auto_confirmed' as const,
};

export const MOCK_RECOMMENDATIONS = [
  {
    product_id: 'p1',
    name: 'Confidor (Imidacloprid)',
    dealer: {
      id: 'd1',
      shop_name: 'Patil Agro Stores',
      phone_number: '+919823456789',
      whatsapp_number: '+919823456789',
    },
    distance_km: 1.2,
    stock_status: 'in_stock' as const,
    rank: 1,
  },
  {
    product_id: 'p2',
    name: 'Pride (Acetamiprid)',
    dealer: {
      id: 'd2',
      shop_name: 'Sharma Krishi Kendra',
      phone_number: '+919712345678',
      whatsapp_number: null,
    },
    distance_km: 3.5,
    stock_status: 'low' as const,
    rank: 2,
  },
  {
    product_id: 'p3',
    name: 'Actara (Thiamethoxam)',
    dealer: {
      id: 'd3',
      shop_name: 'Green Field Agro',
      phone_number: '+919645678901',
      whatsapp_number: '+919645678901',
    },
    distance_km: 6.8,
    stock_status: 'in_stock' as const,
    rank: 3,
  },
];

export const MOCK_HISTORY = [
  {
    id: 'h1',
    disease_name: 'Cotton Leaf Curl Virus',
    crop: 'Cotton',
    date: '2024-01-15',
    confidence_label: 'high' as const,
    thumbnail: null,
  },
  {
    id: 'h2',
    disease_name: 'Tomato Early Blight',
    crop: 'Tomato',
    date: '2024-01-10',
    confidence_label: 'medium' as const,
    thumbnail: null,
  },
  {
    id: 'h3',
    disease_name: 'Wheat Rust',
    crop: 'Wheat',
    date: '2024-01-05',
    confidence_label: 'low' as const,
    thumbnail: null,
  },
];

export const MOCK_DEALER_PRODUCTS = [
  { id: 'p1', name: 'Confidor (Imidacloprid)', category: 'Insecticide', disease_tags: ['Cotton Leaf Curl Virus'], stock_status: 'in_stock' as const },
  { id: 'p2', name: 'Ridomil Gold (Mancozeb)', category: 'Fungicide', disease_tags: ['Tomato Early Blight', 'Wheat Rust'], stock_status: 'in_stock' as const },
  { id: 'p3', name: 'Actara (Thiamethoxam)', category: 'Insecticide', disease_tags: ['Cotton Leaf Curl Virus'], stock_status: 'low' as const },
];

export const MOCK_DEALER_LEADS = [
  { id: 'l1', disease_name: 'Cotton Leaf Curl Virus', date: '2024-01-15', area: 'Nagpur District', product_recommended: 'Confidor (Imidacloprid)', contacted: true },
  { id: 'l2', disease_name: 'Tomato Early Blight', date: '2024-01-12', area: 'Pune District', product_recommended: 'Ridomil Gold', contacted: false },
  { id: 'l3', disease_name: 'Cotton Leaf Curl Virus', date: '2024-01-08', area: 'Amravati District', product_recommended: 'Actara', contacted: false },
];

export const MOCK_ADMIN_DEALERS = [
  { id: 'd1', shop_name: 'Patil Agro Stores', owner_name: 'Ramesh Patil', phone: '+919823456789', location: 'Nagpur', status: 'approved' as const, created_at: '2024-01-01' },
  { id: 'd2', shop_name: 'Sharma Krishi Kendra', owner_name: 'Vijay Sharma', phone: '+919712345678', location: 'Pune', status: 'pending' as const, created_at: '2024-01-10' },
  { id: 'd3', shop_name: 'Green Field Agro', owner_name: 'Suresh Patel', phone: '+919645678901', location: 'Amravati', status: 'pending' as const, created_at: '2024-01-12' },
  { id: 'd4', shop_name: 'Kisan Agro Center', owner_name: 'Mohan Singh', phone: '+919534567890', location: 'Nashik', status: 'suspended' as const, created_at: '2023-12-20' },
];

export const MOCK_ADMIN_DISEASES = [
  { id: 'dis1', name: 'Cotton Leaf Curl Virus', crops: ['Cotton'], severity: 'High', created_at: '2024-01-01' },
  { id: 'dis2', name: 'Tomato Early Blight', crops: ['Tomato'], severity: 'Medium', created_at: '2024-01-02' },
  { id: 'dis3', name: 'Wheat Rust', crops: ['Wheat'], severity: 'High', created_at: '2024-01-03' },
  { id: 'dis4', name: 'Rice Blast', crops: ['Rice'], severity: 'High', created_at: '2024-01-04' },
];
