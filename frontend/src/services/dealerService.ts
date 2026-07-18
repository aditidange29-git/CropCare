import { api } from './api';

export async function getDealerProducts(page = 1) {
  return api.get(`/dealer/products?page=${page}`);
}

export async function createProduct(data: {
  name: string;
  category: string;
  applicable_disease_codes: string[];
  stock_status: string;
}) {
  return api.post('/dealer/products', data);
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    applicable_disease_codes: string[];
    stock_status: string;
  }>
) {
  return api.patch(`/dealer/products/${id}`, data);
}

export async function getDealerLeads(page = 1) {
  return api.get(`/dealer/leads?page=${page}`);
}

export async function getDealerAnalytics() {
  return api.get('/dealer/analytics');
}
