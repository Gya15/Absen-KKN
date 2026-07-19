<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';

    protected $appends = ['foto_absen_url'];

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

    /**
     * Get the full URL for the attendance photo.
     */
    public function getFotoAbsenUrlAttribute()
    {
        if ($this->foto_absen) {
            return \Illuminate\Support\Facades\Storage::url($this->foto_absen);
        }
        return null;
    }
}
