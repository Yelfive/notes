<?php

/**
 * @author Felix Huang <yelfivehuang@gamil.com>
 */

namespace api\components;

use yii\base\InvalidValueException;
use yii\base\Object;
use yii\data\DataProviderInterface;

/**
 * The response result class
 *
 * @property string $message
 * @property int $code
 * @property array $data
 * @property array $list
 * @property array $extend Extended data, to be passed in the first dimension of the response result
 * @property array $attributes
 */
class Result extends Object
{

    const CODE_SUCCESS = 200;

    public $attributesNames = [
        'message',
        'code',
        'data',
        'list',
        'extend',
    ];
    private $_attributes;

    public function rules()
    {
        return [
            'message' => function ($value) {
                return is_string($value);
            },
            'code' => function ($value) {
                return is_int($value);
            },
            'data' => function($value) {
                return null === $value || is_array($value) || $value instanceof \stdClass;
            },
            'list' => function ($value) {
                return null === $value || is_array($value) && (count($value) === 0 || isset($value[0])) || $value instanceof DataProviderInterface;
            },
            'extend' => function ($value) {
                return null === $value || is_array($value) || $value instanceof \stdClass;
            }
        ];
    }

    // TODO: unique entry for validation
    public function validate($attribute = null)
    {
        $rules = $this->rules();
//        if ($attribute !== null) {
//        }
//        foreach () {
//
//        }
    }

    /**
     * PHP setter magic method.
     * @param string $name property name
     * @param mixed $value property value
     */
    public function __set($name, $value)
    {
        if ($this->hasAttribute($name)) {
            if (0
                || $name == 'message' && is_string($value)
                || $name == 'code' && is_int($value)
                || in_array($name, ['data', 'list', 'extend']) && is_array($value)
                || $name == 'data' && ($value instanceof \stdClass || $value instanceof \JsonSerializable)
                || $name == 'list' && $value instanceof DataProviderInterface
            ) {
                $this->_attributes[$name] = $value;
            } else {
                throw new InvalidValueException("Invalid value for the result element `{$name}`.");
            }
        } else {
            parent::__set($name, $value);
        }
    }

    /**
     * PHP setter magic method.
     * @param string $name property name
     * @return mixed
     */
    public function __get($name)
    {
        if ($this->hasAttribute($name)) {
            return $this->_attributes[$name];
        } else {
            return parent::__get($name);
        }
    }

    /**
     * Returns a value indicating whether the model has an attribute with the specified name.
     * @param string $name the name of the attribute
     * @return boolean whether the model has an attribute with the specified name.
     */
    public function hasAttribute($name)
    {
        return isset($this->_attributes[$name]) || in_array($name, $this->attributesNames);
    }

    /**
     * Returns result data
     * If the code is not set, self::CODE_SUCCESS will be set
     * @return array|null
     */
    public function getAttributes()
    {
        if ($this->_attributes && !isset($this->_attributes['code'])) {
            $this->_attributes['code'] = self::CODE_SUCCESS;
        }
        return $this->_attributes;
    }

    public function hasResponse()
    {
        return is_array($this->_attributes);
    }

}