
FROM php:8.4-fpm-bookworm AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        libicu-dev \
        libonig-dev \
        libzip-dev \
    && docker-php-ext-install \
        bcmath \
        intl \
        mbstring \
        opcache \
        pdo_mysql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

FROM base AS vendor

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

FROM base AS development

COPY docker/php/php.dev.ini /usr/local/etc/php/conf.d/laravel.ini

USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

FROM base AS production

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php/php.ini /usr/local/etc/php/conf.d/laravel.ini

COPY --from=vendor /var/www/html/vendor ./vendor
COPY . .

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN rm -f /etc/nginx/sites-enabled/default \
    && composer dump-autoload --optimize --no-dev \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

ENTRYPOINT ["entrypoint"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
