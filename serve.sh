#!/usr/bin/env bash
# Levanta un servidor HTTP local para cbgrupbarna respetando las rutas
# absolutas /cbgrupbarna/... que usan las páginas del sitio.
set -euo pipefail

PORT="${1:-8000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
FOLDER_NAME="$(basename "$SCRIPT_DIR")"

if [ "$FOLDER_NAME" != "cbgrupbarna" ]; then
  echo "Aviso: la carpeta del proyecto se llama '$FOLDER_NAME', no 'cbgrupbarna'." >&2
  echo "Las rutas absolutas /cbgrupbarna/... no resolverán correctamente." >&2
fi

echo "Sirviendo en http://localhost:${PORT}/${FOLDER_NAME}/index.html"
cd "$PARENT_DIR"
python3 -m http.server "$PORT"
