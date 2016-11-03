<?php

namespace api\controllers;

use api\components\Controller;
use api\models\Note;

/**
 * Site controller
 */
class NoteController extends Controller
{

    /**
     * Displays homepage.
     *
     * @return string
     */
    public function actionIndex()
    {
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
            $this->result->message = \Yii::t('error', 'The resource you requested does not exist.');
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
}
