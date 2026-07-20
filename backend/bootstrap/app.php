<?php

// Railway hack: Always clear config cache on boot to ensure runtime environment variables are used
if (file_exists(__DIR__.'/cache/config.php')) {
    @unlink(__DIR__.'/cache/config.php');
}

// Force the public TCP proxy directly into the environment to bypass all config caches
if (getenv('DATABASE_URL') || getenv('PGHOST') || isset($_SERVER['PGHOST'])) {
    putenv("DB_CONNECTION=pgsql");
    putenv("DB_HOST=tokaido.proxy.rlwy.net");
    putenv("DB_PORT=58544");
    $_ENV['DB_CONNECTION'] = 'pgsql';
    $_ENV['DB_HOST'] = 'tokaido.proxy.rlwy.net';
    $_ENV['DB_PORT'] = '58544';
    $_SERVER['DB_CONNECTION'] = 'pgsql';
    $_SERVER['DB_HOST'] = 'tokaido.proxy.rlwy.net';
    $_SERVER['DB_PORT'] = '58544';
}

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
