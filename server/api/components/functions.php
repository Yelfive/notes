<?php

/**
 * This is a custom function file, mainly to define functions that are used frequently
 *
 * @author Felix Huang <yelfivehuang@gmial.com>
 */


/**
 * Returns all `$_GET` if name is null
 * @alias \Yii::$app->request->get
 * @param string|null $name the parameter name
 * @param mixed $defaultValue the default parameter value if the parameter does not exist.
 * @return array|mixed
 * @see \yii\web\Request
 */
function get($name = null, $defaultValue = null)
{
    return Yii::$app->request->get($name, $defaultValue);
}

/**
 * Returns parameters passed by methods except for `GET`
 * @param string|null $name
 * @param mixed $defaultValue
 * @return array|mixed
 * @throws \yii\base\InvalidConfigException
 */
function restful($name = null, $defaultValue = null)
{
    return $name === null
        ? Yii::$app->request->getBodyParams()
        : Yii::$app->request->getBodyParam($name, $defaultValue);
}
