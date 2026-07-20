<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Railway Nixpacks hack: Override database config at runtime to bypass poisoned config cache
        if (env('DATABASE_PUBLIC_URL') || env('DATABASE_URL') || env('PGHOST')) {
            config([
                'database.default' => 'pgsql',
            ]);
            
            // Railway internal DNS sometimes fails to resolve postgres.railway.internal.
            // Using the PUBLIC URL bypasses this issue via the TCP proxy.
            $url = env('DATABASE_PUBLIC_URL') ?: env('DATABASE_URL');
            
            if ($url) {
                config([
                    'database.connections.pgsql.url' => $url,
                    'database.connections.pgsql.host' => null, // Nuke to force url parser
                    'database.connections.pgsql.port' => null,
                    'database.connections.pgsql.database' => null,
                    'database.connections.pgsql.username' => null,
                    'database.connections.pgsql.password' => null,
                ]);
            } else {
                config([
                    'database.connections.pgsql.url' => null,
                    'database.connections.pgsql.host' => env('PGHOST'),
                    'database.connections.pgsql.port' => env('PGPORT', 5432),
                    'database.connections.pgsql.database' => env('PGDATABASE'),
                    'database.connections.pgsql.username' => env('PGUSER'),
                    'database.connections.pgsql.password' => env('PGPASSWORD'),
                ]);
            }
        }
    }
}
