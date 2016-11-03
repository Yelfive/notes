<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/4/21
 * Time: 11:07
 */

namespace api\components;

use yii\web\Link;

class Serializer extends \yii\rest\Serializer
{

    /**
     * Check if links should be returned
     * @inheritdoc
     */
    protected function serializePagination($pagination)
    {
        $data = [
            $this->metaEnvelope => [
                'total_count' => $pagination->totalCount,
                'page_count' => $pagination->getPageCount(),
                'current_page' => $pagination->getPage() + 1,
                'per_page' => $pagination->getPageSize(),
            ],
        ];
        if ($this->linksEnvelope !== false) {
            $data[$this->linksEnvelope] = Link::serialize($pagination->getLinks(true));
        }
        return $data;
    }

    /**
     * @inheritdoc
     */
    public function serialize($data)
    {
        $result = parent::serialize($data);
        return $result;
    }
}