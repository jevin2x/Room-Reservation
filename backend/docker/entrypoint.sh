
#!/bin/sh
set -e

cd /var/www/html

if [ "$APP_ENV" != "production" ]; then
    if [ ! -f vendor/autoload.php ]; then
        echo "[entrypoint] Installing composer dependencies..."
        composer install --no-interaction --prefer-dist
    fi

    if [ -f .env ] && ! grep -q '^APP_KEY=base64:' .env; then
        echo "[entrypoint] Generating APP_KEY..."
        php artisan key:generate --force || true
    fi

    if [ -f .env ] && grep -q '^APP_KEY=base64:' .env; then
        APP_KEY="$(grep '^APP_KEY=' .env | tail -n 1 | cut -d= -f2-)"
        export APP_KEY
    fi

    php artisan optimize:clear || true
else
    echo "[entrypoint] Running production migrations..."
    php artisan migrate --force

    echo "[entrypoint] Caching Laravel configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

if [ ! -e public/storage ]; then
    php artisan storage:link || true
fi

echo "[entrypoint] Starting: $*"
exec "$@"
