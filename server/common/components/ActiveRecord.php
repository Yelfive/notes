<?php

/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

namespace common\components;

use yii\base\UnknownMethodException;
use yii\db\Expression;

/**
 * Class ActiveRecord
 * @package common\components
 * @property integer $created_by
 * @property integer $updated_by
 * @property integer $created_at
 * @property integer $updated_at
 * @property integer $deleted
 *
 * @method null addError(string $attribute, string $error = '')
 */
class ActiveRecord extends \yii\db\ActiveRecord
{
    const DELETED_NO = 0;
    const DELETED_YES = 1;

    /**
     * Format attribute models into a string
     * @return string
     */
    public function errorsToString()
    {
        $errors = $this->getErrors();
        $singleDimensionErrors = [];
        if ($errors) {
            foreach ($errors as $attr => $errs) {
                $singleDimensionErrors[] = implode('; ', $errs);
            }
            $string = implode('.', $singleDimensionErrors);
            return str_replace(['..', '。.'], ['.', '。'], $string);
        } else {
            return '';
        }
    }

    public static function findModel($condition, $fields = '*', $params = [])
    {
        if (false == $model = static::find()->select($fields)->where($condition, $params)->one()) {
            $model = new static;
        }
        return $model;
    }

    /**
     * @var array cache for type range
     */
    private $_range = [];

    /**
     * Range comes from class constants prefixed with `strtoupper($type) . '_'`
     * Used for rules
     * Usage Example:
     * ```php
     *  [['type'], 'in', 'range' => function () {return $this->range();}],
     * ```
     * @param integer $type
     * @return array
     */
    public function range($type)
    {
        $prefix = strtoupper($type) . '_';
        if (isset($this->_range[$prefix])) {
            return $this->_range[$prefix];
        }
        $refectionCls = new \ReflectionClass($this);
        $constants = $refectionCls->getConstants();
        $types = [];
        foreach ($constants as $k => &$const) {
            if (strpos($k, $prefix) === 0) {
                $types[] = $const;
            }
        }
        return $this->_range[$prefix] = $types;
    }

}