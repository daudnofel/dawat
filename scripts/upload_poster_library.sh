#!/bin/bash
# Upload all poster library assets to Supabase Storage (poster-library bucket)
# and seed the poster_library table.

set -e
source .env

BUCKET="poster-library"
BASE_URL="https://gwjhsbadranzzculpitm.supabase.co/storage/v1/object"
SERVICE_KEY="$EXPO_PUBLIC_SUPABASE_SERVICE_KEY"
ASSET_DIR="assets/poster-library"

echo "=== Uploading poster assets to Supabase Storage ==="

for file in $(find "$ASSET_DIR" -name "*.jpg" | sort); do
  # storage path = everything after "assets/poster-library/"
  rel="${file#$ASSET_DIR/}"
  echo "  uploading $rel ..."

  curl -s -X POST "$BASE_URL/$BUCKET/$rel" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: image/jpeg" \
    -H "x-upsert: true" \
    --data-binary "@$file" > /dev/null
done

echo "=== Seeding poster_library table ==="

# Build the SQL
SQL=""
SQL+="INSERT INTO poster_library (id, category, storage_path, thumbnail_path, name, sort_order, is_active) VALUES "
SQL+="('eid-1', 'eid', 'eid/eid-1.jpg', 'eid/eid-1_thumb.jpg', 'Eid Mubarak Classic', 0, true),"
SQL+="('eid-2', 'eid', 'eid/eid-2.jpg', 'eid/eid-2_thumb.jpg', 'Eid Mubarak Elegant', 1, true),"
SQL+="('eid-3', 'eid', 'eid/eid-3.jpg', 'eid/eid-3_thumb.jpg', 'Eid Mubarak Bold', 2, true),"
SQL+="('ramadan-1', 'ramadan', 'ramadan/ramadan-1.jpg', 'ramadan/ramadan-1_thumb.jpg', 'Ramadan Kareem Classic', 3, true),"
SQL+="('ramadan-2', 'ramadan', 'ramadan/ramadan-2.jpg', 'ramadan/ramadan-2_thumb.jpg', 'Ramadan Kareem Elegant', 4, true),"
SQL+="('ramadan-3', 'ramadan', 'ramadan/ramadan-3.jpg', 'ramadan/ramadan-3_thumb.jpg', 'Ramadan Kareem Bold', 5, true),"
SQL+="('iftar-1', 'iftar', 'iftar/iftar-1.jpg', 'iftar/iftar-1_thumb.jpg', 'Iftar Gathering Classic', 6, true),"
SQL+="('iftar-2', 'iftar', 'iftar/iftar-2.jpg', 'iftar/iftar-2_thumb.jpg', 'Iftar Gathering Elegant', 7, true),"
SQL+="('nikkah-1', 'nikkah', 'nikkah/nikkah-1.jpg', 'nikkah/nikkah-1_thumb.jpg', 'Nikkah Classic', 8, true),"
SQL+="('nikkah-2', 'nikkah', 'nikkah/nikkah-2.jpg', 'nikkah/nikkah-2_thumb.jpg', 'Nikkah Elegant', 9, true),"
SQL+="('nikkah-3', 'nikkah', 'nikkah/nikkah-3.jpg', 'nikkah/nikkah-3_thumb.jpg', 'Nikkah Bold', 10, true),"
SQL+="('walima-1', 'walima', 'walima/walima-1.jpg', 'walima/walima-1_thumb.jpg', 'Walima Classic', 11, true),"
SQL+="('walima-2', 'walima', 'walima/walima-2.jpg', 'walima/walima-2_thumb.jpg', 'Walima Elegant', 12, true),"
SQL+="('halaqa-1', 'halaqa', 'halaqa/halaqa-1.jpg', 'halaqa/halaqa-1_thumb.jpg', 'Halaqa Classic', 13, true),"
SQL+="('halaqa-2', 'halaqa', 'halaqa/halaqa-2.jpg', 'halaqa/halaqa-2_thumb.jpg', 'Halaqa Elegant', 14, true),"
SQL+="('jummah-1', 'jummah', 'jummah/jummah-1.jpg', 'jummah/jummah-1_thumb.jpg', 'Jumuah Classic', 15, true),"
SQL+="('jummah-2', 'jummah', 'jummah/jummah-2.jpg', 'jummah/jummah-2_thumb.jpg', 'Jumuah Elegant', 16, true),"
SQL+="('fundraiser-1', 'fundraiser', 'fundraiser/fundraiser-1.jpg', 'fundraiser/fundraiser-1_thumb.jpg', 'Fundraiser Classic', 17, true),"
SQL+="('fundraiser-2', 'fundraiser', 'fundraiser/fundraiser-2.jpg', 'fundraiser/fundraiser-2_thumb.jpg', 'Fundraiser Elegant', 18, true),"
SQL+="('community-1', 'community', 'community/community-1.jpg', 'community/community-1_thumb.jpg', 'Community Event Classic', 19, true),"
SQL+="('community-2', 'community', 'community/community-2.jpg', 'community/community-2_thumb.jpg', 'Community Event Elegant', 20, true),"
SQL+="('mehndi-1', 'mehndi', 'mehndi/mehndi-1.jpg', 'mehndi/mehndi-1_thumb.jpg', 'Mehndi Classic', 21, true),"
SQL+="('mehndi-2', 'mehndi', 'mehndi/mehndi-2.jpg', 'mehndi/mehndi-2_thumb.jpg', 'Mehndi Elegant', 22, true)"
SQL+=" ON CONFLICT (id) DO NOTHING;"

curl -s -X POST "https://api.supabase.com/v1/projects/gwjhsbadranzzculpitm/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "import json; print(json.dumps({'query': '''$SQL'''}))")"

echo ""
echo "=== Done ==="
