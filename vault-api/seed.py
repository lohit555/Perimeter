import asyncio

from sqlmodel import select

from db import async_session_maker, init_db
from models import Vendor
from routers.tokens import issue_token

DEMO_VENDORS = [
    {
        "name": "StreamFlix",
        "domain": "streamflix.com",
        "descriptor": "STREAMFLIX*SUB",
        "logo_color": "#E11D48",
        "initials": "SF",
        "monthly_limit": 25,
    },
    {
        "name": "Amazon",
        "domain": "amazon.com",
        "descriptor": "AMAZON.COM*RETAIL",
        "logo_color": "#FF9900",
        "initials": "AZ",
        "monthly_limit": 500,
    },
    {
        "name": "Uber",
        "domain": "uber.com",
        "descriptor": "UBER TRIP",
        "logo_color": "#0F172A",
        "initials": "UB",
        "monthly_limit": 200,
    },
    {
        "name": "Spotify",
        "domain": "spotify.com",
        "descriptor": "SPOTIFY*PREMIUM",
        "logo_color": "#1DB954",
        "initials": "SP",
        "monthly_limit": 12,
    },
    {
        "name": "ShadyDeals",
        "domain": "shadydeals.tv",
        "descriptor": "SHADYDEALS LLC",
        "logo_color": "#7C3AED",
        "initials": "SD",
        "monthly_limit": 50,
    },
]


async def seed() -> None:
    await init_db()
    async with async_session_maker() as session:
        for entry in DEMO_VENDORS:
            existing = (
                await session.execute(select(Vendor).where(Vendor.domain == entry["domain"]))
            ).scalars().first()
            if existing:
                print(f"skip {entry['name']} — already seeded")
                continue

            vendor = Vendor(
                name=entry["name"],
                domain=entry["domain"],
                descriptor=entry["descriptor"],
                logo_color=entry["logo_color"],
                initials=entry["initials"],
            )
            session.add(vendor)
            await session.commit()
            await session.refresh(vendor)

            await issue_token(session, vendor.id, entry["monthly_limit"], recurring=True)
            print(f"seeded {vendor.name} ({vendor.domain})")


if __name__ == "__main__":
    asyncio.run(seed())
