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
        if (env('DATABASE_URL') || env('PGHOST')) {
            config([
                'database.default' => 'pgsql',
            ]);
            
            // Explicit PG variables take precedence to avoid parse_url issues with special characters
            if (env('PGHOST')) {
                config([
                    'database.connections.pgsql.url' => null, // Nuke URL to prevent Laravel from parsing it and overriding our exact values
                    'database.connections.pgsql.host' => env('PGHOST'),
                    'database.connections.pgsql.port' => env('PGPORT', 5432),
                    'database.connections.pgsql.database' => env('PGDATABASE'),
                    'database.connections.pgsql.username' => env('PGUSER'),
                    'database.connections.pgsql.password' => env('PGPASSWORD'),
                ]);
            } elseif (env('DATABASE_URL')) {
                config(['database.connections.pgsql.url' => env('DATABASE_URL')]);
            }
        }
    }
}
