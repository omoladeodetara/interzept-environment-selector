#!/usr/bin/env bash
set -e

# Export current local Supabase DB data to seed_snapshot.sql
# Run this before stopping work or pushing to preserve test data

CONTAINER_NAME="supabase_db_last-price"
OUTPUT_FILE="supabase/seed_snapshot.sql"

echo "📦 Exporting database to $OUTPUT_FILE..."

docker exec -i "$CONTAINER_NAME" pg_dump -U postgres \
  --data-only \
  --schema=public \
  --inserts \
  --no-owner \
  --no-privileges \
  postgres > "$OUTPUT_FILE"

echo "✅ Export complete: $OUTPUT_FILE"
echo ""
echo "To commit:"
echo "  git add $OUTPUT_FILE && git commit -m 'chore: update seed snapshot'"
