<?php

namespace api\components;

class AccessControl extends \yii\filters\AccessControl
{
    /**
     * Denies the access of the user.
     * The default implementation will redirect the user to the login page if he is a guest;
     * if the user is already logged, a 403 HTTP exception will be thrown.
     * @param User $user the current user
     * @throws NoLogException if the user is already logged in.
     */
    protected function denyAccess($user)
    {
        if ($user->getIsGuest()) {
            throw new NoLogException(\Yii::t('error', 'You need signup or login'), 603);
        } else {
            throw new NoLogException(\Yii::t('error', 'You are not allowed to perform this action.'));
        }
    }
}