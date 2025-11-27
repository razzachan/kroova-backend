from supabase import create_client

supabase = create_client(
    "https://vohkzfkuwemfklgyzplp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaGt6Zmt1d2VtZmtsZ3l6cGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5MTksImV4cCI6MjA1MDU0NzkxOX0.iZHiGy1d8C1xBPWKIoJD8daTvs8hB9j-wLTXpR0E8oM"
)

print("🔍 Boosters:")
boosters = supabase.table('booster_types').select('id, name, edition_id').limit(3).execute()
for b in boosters.data:
    print(f"  {b['name']}: edition_id = {b['edition_id']} (type: {type(b['edition_id']).__name__})")

print("\n🔍 Edition Configs:")
editions = supabase.table('edition_configs').select('id, code').execute()
for e in editions.data:
    print(f"  {e['code']}: id = {e['id']} (type: {type(e['id']).__name__})")

print("\n🔍 Match?")
if boosters.data and editions.data:
    booster_ed_id = boosters.data[0]['edition_id']
    edition_id = editions.data[0]['id']
    print(f"  {booster_ed_id} == {edition_id} ? {booster_ed_id == edition_id}")
    print(f"  repr: '{repr(booster_ed_id)}' vs '{repr(edition_id)}'")
