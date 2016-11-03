<?php

/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

namespace api\components;

use Yii;
use yii\base\InvalidRouteException;

/**
 *
 * - Don't log InvalidRouteException
 * @method Request getRequest()
 */
class Application extends \yii\web\Application
{
    public function runAction($route, $params = [])
    {
        try {
            return parent::runAction($route, $params);
        } catch (InvalidRouteException $e) {
            throw new NoLogException($e->getMessage(), 404, $e);
        }
    }
}