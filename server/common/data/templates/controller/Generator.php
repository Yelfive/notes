<?php

namespace common\data\templates\controller;

use Yii;
use yii\gii\CodeFile;
use yii\helpers\Html;

class Generator extends \yii\gii\generators\controller\Generator
{

    /**
     * @inheritdoc
     */
    public $baseClass = 'common\components\AdminController';

    /**
     * Cancel sticker attributes
     * @inheritdoc
     */
    public function stickyAttributes()
    {
        return [];
    }

    /**
     * When the namespace is under `api`, it will not be needed to create view file
     * @inheritdoc
     */
    public function generate()
    {
        $files = [];

        $files[] = new CodeFile(
            $this->getControllerFile(),
            $this->render('controller.php')
        );

        if (strpos($this->controllerClass, 'api') === false) {
            foreach ($this->getActionIDs() as $action) {
                $files[] = new CodeFile(
                    $this->getViewFile($action),
                    $this->render('view.php', ['action' => $action])
                );
            }
        }

        return $files;
    }


    /**
     * Return message with out link if the controller is for `api`
     * @inheritdoc
     */
    public function successMessage()
    {
        $str = 'The controller has been generated successfully.';
        if (strpos($this->controllerClass, 'api') !== false) {
            return $str;
        }
        $actions = $this->getActionIDs();
        if (in_array('index', $actions)) {
            $route = $this->getControllerID() . '/index';
        } else {
            $route = $this->getControllerID() . '/' . reset($actions);
        }
        $link = Html::a('try it now', Yii::$app->getUrlManager()->createUrl($route), ['target' => '_blank']);

        return "{$str}You may $link.";
    }

}