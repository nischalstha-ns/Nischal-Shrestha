import * as XLSX from 'xlsx';
import type { Product, Category, Order } from '@shared/types';

export async function exportToExcel(data: {
  products: Product[];
  categories: Category[];
  sales: Order[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. Products Sheet
  const productsData = data.products.map(p => ({
    ID: p.id,
    Name: p.name,
    Category: data.categories.find(c => c.id === p.categoryId)?.name || 'Unknown',
    Price: p.price,
    Stock: p.stock,
    'Min Stock': p.minStock,
    Image: p.image || '',
    'Created At': new Date(p.createdAt || '').toLocaleString(),
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products');

  // 2. Categories Sheet
  const categoriesData = data.categories.map(c => ({
    ID: c.id,
    Name: c.name,
    Description: c.description || '',
    Image: c.image || '',
    'Created At': new Date(c.createdAt || '').toLocaleString(),
  }));
  const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');

  // ... existing sales sheets ...
  // 3. Sales Summary Sheet
  const salesSummaryData = data.sales.map(s => ({
    'Order ID': s.id,
    Timestamp: new Date(s.timestamp).toLocaleString(),
    Subtotal: s.subtotal,
    Discount: s.discount,
    Tax: s.tax,
    Total: s.total,
    'Items Count': s.items.length,
    Status: s.status,
  }));
  const wsSalesSummary = XLSX.utils.json_to_sheet(salesSummaryData);
  XLSX.utils.book_append_sheet(wb, wsSalesSummary, 'Sales Summary');

  // 4. Sales Items Sheet (Detailed)
  const salesItemsData: any[] = [];
  data.sales.forEach(s => {
    s.items.forEach(item => {
      salesItemsData.push({
        'Order ID': s.id,
        Timestamp: new Date(s.timestamp).toLocaleString(),
        'Product Name': item.name,
        Quantity: item.quantity,
        Price: item.price,
        Total: item.quantity * item.price,
      });
    });
  });
  const wsSalesItems = XLSX.utils.json_to_sheet(salesItemsData);
  XLSX.utils.book_append_sheet(wb, wsSalesItems, 'Sales Details');

  // Generate and Download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shop-manager-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromExcel(file: File): Promise<{
  categories: Partial<Category>[];
  products: Partial<Product>[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const categories: Partial<Category>[] = [];
        const products: Partial<Product>[] = [];

        // Parse Categories
        const categoriesSheet = workbook.Sheets['Categories'];
        if (categoriesSheet) {
          const rawCategories = XLSX.utils.sheet_to_json(categoriesSheet) as any[];
          rawCategories.forEach(row => {
            categories.push({
              id: row.ID || crypto.randomUUID(),
              name: row.Name,
              description: row.Description || '',
              image: row.Image || '',
            });
          });
        }

        // Parse Products
        const productsSheet = workbook.Sheets['Products'];
        if (productsSheet) {
          const rawProducts = XLSX.utils.sheet_to_json(productsSheet) as any[];
          rawProducts.forEach(row => {
            products.push({
              id: row.ID || crypto.randomUUID(),
              name: row.Name,
              price: Number(row.Price) || 0,
              stock: Number(row.Stock) || 0,
              minStock: Number(row.MinStock || row['Min Stock']) || 5,
              image: row.Image || '',
              // We'll need to map category name back to ID if ID is missing
              categoryId: row.CategoryID || row.Category || '', 
            });
          });
        }

        resolve({ categories, products });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
