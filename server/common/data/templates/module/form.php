<?php
/* @var $this yii\web\View */
/* @var $form yii\widgets\ActiveForm */
/* @var $generator app\data\templates\module\Generator */

$this->registerJs(<<<JS
    $('#generator-moduleid').keyup(moduleClass);
    $('#generator-template').change(moduleClass);
    function moduleClass() {
        var id = $('#generator-moduleid').val();
        var tplName = $('#generator-template').val();
        if (/^[a-zA-A]\w*$/.test(id)) {
            $('#generator-moduleclass').val(tplName + '\\\\' + id + '\\\\Module');
        } else {
            $('#generator-moduleclass').val('');
        }
    }
JS
, $this::POS_LOAD);

?>
<div class="module-form">
<?php
    echo $form->field($generator, 'moduleID')->hint('This refers to the ID of the module, e.g., <code>admin</code>. And starts with letter only');
    echo $form->field($generator, 'moduleClass')->textInput(['readonly' => 'readonly']);
?>
</div>