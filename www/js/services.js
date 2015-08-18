angular.module('starter.services', ['ngCordova'])
    .factory('PPConsole', function($cordovaToast) {
        return {
            err: function(obj) {
                try {
                    $cordovaToast.show("[PPError:]" + obj.message || obj || "err occur!", 'long', 'center');
                } catch (e) {
                    console.log("[PPError:]");
                    console.log(obj);
                }

            },
            debug: function(obj) {
                // try {
                //     $cordovaToast.show("[PPDebug:]" + obj.message || obj || "err occur!", 'long', 'bottom');
                // } catch (e) {
                //     console.log("[PPDebug:]");
                //     console.log(obj);
                // }
            },
            show: function(obj) {
                try {
                    $cordovaToast.show(obj.message || obj || "err occur!", 'long', 'center');
                } catch (e) {
                    console.log("[PPShow:]");
                    console.log(obj);
                }
            }
        };
    })
    .factory("BaiduNearByLocationService", function($http, $q) {
        return {
            getLocations: function(keyword, lng, lat) {
                var dfd = $q.defer()

                var ak = "F9266a6c6607e33fb7c3d8da0637ce0b";
                var convertUrl = "http://api.map.baidu.com/geoconv/v1/?callback=JSON_CALLBACK&";
                var convertData = "ak=" + ak + "&coords=" + lng + "," + lat;
                var getPlaceUrl = "http://api.map.baidu.com/place/v2/search?callback=JSON_CALLBACK&";
                var getPlaceDate = "ak=" + ak + "&output=json&radius=2000&scope=1&filter=sort_name:distance&query=" + keyword;

                $http.jsonp(convertUrl + convertData).then(
                    function(r) {
                        var tmpLocation = "&location=" + r.data.result[0].y + "," + r.data.result[0].x;
                        getPlaceDate = getPlaceDate + tmpLocation;
                        return $http.jsonp(getPlaceUrl + getPlaceDate);
                    }
                ).then(
                    function(r) {
                        //查询结果
                        dfd.resolve(r.data.results.map(
                            function(item) {
                                return {
                                    uid: item.uid,
                                    name: item.name,
                                    address: item.address
                                };
                            }
                        ));
                    },
                    function(e) {
                        PPConsole.err(e);
                        dfd.reject(e);
                    }
                );

                return dfd.promise;
            }
        }
    })
    .factory("OptionService", function($rootScope, $ionicPopup, BaiduNearByLocationService) {
        return {
            initOption: function(object, options, itemName, title) {
                var thisScope = $rootScope.$new(true);
                thisScope.data = {
                    optionVal: object[itemName]
                };

                var tmpPopup = $ionicPopup.show({
                    templateUrl: 'templates/popUpOption.html',
                    title: title || '请选择',
                    scope: thisScope
                });

                thisScope.options = options;
                thisScope.close = function() {
                    object[itemName] = thisScope.data.optionVal;
                    tmpPopup.close();
                };
            },
            initOptionWithInput: function(object, itemName, title, curLocation) {
                var thisScope = $rootScope.$new(true);
                thisScope.data = {};
                var tmpPopup = $ionicPopup.show({
                    templateUrl: 'templates/popUpOptionWithInput.html',
                    title: title || '请选择',
                    scope: thisScope,
                    buttons: [{
                        text: '确定',
                        type: 'button-positive',
                        onTap: function() {
                            if (thisScope.data.customVal) {
                                object[itemName] = {
                                    uid: 'custom',
                                    name: thisScope.data.customVal
                                };
                            } else {
                                object[itemName] = null;
                            }
                            return true;
                        }
                    }, {
                        text: '取消',
                        type: 'button-stable',
                        onTap: function() {
                            return false;
                        }
                    }]
                });

                thisScope.close = function() {
                    object[itemName] = thisScope.data.optionVal;
                    tmpPopup.close();
                };

                thisScope.keywordSearch = function(keyword) {
                    BaiduNearByLocationService.getLocations(keyword, curLocation[0], curLocation[1]).then(function(options) {
                        thisScope.options = options;
                    }, function(e) {
                        PPConsole.err(e);
                        this.Scope.options = [];
                    });
                }
            }
        }
    });