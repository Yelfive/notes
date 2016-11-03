<?php

/**
 * @author Felix Huang <yelfivehuang@gamil.com>
 */

namespace api\components;

use Yii;
use yii\web\TooManyRequestsHttpException;

class ErrorHandler extends \yii\web\ErrorHandler
{

    /**
     * Renders the exception.
     * @param \Exception $exception
     */
    public function renderException($exception)
    {
        /* @var $response \yii\web\Response */
        $response = Yii::$app->response;
        $response->format = $response::FORMAT_JSON;
        $data = $this->convertExceptionToArray($exception);

        if (isset($_SERVER['HTTP_X_TEST']) || in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
            $response->data = &$data;
        } else {
            if (strncasecmp($data['message'], 'SQLSTATE', 7) === 0) {
                $data['code'] < 400 && $data['code'] = 500;
                $data = [
                    'message' => Yii::t('error', 'Server Internal Error({type}).', ['type' => 'db']),
                    'code' => $data['code'],
                ];
            }

            if (empty($data['code'])) {
                $data['code'] = empty($data['status']) ? 500 : $data['status'];
            }
            if ($data['code'] < 400) {  // PHP internal error
                $data = [
                    'code' => 500,
                    'message' => Yii::t('error', 'Server Internal Error({type}).', ['type' => 'PHP']),
                ];
            } else if ($data['code'] == 404) {
                $data['message'] = Yii::t('error', 'Requested resource does not exists.');
            }

            if (!isset($data['message'])) {
                $data['message'] = isset($data['name']) ? $data['name'] : Yii::t('error', 'Server Internal Error({type}).', ['type' => 'NULL message']);
            }

            // Response should contain only code, message
            $response->data = [
                'code' => &$data['code'],
                'message' => &$data['message'],
            ];
        }
        $response->setStatusCode(200);
        $response->send();
    }

    public function logException($exception)
    {
        if ($exception instanceof NoLogException
            || $exception instanceof TooManyRequestsHttpException
        ) {
            return;
        }
        parent::logException($exception);
    }

}
