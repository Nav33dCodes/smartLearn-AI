import asyncio
from database import get_async_db
from sqlalchemy import text

async def test():
    async for db in get_async_db():
        try:
            result = await db.execute(text("SELECT 1"))
            print("DB SUCCESS:", result.scalar())
        except Exception as e:
            print("DB ERROR:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
