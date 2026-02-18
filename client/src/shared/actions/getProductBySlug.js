'use server'

import { getProductBySlug } from '@shared/services/productsServices';

export async function getProductBySlugAction(slug) {
  try {
    const product = await getProductBySlug(slug);
    return { success: true, data: product };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: error.message };
  }
}