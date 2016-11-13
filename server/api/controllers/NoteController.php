<?php

namespace api\controllers;

use api\components\Controller;
use api\models\Note;
use yii\data\ActiveDataProvider;

/**
 * Site controller
 */
class NoteController extends Controller
{

    public function actionIndex()
    {
        $query = Note::find()->select(['id', 'title', 'created_at' => 'updated_at'])->orderBy('updated_at DESC,id DESC');
        $provider = new ActiveDataProvider([
            'query' => $query,
            'pagination' => [
                'pageSize' => get('per_page', 30)
            ]
        ]);
        $this->result->list = $provider;
        $this->result->message = \Yii::t('note', 'Getting notes success fully');
    }

    public function actionCreate()
    {
        $model = new Note();
        $model->setAttributes(restful());
        if ($model->insert()) {
            $this->result->code = 200;
            $this->result->message = \Yii::t('note', 'Created successfully');
            $this->result->extend = ['id' => $model->id];
        } else {
            $this->result->message = \Yii::t('note', 'Failed to create note');
            $this->result->data = restful();
        }
    }

    public function actionUpdate()
    {
        $model = Note::findOne(restful('id'));
        if (!$model) {
            $this->result->code = 404;
            $this->result->message = \Yii::t('error', 'Not Found');
            return;
        }

        $model->setAttributes(restful());
        if (false !== $model->update()) {
            $this->result->message = \Yii::t('note', 'Updated note successfully');
            $this->result->extend = ['id' => $model->id];
        } else {
            $this->result->code = 520;
            $this->result->message = $model->errorsToString();
        }
    }

    public function actionView()
    {
        $model = Note::findOne(get('id'));
        if ($model) {
            $this->result->data = $model->attributes;
            $this->result->message = \Yii::t('note', 'Succeeded in getting detail');
        } else {
            $this->result->code = 404;
            $this->result->message = \Yii::t('error', 'Not Found');
        }
    }

}
