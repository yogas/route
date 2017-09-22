<? include "classes/map.route.class.php"; ?>
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="css/styles.css">
<title>Маршрут #<?=$_GET['id']?></title>
</head>

<body>
<?
    $params = array('editor'=>false);
    
    $obj = new CMapRoute();
    $arRoute = $obj->getRoute($_GET['id']);
    $arAddrs = array();
    foreach($arRoute as $arItem) {
        $arAddrs[] = '<span>'.$arItem['addr'].'</span>';
        $params['points'][] = $arItem['coord'];
    }
?>
<div class="container js-com" data-coord="[55.750625, 37.626]" data-params='<?=json_encode($params) ?>'>
    <div class="back-link"><a href="index.php">&larr; <span>Создать маршрут</span></a></div>
   
    <div class="map loading route" id="js-map"></div>
    
    <div class="points">
        <?=implode('<span class="arr">&rarr;</span>', $arAddrs); ?>
    </div>
</div>

<script type="text/javascript" src="js/libs/jquery-1.10.2.js"></script>
<script src="//api-maps.yandex.ru/2.1/?lang=ru_RU" type="text/javascript"></script>
<script type="text/javascript" src="js/map.route.class.js"></script>
<script type="text/javascript">
    $(function(){
       new CMapRoute(".js-com"); 
    });
</script>
</body>
</html>
