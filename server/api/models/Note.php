<?php

namespace api\models;

use Yii;
use api\components\ActiveRecord;

/**
 * This is the model class for table "{{%note}}".
 *
 * @property integer $id
 * @property integer $created_by
 * @property integer $created_at
 * @property integer $updated_at
 * @property string $title
 * @property string $content
 *
 * @method static Note getModelById(int $id, boolean $createWhenNotFound = true) Return ActiveRecord of Note
 * @method static|null Note findOne(mixed $condition)
 */
class Note extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%note}}';
    }

    /**
     * Extra rules, besides base rules from parent
     */
    public function rules()
    {
        return [
            [['created_by', 'created_at', 'updated_at'], 'integer'],
            [['title', 'content'], 'required'],
            [['content'], 'string'],
            [['title'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => Yii::t('base', 'ID'),
            'created_by' => Yii::t('base', 'Created By'),
            'created_at' => Yii::t('base', 'Created At'),
            'updated_at' => Yii::t('base', 'Updated At'),
            'title' => Yii::t('note', 'Title'),
            'content' => Yii::t('note', 'Content'),
        ];
    }
}
