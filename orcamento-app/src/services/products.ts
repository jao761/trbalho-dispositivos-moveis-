import { API_CONFIG, request, USE_MOCKS } from './api';
import { products as mockProducts } from '@/mocks/products';
import type { Product } from '@/types/product';

type ProductApiItem = {
  id: string;
  nome: string;
  marca?: string | null;
  categoria?: string | null;
  preco_venda?: number | string | null;
  estoque?: number | null;
  ativo: boolean;
};

type ProductApiResponse = {
  items: ProductApiItem[];
};

function mapProduct(product: ProductApiItem): Product {
  return {
    id: product.id,
    name: product.nome,
    price: Number(product.preco_venda || 0),
    stock: product.estoque || 0,
    description: [product.marca, product.categoria].filter(Boolean).join(' · ') || 'Produto do catálogo',
  };
}

export async function listProducts(search?: string): Promise<Product[]> {
  try {
    const query = search ? `?q=${encodeURIComponent(search)}&pageSize=50` : '?pageSize=50';
    const response = await request<ProductApiResponse>(API_CONFIG.PRODUCT_URL, `/produtos${query}`);
    return response.items.filter((item) => item.ativo).map(mapProduct);
  } catch (error) {
    if (!USE_MOCKS) throw error;
    console.warn('Falha ao listar produtos da API, usando mock local:', error);
    if (!search) return mockProducts;
    const term = search.toLowerCase();
    return mockProducts.filter((product) => product.name.toLowerCase().includes(term));
  }
}
