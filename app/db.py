import asyncpg
from config import DATABASE_URL

pool = None  # Global variable for the connection pool

async def init_connection_pool():
    global pool
    pool = await asyncpg.create_pool(DATABASE_URL)
    return pool

async def close_connection_pool():
    await pool.close()

async def execute_query(query: str, *args, **kwargs):
    async with pool.acquire() as connection:
        return await connection.execute(query, *args, **kwargs)

async def fetch_query(query: str, *args, **kwargs):
    async with pool.acquire() as connection:
        return await connection.fetch(query, *args, **kwargs)

async def fetch_single_query(query: str, *args, **kwargs):
    async with pool.acquire() as connection:
        return await connection.fetchval(query, *args, **kwargs)
