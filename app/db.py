import asyncpg
from config import DATABASE_URL

async def create_connection_pool():
    return await asyncpg.create_pool(DATABASE_URL)

async def execute_query(query: str, *args, **kwargs):
    async with await create_connection_pool() as pool:
        async with pool.acquire() as connection:
            return await connection.execute(query, *args, **kwargs)

async def fetch_query(query: str, *args, **kwargs):
    async with await create_connection_pool() as pool:
        async with pool.acquire() as connection:
            return await connection.fetch(query, *args, **kwargs)

async def fetch_single_query(query: str, *args, **kwargs):
    async with await create_connection_pool() as pool:
        async with pool.acquire() as connection:
            # Use fetchval to get a single value result, such as an ID
            return await connection.fetchval(query, *args, **kwargs)

