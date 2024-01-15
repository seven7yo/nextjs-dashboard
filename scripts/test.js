import { Client } from '@vercel/postgres';

// 从环境变量中获取数据库连接信息
const {
  POSTGRES_URL,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env;

// 创建一个客户端连接
const client = new Client({
  connectionString: POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // 在开发环境中可能需要禁用 SSL 验证
  },
});

// 连接数据库
client.connect();

// 使用客户端执行查询
client.query('SELECT * FROM your_table', (err, result) => {
  if (err) {
    console.error('Error executing query', err);
    return;
  }

  console.log('Query result:', result.rows);

  // 记得在使用完毕后关闭数据库连接
  client.end();
});