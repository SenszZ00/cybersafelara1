<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void {
        Schema::create('articles', function (Blueprint $table) {
            $table->id('article_id');
            
            // Relation to users table
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->onUpdate('cascade');

            // Relation to article_categories table
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('article_categories')
                ->onDelete('set null')
                ->onUpdate('cascade');

            $table->foreignId('article_status_id')
                ->default(1) // 1 = pending
                ->constrained('article_statuses')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->string('title');
            $table->text('content');
            $table->string('keyword')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('articles');
    }
};
