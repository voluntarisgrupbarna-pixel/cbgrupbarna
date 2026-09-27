# CB Grup Barna — web

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias). Las páginas usan
rutas absolutas del tipo `/cbgrupbarna/assets/...`, pensadas para el despliegue
en `.../cbgrupbarna/`, así que el entorno local debe servir el proyecto con ese
mismo prefijo.

## Entorno local

Requisitos: `git` y `python3`.

```bash
# 1. Clonar (mantén el nombre de carpeta "cbgrupbarna")
git clone https://github.com/voluntarisgrupbarna-pixel/cbgrupbarna.git
cd cbgrupbarna

# 2. Levantar el servidor local
./serve.sh          # puerto 8000 por defecto
./serve.sh 5000      # o eligiendo otro puerto
```

Abre en el navegador la URL que imprime el script, por ejemplo:

```
http://localhost:8000/cbgrupbarna/index.html
```

Los cambios en `.html`/`assets` se ven al recargar el navegador, sin reiniciar
el servidor.

## Ramas

El desarrollo activo va en `claude/youthful-lamport-ni6ptl`.
