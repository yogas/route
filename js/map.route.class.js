/**
* Класс CMapRoute
* Предназначен построения маршрута между двумя и более точками
* на Картах.Яндекс
*
* @author Vladimir Shapovalov
* @email gyogas@gmail.com
* @date 22.09.2017 12:21
*/

function CMapRoute(target) {
    "use strict";
    
    this.$com = $(target);
    this.map = {};
    this.points = {};
    this.route = false;
    this.index = 0;
    this.count = 0;
    this.TID = 0;
    this.$panel = {};
    this.$btn = {};
    this.params = {};
    
    /**
    * Инициализация класса
    * @return void
    */
    this.init = function() {
        this.params = this.$com.data('params');
        
        this.initMap();
        
        if(this.params['editor']) {        
            this.$panel = this.$com.find(".js-panel");
            this.$btn = this.$com.find(".js-save");        

            window.initCaptions = this.initIconCaptions.bind(this);

            // инициализация событий
            this.initEvents();
        } else {
            this.drawRoute();
        }
    };
    
    /**
    * Инициализация Яндекс карты
    * @return void
    */
    this.initMap = function() {
        this.map = new ymaps.Map('js-map', {
            center: this.$com.data("coord"),
            zoom: 7,
            controls: []
        }, {});
        
        // скрыть прелоадера
        this.$com.find("#js-map").removeClass("loading");
    };
    
    /**
    * Инициализация событий 
    * @return void
    */
    this.initEvents = function() {
        this.map.events.add('click', this.onMapClick.bind(this));
        window.CMapRoute__onPointDelete = this.onPointDelete.bind(this);
        
        this.$btn.on('click', this.onSaveRoute.bind(this));
    };
    
    /**
    * Получение координат точек маршрута
    * @return array
    */
    this.getPointsCoord = function() {
        var points = [];
        // если обычное представление карты
        if(!this.params['editor']) { 
            for(var key in this.params.points) {
                points.push(this.params.points[key]);
            }
            return points;
        }
        
        // если режим создания маршрута
        for(var key in this.points) {
            points.push(this.points[key].geometry.getCoordinates());
        }  
        
        return points;
    };
    
    /**
    * Собитие при сохранении маршрута
    * @return boolean
    */
    this.onSaveRoute = function(e) {
        if(this.$btn.hasClass('loading')) {
            return false;
        }  
        this.$btn.addClass('loading');
        
        var data = {
            'request': 'save',
            'points': this.getPointsCoord()
        };
        
        $.post('ajax.php', data, (function(json){
            console.log(json);
            if(json.type === 'ok') {
                document.location = "route.php?id=" + json.route_id;
            }
            this.$btn.removeClass('loading');
        }).bind(this), 'json');
        
        return false;
    };
    
    /**
    * Удаление точки 
    * @return void
    */
    this.onPointDelete = function(index) {
        this.map.geoObjects.remove(this.points[index]);
        delete this.points[index];
        this.count--;
        
        this.initIconCaptions();
        this.drawRoute();
    };
    
    /**
    * Инициализация номеров точек
    * @return void
    */
    this.initIconCaptions = function() {
        var index = 1;
        for(var key in this.points) {
            this.points[key].properties.singleSet('iconCaption', index);
            
            if(index > 1 && index < this.count) {
                this.points[key].options.set('preset','islands#greenCircleDotIconWithCaption');
            }
            if(index === 1) {
                this.points[key].options.set('preset','islands#redCircleDotIconWithCaption');
            }
            if(index === this.count) {
                this.points[key].options.set('preset','islands#blueCircleDotIconWithCaption');
            }
            
            index++;
        }  
    };
    
    /**
    * Добавление точки на карту
    * @return void
    */
    this.addPoint = function(coord) {
        this.points[this.index] = new ymaps.Placemark(coord, {
            balloonContentBody: [
                '<a class="link-dotted js-point-delete" onclick="CMapRoute__onPointDelete('+this.index+');">Удалить точку</a>'
            ].join(''),
            iconCaption: (this.index+1)
        }, {
            preset: 'islands#blueCircleDotIconWithCaption',
            draggable: true
        });
        
        window.point = this.points[this.index];
        this.points[this.index].events.add('dragend', this.onPointDragEnd.bind(this)); // событие при перемещении точки

        this.map.geoObjects.add(this.points[this.index]); // добавить точку на карту
        
        this.index++;
        this.count++;
        
        this.initIconCaptions();
    };
    
    /**
    * Задержка перед построением маршрута
    * @return void
    */
    this.waitAndDrawRoute = function() {
        clearTimeout(this.TID);
        this.TID = setTimeout((function(){
            this.drawRoute();
        }).bind(this), 800);
    };
    
    /**
    * Событие при завершении перемещения метки
    * @return void
    */
    this.onPointDragEnd = function(e) {
        // если было несколько перемещений
        // то рисовать только после последнего
        this.waitAndDrawRoute();  
    };
    
    /**
    * Событие при щелчке левой кнопкой мыши по карте
    * @return void
    */
    this.onMapClick = function(e) {
        this.addPoint(e.get('coords'));    
        
        // если одновременно добавилось несколько точек
        // то рисовать только после добавления последней
        this.waitAndDrawRoute();
    };    
    
    /**
    * Показать кнопку сохранения
    * @return void
    */
    this.showPanel = function() {
        this.$panel.addClass('show');  
    };
    
    /**
    * Скрыть кнопку сохранения
    * @return void
    */
    this.hidePanel = function() {
        this.$panel.removeClass('show');  
    };
    
    /**
    * Событие при построении маршрута
    * @return void
    */
    this.onRouteUpdate = function(e) {
        if(this.params.editor) {
            this.$btn.removeClass('loading');
        }
    };
    
    /**
    * Построение маршрута между точками
    * @return void
    */
    this.drawRoute = function() {        
        if(this.route) {
            this.map.geoObjects.remove(this.route);
        }
        
        if(this.params.editor) {
            if(this.count<=1) {
                this.hidePanel();
                return false;
            } 

            this.$btn.addClass('loading');
            this.showPanel();
        }
        
        this.route = new ymaps.multiRouter.MultiRoute({
            // Описание опорных точек мультимаршрута.
            referencePoints: this.getPointsCoord(),
            // Параметры маршрутизации.
            params: {
                // Ограничение на максимальное количество маршрутов, возвращаемое маршрутизатором.
                results: 3
            }
        }, {
            // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
            boundsAutoApply: this.params.editor ? false : true
        });
        
        this.route.events.add("update", this.onRouteUpdate.bind(this));
        
        this.map.geoObjects.add(this.route);
    };
    
    // Инициализация карты при заргрузки API Яндекс.Карт
    ymaps.ready(this.init.bind(this));
}
