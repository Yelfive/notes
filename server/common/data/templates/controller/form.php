<?php
/* @var $this yii\web\View */
/* @var $form yii\widgets\ActiveForm */
/* @var $generator yii\gii\generators\controller\Generator */

$pattern = '/^(\w+)\\\\controllers\\\\(\w+)Controller$/';
$this->registerJs(<<<JS
    $('#generator-controllerclass').keyup(setViewPath).keyup();
    function setViewPath() {
        var cc = $('#generator-controllerclass').val();
        var action = $('#generator-actions').val();
        var match = cc.match($pattern);
        // var match = cc.match(/^(\\w+)\\\\(\w+)\\\\controllers\\\\(\w+)Controller$/);
        if (match) {
            module = match[1];
            controller = match[2];
            if (module == 'api') {
                $('#generator-viewpath').parent().slideUp();
            } else {
                $('#generator-viewpath').parent().slideDown();
            }
            if (module && controller) {
                var val = '@' + module + '/views/' + controller;
                 $('#generator-viewpath').val(val.toLowerCase());
                $('#generator-baseclass').val(module + '\\\\components\\\\Controller');
            }
        }
    }
    String.prototype.ucfirst = function(){
        var m = this.match(/^\w/);
        return this.replace(/^\w/, m[0].toUpperCase());
    };
JS
, $this::POS_LOAD);

echo $form->field($generator, 'controllerClass');
echo $form->field($generator, 'actions');
echo $form->field($generator, 'viewPath');
echo $form->field($generator, 'baseClass')->textInput(['readonly' => 'readonly']);