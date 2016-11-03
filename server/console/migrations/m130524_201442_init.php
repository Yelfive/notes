<?php

use yii\db\Migration;

class m130524_201442_init extends Migration
{
    public function up()
    {
        $tableOptions = null;
        if ($this->db->driverName === 'mysql') {
            // http://stackoverflow.com/questions/766809/whats-the-difference-between-utf8-general-ci-and-utf8-unicode-ci
            $tableOptions = 'CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci ENGINE=InnoDB';
        }

        $this->createTable('{{%user}}', [
            'id' => $this->primaryKey()->unsigned(),
            'username' => $this->string(50)->notNull()->unique(),
            'auth_key' => $this->string(32)->notNull(),
            'password_hash' => $this->string()->notNull(),
            // todo: overwrite yii/db/ColumnSchemaBuilder.php, function charset();
            'password_reset_token' => 'VARCHAR(255) CHARSET UTF8 NOT NULL UNIQUE', //$this->string()->unique(),
            'email' => $this->string(100)->notNull()->unique(),

            'status' => $this->smallInteger()->notNull()->defaultValue(1),
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ], $tableOptions);

        $this->createTable('{{%note}}', [
            'id' => $this->primaryKey()->unsigned(),
            'created_by' => $this->integer()->unsigned()->notNull(),
            'created_at' => $this->integer()->unsigned()->notNull(),
            'updated_at' => $this->integer()->unsigned()->notNull(),
            'title' => $this->string(255)->notNull(),
            'content' => $this->text()->notNull(),
        ]);
    }

    public function down()
    {
        $this->dropTable('{{%user}}');
        $this->dropTable('{{%note}}');
    }
}
