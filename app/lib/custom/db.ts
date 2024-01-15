import mysql , { Pool, RowDataPacket } from 'mysql2/promise';

// 创建数据库连接池
const pool = mysql.createPool({
  host: '118.178.237.243',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'verceldb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 查询函数
// const query = async (sql: string, values?: any[]): Promise<RowDataPacket[]> => {
//     const connection = await pool.getConnection();
//     try {
//       const [results] = await connection.execute<RowDataPacket[]>(sql, values);
//       return results;
//     } finally {
//       connection.release();
//     }
//   };


// 查询函数
const query = async (sql: string, values?: any[]): Promise<RowDataPacket[]> => {
  const connection = await pool.getConnection();
  try {
    const [results,Failed] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
};
  
export default query;