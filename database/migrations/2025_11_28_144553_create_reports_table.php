<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reports', function (Blueprint $table) {
            $table->id('report_id');

            // Reporter (user who submitted the report)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');

            // Assigned IT personnel
            $table->foreignId('it_personnel_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');

            // Report category foreign key (replaces incident_type)
            $table->foreignId('report_category_id')
                  ->constrained('report_categories')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');

            $table->boolean('anonymous_flag')->default(false);
            $table->text('description');
            
            $table->date('incident_date')->nullable(); // Changed: Date when the incident happened
            
            // File attachment metadata (instead of BLOB)
            $table->string('attachment_mime', 100)->nullable();
            $table->string('attachment_name', 255)->nullable();
            $table->string('attachment_path', 500)->nullable();

            $table->foreignId('report_status_id')
                  ->constrained('report_statuses')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('reports');
    }
};