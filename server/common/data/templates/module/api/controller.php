<?php
/**
 * This is the template for generating a controller class within a module.
 */

/* @var $this yii\web\View */
/* @var $generator yii\gii\generators\module\Generator */

echo "<?php\n";
?>

namespace <?= $generator->getControllerNamespace() ?>;

use app\components\ApiController as Controller;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        return response('This is a default action from a default controller : DefaultController::actionIndex' , 200);
    }
}
