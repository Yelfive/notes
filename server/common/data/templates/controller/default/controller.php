<?php
/**
 * This is the template for generating a controller class file.
 */

use yii\helpers\Inflector;
use yii\helpers\StringHelper;

/* @var $this yii\web\View */
/* @var $generator yii\gii\generators\controller\Generator */

echo "<?php\n";
?>

namespace <?= $generator->getControllerNamespace() ?>;

use <?= trim($generator->baseClass, '\\'); ?>;

class <?= StringHelper::basename($generator->controllerClass) ?> extends <?= trim(pathinfo($generator->baseClass, PATHINFO_FILENAME), '\\') . "\n" ?>
{
<?php foreach ($generator->getActionIDs() as $action): ?>
    public function action<?= Inflector::id2camel($action) ?>()
    {
<?php if (strpos($generator->controllerClass, 'api') === false): ?>
        return $this->render('<?= $action ?>');
<?php else: ?>
        $this->result->message = 'This is an action from ' . __DIR__;
<?php endif; ?>
    }

<?php endforeach; ?>
}
