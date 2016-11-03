<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace common\data\templates\module;

use Yii;
use yii\gii\CodeFile;
use yii\helpers\StringHelper;
use yii\web\View;

/**
 * This generator will generate the skeleton code needed by a module.
 *
 * @property string $controllerNamespace The controller namespace of the module. This property is read-only.
 * @property boolean $modulePath The directory that contains the module class. This property is read-only.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class Generator extends \yii\gii\generators\module\Generator
{
    
    /**
     * @var array a list of available code templates. The array keys are the template names,
     * and the array values are the corresponding template paths or path aliases.
     */
    private $_templates = [
        'admin' => '@app/data/templates/module/admin',
        'api' => '@app/data/templates/module/api',
    ];
    
    public function init() {
        parent::init();
        
        $this->templates = [];
        foreach ($this->_templates as $i => $template) {
            $this->templates[$i] = Yii::getAlias($template);
        }
    }

    /**
     * @inheritdoc
     */
    public function requiredTemplates()
    {
        return ['module.php', 'controller.php'];
    }
    
    /**
     * Static directories required
     * @return array
     */
    public function staticDirs()
    {
        return ['images', 'js', 'css'];
    }

    /**
     * @inheritdoc
     */
    public function generate()
    {
        $files = [];
        $modulePath = $this->getModulePath();
        $files[] = new CodeFile(
                $modulePath . '/' . StringHelper::basename($this->moduleClass) . '.php', $this->render("module.php")
        );
        $files[] = new CodeFile(
                $modulePath . '/controllers/DefaultController.php', $this->render("controller.php")
        );
        
        switch($this->template) {
            case 'admin':
                $themePath = $modulePath . '/themes/default';
                $staticDirs = $this->staticDirs();
                array_walk($staticDirs, function (&$v, $k, $path) {
                    $filename =  "$path/$v";
                    is_dir($filename) || mkdir($filename, 0444, true );
                }, "$themePath/static");
                
                $files[] = new CodeFile(
                    "$themePath/views/default/index.php", $this->render("view.php")
                );
                $files[] = new CodeFile(
                    "$themePath/views/layouts/main.php", $this->render("layout.php")
                );
                break;
            case 'api':
                break;
        }
        
        return $files;
    }

    /**
     * Generates code using the specified code template and parameters.
     * Note that the code template will be used as a PHP file.
     * @param string $template the code template file. This must be specified as a file path
     * relative to [[templatePath]].
     * @param array $params list of parameters to be passed to the template file.
     * @return string the generated code
     */
    public function render($template, $params = [])
    {
        $view = new View();
        $params['generator'] = $this;

        return $view->renderFile($this->_getViewPath($template), $params, $this);
    }
    
    /**
     * Return template view path
     * @param type $template
     * @return type
     */
    private function _getViewPath($template) 
    {
        return $this->getTemplatePath() . '/' . $template;
    }

}
