<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" type="text/css" href="css/styles.css">
<title>Построение маршрута между точками</title>
</head>

<body>
<div class="js-com" data-coord="[55.750625, 37.626]" data-params='<?=json_encode(array('editor'=>true)) ?>'>
    <div class="panel js-panel">
        <div class="left"><div class="messages js-message"></div></div>
        <div class="right">
            <a class="button js-save"><span>Сохранить&nbsp;маршрут</span></a>
        </div>        
    </div>
    <div class="map loading" id="js-map"></div>
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
