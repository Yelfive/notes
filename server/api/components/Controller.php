<?php

/**
 * Base controller for all controllers of the module, inherited from restful
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

namespace api\components;

use Exception;
use Yii;
use yii\base\InvalidValueException;
use yii\data\DataProviderInterface;
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

/**
 * @property \api\components\Result $result
 * Called like
 * ```php
 *  $this->result = [
 *      'code' => 200,
 *      'message' => 'Result set as array',
 *  ];
 *  $this->result->message = 'Result set as object';
 * ```
 */
class Controller extends ActiveController
{

    /**
     *
     * Resource model class
     * If not set, and no request action id given,
     * the request will call method according to RESTful style in this controller
     * If set, the the api\actions\XXXAction will be invoked,
     * regardless the action in this controller
     *
     * @var bool|string
     */
    public $modelClass = false;

    public $serializer = [
        'class' => 'api\components\Serializer',
        'metaEnvelope' => 'page',
        'collectionEnvelope' => 'list',
        'linksEnvelope' => false,
    ];

    /**
     * @var \api\components\Result Private \app\components\Result container
     */
    private $_result;

    /**
     * Get the \app\components\Result instance.
     * Invoked by calling `$this->result`
     * @return Result
     */
    public function getResult()
    {
        return $this->_result;
    }

    public function setResult($data)
    {
        if (is_array($data) || $data instanceof \stdClass) {
            foreach ($data as $name => $value) {
                $this->_result->$name = $value;
            }
        } else {
            throw new InvalidValueException('Trying to set the invalid value of result');
        }
    }

    public function init()
    {
        $this->_result = new Result();
        parent::init();
    }

    public function actions()
    {
        if (!$this->modelClass) {
            return [];
        }
        $actions = $this->modelClass ? parent::actions() : [];
        if ($actions) {
            foreach ($actions as $key => &$action) {
                $action['class'] = 'api\actions\\' . ucfirst($key) . 'Action';
            }
            unset($action);
        }
        return $actions;
    }

    /**
     * Try catching access log, throw exception if exists
     * @inheritdoc
     * @throws Exception
     */
    public function runAction($id, $params = [])
    {
        if (empty($id)) {
            switch (Yii::$app->request->method) {
                case 'GET':
                    $id = Yii::$app->getRequest()->get('id') === null ? 'index' : 'view';
                    break;
                case 'POST':
                    $id = 'create';
                    break;
                case 'PUT':
                    $id = 'update';
                    break;
                case 'DELETE':
                    $id = 'delete';
            }
        }
        try {
            if (!$this->modelClass || func_get_arg(0) || isset($this->actions()[$id])) {
                $valid = parent::runAction($id, $params);
                // In case the user started as guest, which is not started, and end as not
                return $valid;
            } else {
                throw new ForbiddenHttpException(Yii::t('error', 'Access forbidden'));
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    public final function behaviors()
    {
        if ($overwrite = $this->overwriteBehaviors()) {
            return $overwrite;
        }
        $behaviors = parent::behaviors();
        $behaviors['contentNegotiator']['formats']['text/html'] = Response::FORMAT_JSON;
//        $behaviors['verbFilter']['class'] = 'common\filters\VerbFilter';
        // Rate limit
//        if (is_array(Yii::$app->params['rateLimit'])) {
//            $behaviors['rateLimiter'] = [
//                'class' => '\yii\filters\RateLimiter',
//                'errorMessage' => Yii::t('error', 'Rate limit exceeded.'),
//            ];
//        }

        if ($extraBehavior = $this->addBehaviors()) {
            return array_merge($behaviors, $extraBehavior);
        } else {
            return $behaviors;
        }
    }

    public function addBehaviors()
    {
        return [

        ];
    }

    public function overwriteBehaviors()
    {
        return [];
    }

    /**
     * Serializes the specified data.
     * The default implementation will create a serializer based on the configuration given by [[serializer]].
     * It then uses the serializer to serialize the given data.
     * Priority will be: `$this->result->data` < `$this->result->extend` < `return data`,
     * which means the later will overwrite the former.
     *
     * @param mixed $actionReturn the data to be serialized
     * @return mixed the serialized data.
     */
    protected function serializeData($actionReturn)
    {
        // data can be null

        // Load data from return value of `Controller:actionXXX`
        if (!$actionReturn || is_string($actionReturn)) {
            $data = [];
        } else if (is_array($actionReturn)) {
            $data = $actionReturn;
        } else {
            $data = $this->getSerializer()->serialize($actionReturn);
        }

        // Load data from `Result`
        if ($this->result->hasResponse()) {
            $result = $this->result->getAttributes();
            if (isset($result['extend'])) {
                $result = array_merge($result, $result['extend']);
                unset($result['extend']);
            }
            if (isset($result['list']) && $result['list'] instanceof DataProviderInterface) { // $this->result->list = $provider
                $result = array_merge($result, $this->getSerializer()->serialize($result['list']));
            }
            // Merge data, and the former writes the later
            $response = array_merge($result, $data);
        } else {
            $response = &$data;
        }

        if (empty($response)) {
            throw new InvalidValueException('Response result cannot be empty.');
        } else if (!isset($response['message'])) {
            throw new InvalidValueException('Response result must contain "message" field.');
        } else if (!isset($response['code'])) {
            $response['code'] = Result::CODE_SUCCESS;
        }

        // Always return access token when changed
        if (PHP_SESSION_ACTIVE && session_id() && session_id() != Yii::$app->getSession()->getRawAccessToken()) {
            $response['access_token'] = session_id();
        }
        return $response;
    }

    /**
     * @var Serializer
     */
    private $_serializer;

    /**
     * Returns a serializer or creates and then returns
     * @return Serializer
     * @throws \yii\base\InvalidConfigException
     */
    public function getSerializer()
    {
        if (!$this->_serializer) {
            $this->_serializer = Yii::createObject($this->serializer);
        }
        return $this->_serializer;
    }

}