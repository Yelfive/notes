<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace common\data\templates\crud;

use Yii;

/**
 * Generates CRUD
 *
 * @property array $columnNames Model column names. This property is read-only.
 * @property string $controllerID The controller ID (without the module ID prefix). This property is
 * read-only.
 * @property array $searchAttributes Searchable attributes. This property is read-only.
 * @property boolean|\yii\db\TableSchema $tableSchema This property is read-only.
 * @property string $viewPath The controller view path. This property is read-only.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class Generator extends \yii\gii\generators\crud\Generator
{
    public $baseControllerClass = 'common\components\AdminController';

    public function getViewPath()
    {
        if ($this->template == 'admin') {
            $controllerPath = str_replace('\\', '/', $this->controllerClass);
            $alias = dirname(dirname($controllerPath));
            $controllerName = strtolower(substr(basename($controllerPath), 0, -10));
            return Yii::getAlias("@$alias/themes/default/views/$controllerName");
        } else {
            return parent::getViewPath();
        }

    }

    /**
     * @return array model column names
     */
    public function getColumnNames()
    {
        /* @var $class ActiveRecord */
        $class = $this->modelClass;
        if (is_subclass_of($class, 'yii\db\ActiveRecord')) {
            $attributes =  $class::getTableSchema()->getColumnNames();
            $except = ['deleted', 'created_at', 'created_by', 'updated_at', 'updated_by', 'status'];
            foreach ($except as &$v) {
                if ($key = array_search($v, $attributes)) {
                    unset($attributes[$key]);
                }
            }
            return $attributes;
        } else {
            /* @var $model \yii\base\Model */
            $model = new $class();

            return $model->attributes();
        }
    }

}
