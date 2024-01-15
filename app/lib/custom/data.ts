import query from './db';
import { formatCurrency } from '../utils';

interface Revenue {
    month: string;
    revenue: number;
  }



  interface LatestInvoiceRaw {
    amount: string;
    name: string;
    image_url: string;
    email: string;
    id: string;
  }

  interface InvoicesTable  {
    id: string;
    customer_id: string;
    name: string;
    email: string;
    image_url: string;
    date: string;
    amount: number;
    status: 'pending' | 'paid';
  };


  interface  CustomerField  {
    id: string;
    name: string;
  };
  
  interface InvoiceForm  {
    id: string;
    customer_id: string;
    amount: number;
    status: 'pending' | 'paid';
  };
  


export default async function customFetchRevenue(): Promise<Revenue[]> {
  try {
    const results: any[] =  await query('SELECT * FROM revenue');
    // res.status(200).json({ data: results });
    const revenues: Revenue[] = results.map(result => ({
        month: result.month,
        revenue: result.revenue,
      }));
      return revenues;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    // res.status(500).json({ error: 'Internal Server Error' });
    return [];
  }
}


export async function customFetchLatestInvoices() {
    try {
        const results: any[] =  await query(`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ORDER BY invoices.date DESC
        LIMIT 5`);
 const latestInvoices: LatestInvoiceRaw[] = results.map(result => ({
        ...result,
        amount: formatCurrency(result.amount),
      }));
      return latestInvoices;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the latest invoices.');
    }
  }

  export async function customFetchCardData() {
    try {
      // You can probably combine these into a single SQL query
      // However, we are intentionally splitting them to demonstrate
      // how to initialize multiple queries in parallel with JS.
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const invoiceCountPromise =  await query(`SELECT COUNT(*) as count FROM invoices`);
      const customerCountPromise = await query(`SELECT COUNT(*) as count FROM customers`);
      const invoiceStatusPromise = await query(`SELECT
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      FROM invoices`);
  
      const data = await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        invoiceStatusPromise,
      ]);

  
      const numberOfInvoices = Number(data[0][0].count ?? '0');
      const numberOfCustomers = Number(data[1][0].count ?? '0');
      const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
      const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');


  
      return {
        numberOfCustomers,
        numberOfInvoices,
        totalPaidInvoices,
        totalPendingInvoices,
      };
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch card data.');
    }
  }

  const ITEMS_PER_PAGE = 6;
  export async function customFetchFilteredInvoices(
    queryStr: string,
    currentPage: number,
  ) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
    try {
        const invoices: any[] = await query(`
        SELECT
          invoices.id,
          invoices.amount,
          invoices.date,
          invoices.status,
          customers.name,
          customers.email,
          customers.image_url
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
          customers.name like ${`'%${queryStr}%'`} OR
          customers.email like ${`'%${queryStr}%'`} OR
          invoices.amount like ${`'%${queryStr}%'`} OR
          invoices.date like ${`'%${queryStr}%'`} OR
          invoices.status like ${`'%${queryStr}%'`}
        ORDER BY invoices.date DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `);

      const invoicesTable: InvoicesTable[] = invoices.map(result => ({
        ...result,
      }));
  
      return invoicesTable;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch invoices.');
    }
  }


  export async function customFetchInvoicesPages(queryStr: string) {
    try {
      const count = await query(`SELECT COUNT(*) as count
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name like ${`'%${queryStr}%'`} OR
        customers.email like ${`'%${queryStr}%'`} OR
        invoices.amount like ${`'%${queryStr}%'`} OR
        invoices.date like ${`'%${queryStr}%'`} OR
        invoices.status like ${`'%${queryStr}%'`}
    `);
      const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch total number of invoices.');
    }
  }

  export async function customFetchCustomers() {
    try {
      const fetchCustomers: any[] = await query(`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `);
    const customers: CustomerField[] = fetchCustomers.map(result => ({
      ...result,
    }));
      return customers;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch all customers.');
    }
  }

  export async function customFetchInvoiceById(id: string) {
    try {
      const InvoiceForm : any[] = await query(`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ?;
    `, [id]);
  
      const invoice = InvoiceForm.map((invoice) => ({
        ...invoice,
        amount: invoice.amount / 100,
      }));
      return invoice[0];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch invoice.');
    }
  }


  // export async function customFetchCustomers() {
  //   try {
  //     const CustomerField : any[] = await query(`
  //     SELECT
  //       id,
  //       name
  //     FROM customers
  //     ORDER BY name ASC
  //   `);
  //     const customers = CustomerField;
  //     return customers;
  //   } catch (err) {
  //     console.error('Database Error:', err);
  //     throw new Error('Failed to fetch all customers.');
  //   }
  // }