<?php
/**
* Класс CMapRoute
* Предназначен сохранения маршрута в базу данных и вывода из база данных
*
* @author Vladimir Shapovalov
* @email gyogas@gmail.com
* @date 22.09.2017 17:31
*/

class CMapRoute {
    
    var $db;
    
    /**
    * Конструктор
    * @return void
    */
    function __construct() {
        $this->db = mysqli_connect("localhost","root", "root", "route");
    }
    
    /**
    * Обработка событий
    * @return void
    */
    function listenEvents() {
        if($_POST['request'] == 'save') {
            $this->saveRoute();
        }
        
        die(json_encode($_REQUEST));
    }
    
    /**
    * Получить id последнего маршрута
    * @return integer
    */
    public function getLastRoute() {
        $q = "SELECT id FROM route ORDER BY id DESC LIMIT 1";
        $result = $this->db->query($q);        
        $a = $result->fetch_array();
        
        return $a['id'];
    }
    
    /**
    * Создаёт новый маршрут в базе данных
    * @return integer
    */
    public function createRoute() {
        $q = "INSERT INTO `route` (`id`, `name`) VALUES ('0', 'route name');";
        $result = $this->db->query($q);
        
        return $this->getLastRoute();
    }
    
    /**
    * Сохранение маршрута в базу данных
    * @return void
    */
    public function saveRoute() {
        $route_id = $this->createRoute();

        foreach($_POST['points'] as $point) {
            $q = "INSERT INTO `points` (`id`, `route_id`, `lat`, `lon`) VALUES ('0', '$route_id', '$point[0]', '$point[1]');";
            $result = $this->db->query($q); 
        }
        
        die(json_encode(array(
            'type' => 'ok',
            'route_id' => $route_id,
        )));
    }
    
    /**
    * Геокодирование координат в адрес
    * @return string
    */
    public function getAddrByCoord($lon, $lat) {
        $str = file_get_contents('http://geocode-maps.yandex.ru/1.x/?geocode='.implode(",",array($lon,$lat)).'&results=1');
        $xml = simplexml_load_string($str);
        
        $addr = (string)$xml->GeoObjectCollection->featureMember->GeoObject->metaDataProperty->GeocoderMetaData->text;
        
        return $addr;
    }
    
    /**
    * Возвращает маршрут из базы
    * @params $id
    * @return array
    */
    public function getRoute($id) {
        $q = "SELECT * FROM `points` WHERE `route_id`='$id' ORDER BY id ASC";
        $result = $this->db->query($q);
        
        $arPoints = array();
        while($ar = $result->fetch_array()) {
            $point = array(
                'addr' => $this->getAddrByCoord($ar['lon'], $ar['lat']),
                'coord' => array($ar['lat'],$ar['lon']),
            );
            
            $arPoints[] = $point;
        }
        
        return $arPoints;
    }
}
