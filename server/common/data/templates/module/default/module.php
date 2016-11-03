<?php
/**
 * This is the template for generating a module class file.
 */

/* @var $this yii\web\View */
/* @var $generator yii\gii\generators\module\Generator */

$className = $generator->moduleClass;
$pos = strrpos($className, '\\');
$ns = ltrim(substr($className, 0, $pos), '\\');
$className = substr($className, $pos + 1);

echo "<?php\n";
?>

namespace <?= $ns ?>;

class <?= $className ?> extends \yii\base\Module
{
    /**
     * @var Theme name of the module
     *
     */
    public $theme = 'default';
    
    public $controllerNamespace = '<?= $generator->getControllerNamespace() ?>';

    public function init()
    {
        parent::init();
        
        // custom initialization code goes here
        $path = __DIR__ . "/themes/{$this->theme}";
        \Yii::$app->assetManager->publish("$path/static");
        $this->setViewPath("$path/views");
    }
}
