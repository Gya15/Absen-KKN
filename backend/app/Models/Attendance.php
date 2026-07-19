<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $fillable = [
        'user_id',
        'tanggal',
        'waktu_absen',
        'status',
        'foto_absen',
        'similarity',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'similarity' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
