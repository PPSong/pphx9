angular.module('starter.controllers', ['angularMoment', 'timer'])
    .controller('starterCtrl', function($scope, $ionicLoading, PPConsole) {
        //var serverUrl = "hx9t.meteor.com";
        var serverUrl = "192.168.1.9:3000";
        $scope.asteroid = new Asteroid(serverUrl);
        $scope.online = false;

        // $scope.asteroid.ddp.on("error", function(e) {
        //     PPConsole.debug("error");
        // });
        // $scope.asteroid.ddp.on("failed", function(e) {
        //     PPConsole.debug("failed");
        // });
        $scope.asteroid.ddp.on("socket_close", function(e) {
            $scope.online = false;
            $scope.$apply();
            PPConsole.debug("socket_close");
            PPConsole.debug($scope.asteroid.ddp.readyState);
        });
        $scope.asteroid.ddp.on("socket_error", function(e) {
            //$scope.online = false;
            //$scope.$apply();
            PPConsole.debug("socket_error");
            PPConsole.debug($scope.asteroid.ddp.readyState);
        });
        // $scope.asteroid.ddp.on("added", function(e) {
        //     PPConsole.debug("added");
        // });
        // $scope.asteroid.ddp.on("changed", function(e) {
        //     PPConsole.debug("changed");
        // });
        // $scope.asteroid.ddp.on("removed", function(e) {
        //     PPConsole.debug("removed");
        // });

        $scope.asteroid.on("connected", function(e) {
            PPConsole.debug("connected");
            PPConsole.debug($scope.asteroid.ddp.readyState);
        });
        $scope.asteroid.on("login", function(curUserId) {
            $scope.online = true;
            $scope.$apply();
            PPConsole.debug("login");
            PPConsole.debug($scope.asteroid.ddp.readyState);
        });
        $scope.asteroid.on("logout", function(e) {
            PPConsole.debug("logout");
            PPConsole.debug($scope.asteroid.ddp.readyState);
        });

        $scope.asteroid.subscribe("meets");
        //$scope.asteroid.subscribe("otherActivities");
        //$scope.asteroid.subscribe("myActivities");
        $scope.asteroid.subscribe("messages");
        $scope.asteroid.subscribe("unreadMessageCount");
        $scope.asteroid.subscribe("unreadCount");
        $scope.asteroid.subscribe("friends");

        $scope.users = $scope.asteroid.getCollection("users");
        $scope.usersRQ = $scope.users.reactiveQuery({});
        $scope.usersRQ.on("change", function() {
            $scope.$apply();
            PPConsole.debug("users change");
        });

        $scope.meets = $scope.asteroid.getCollection("meets");
        $scope.meetsRQ = $scope.meets.reactiveQuery({});
        $scope.meetsRQ.on("change", function() {
            $scope.$apply();
            PPConsole.debug("meets change");
        });

        $scope.unreadMessageCounts = $scope.asteroid.getCollection("unreadMessageCounts");
        $scope.unreadMessageCountsRQ = $scope.unreadMessageCounts.reactiveQuery({});
        $scope.unreadMessageCountsRQ.on("change", function() {
            $scope.$apply();
            console.log($scope.unreadMessageCountsRQ.result);
            PPConsole.debug("unreadMessageCounts change");
        });

        $scope.friends = $scope.asteroid.getCollection("friends");
        $scope.friendsRQ = $scope.friends.reactiveQuery({});
        $scope.friendsRQ.on("change", function() {
            $scope.$apply();
            PPConsole.debug("message change");
        });

        // $scope.activities = $scope.asteroid.getCollection("activities");
        // $scope.otherActivitiesRQ = $scope.activities.reactiveQuery(function(item) {
        //     if ($scope.usersRQ.result[0]) {
        //         if (item.persons) {
        //             return item.persons.indexOf($scope.usersRQ.result[0]._id) < 0;
        //         } else {
        //             return true;
        //         }
        //     } else {
        //         return false;
        //     }
        // });
        // $scope.otherActivitiesRQ.on("change", function() {
        //     $scope.$apply();
        //     PPConsole.debug("otherActivities change");
        // });
        // $scope.myActivitiesRQ = $scope.activities.reactiveQuery({
        //     persons: $scope.usersRQ.result[0] ? $scope.usersRQ.result[0]._id : 'empty',
        // });
        // $scope.myActivitiesRQ.on("change", function() {
        //     $scope.$apply();
        //     PPConsole.debug("myActivities change");
        // });
    })
    .controller('LoginCtrl', function($scope, $state, PPConsole) {
        $scope.loginUser = {};

        $scope.login = function() {
            $scope.asteroid.loginWithPassword($scope.loginUser.username, $scope.loginUser.password).then(function(result) {
                PPConsole.debug(result);
                $state.go("tab.meet");
                $scope.loginUser.username = null;
                $scope.loginUser.password = null;
            }, function(err) {
                PPConsole.err(err);
            });
        };
    })
    .controller('RegisterCtrl', function($scope, $state, $ionicLoading, OptionService, PPConsole) {
        $scope.registerUser = {};

        $scope.register = function() {
            $ionicLoading.show({
                template: '处理中...'
            });

            $scope.asteroid.createUser($scope.registerUser.username, $scope.registerUser.password, {
                sex: $scope.registerUser.sex,
                nickname: $scope.registerUser.nickname
            }).then(function() {
                $state.go("tab.meet");
                $scope.registerUser.username = null;
                $scope.registerUser.password = null;
                $scope.registerUser.sex = null;
                $scope.registerUser.nickname = null;
            }, function(err) {
                PPConsole.err(err);
            }).finally(function() {
                $ionicLoading.hide();
            });
        }

        // $scope.chooseOptionSex = function() {
        //     OptionService.initOption($scope.registerUser, ['男', '女'], 'sex', '性别');
        // };
        $scope.chooseSex = function(sex) {
            $scope.registerUser.sex = sex;
        }
    })
    .controller('TabsCtrl', function($scope, PPConsole) {
        $scope.messages = $scope.asteroid.getCollection("messages");
        $scope.allMessagesRQ = $scope.messages.reactiveQuery({});

        $scope.allMessagesRQ.on("change", function() {
            PPConsole.debug("allMessagesRQ change");
            $scope.$apply();
        });

        $scope.targets = {
            data: null
        };

        $scope.targetSpecialInfo = {
            data: null
        };

        $scope.curMeet = {
            data: null
        }

        $scope.curTarget = {
            data: null
        }
    })
    .controller('MeetCtrl', function($scope, $state, $ionicModal, $ionicLoading, $ionicPopup, $cordovaCamera, $cordovaGeolocation, OptionService, BaiduNearByLocationService, PPConsole) {
        $ionicModal.fromTemplateUrl('templates/modalSpecialInfo.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalSpecialInfo = modal;
        });

        $ionicModal.fromTemplateUrl('templates/modalCreateMeet.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalCreateMeet = modal;
        });

        $ionicModal.fromTemplateUrl('templates/modalWaitForReply.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalWaitForReply = modal;
        });

        $ionicModal.fromTemplateUrl('templates/modalReplyMeet.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalReplyMeet = modal;
        });

        $scope.chooseOptionPlace = function(object) {
            OptionService.initOptionWithInput(object, 'place', '场所', $scope.usersRQ.result[0].profile.lastLocation);
        };

        $scope.chooseOptionSex = function(object, needReset) {
            OptionService.initOption(object, ['男', '女'], 'sex', '性别');
            object.hair = null;
            object.clothesType = null;
            object.clothesColor = null;
            object.clothesStyle = null;
        };

        $scope.chooseOptionHair = function(object, sex) {
            if (sex == "男") {
                OptionService.initOption(object, ['(男)竖起来(包括光头)', '(男)躺下', '(男)戴帽子'], 'hair', '发型');
            } else {
                OptionService.initOption(object, ['(女)辫子/盘发', '(女)短发(齐肩,不过肩)', '(女)长发(过肩)', '(女)戴帽子'], 'hair', '发型');
            }
        };

        $scope.chooseOptionGlasses = function(object) {
            OptionService.initOption(object, ['有', '无'], 'glasses', '眼镜');
        };

        $scope.chooseOptionClothesType = function(object, sex) {
            if (sex == "男") {
                OptionService.initOption(object, ['(男)风衣/大衣', '(男)西装/夹克/套装', '(男)运动外套/卫衣', '(男)T恤长袖', '(男)T恤短袖', '(男)马甲/背心', '(男)长袖衬衫', '(男)短袖衬衫', '(男)毛衣/羊毛绒/线衫/针织'], 'clothesType', '衣服类型');
            } else {
                OptionService.initOption(object, ['(女)风衣/大衣', '(女)西装/夹克/套装', '(女)运动外套/卫衣', '(女)T恤长袖', '(女)T恤短袖', '(女)马甲/背心', '(女)长袖衬衫', '(女)短袖衬衫', '(女)毛衣/羊毛绒/线衫/针织', '(女)连体裙'], 'clothesType', '衣服类型');
            }
        };

        $scope.chooseOptionClothesColor = function(object, sex) {
            if (sex == "男") {
                OptionService.initOption(object, ['(男)红/紫/粉', '(男)黄', '(男)蓝/绿', '(男)白', '(男)黑', '(男)灰', '(男)彩色,且难以判断主体颜色'], 'clothesColor', '衣服颜色');
            } else {
                OptionService.initOption(object, ['(女)红/紫/粉', '(女)黄', '(女)蓝/绿', '(女)白', '(女)黑', '(女)灰', '(女)彩色,且难以判断主体颜色'], 'clothesColor', '衣服颜色');
            }
        };

        $scope.chooseOptionClothesStyle = function(object, sex) {
            if (sex == "男") {
                OptionService.initOption(object, ['(男)纯色', '(男)线条,格子,色块', '(男)图案(抽象,卡通,画等有具体内容)'], 'clothesStyle', '衣服花纹');
            } else {
                OptionService.initOption(object, ['(女)纯色', '(女)线条,格子,色块', '(女)图案(抽象,卡通,画等有具体内容)'], 'clothesStyle', '衣服花纹');
            }
        };

        $scope.popupBigPic = function() {
            var alertPopup = $ionicPopup.alert({
                //title: 'Don\'t eat that!',
                template: ' <img class="pp-special-pic-big" src="' + ($scope.editingSpecialInfo.specialPic) + '">'
            });
        };

        $scope.getImg = function(item) {
            if (item.createrUserId === $scope.usersRQ.result[0]._id) {
                if (item.status === "待确认") {
                    return "img/tbd.png";
                } else if (item.status === "失败") {
                    return item.targetSpecialPic || "img/tbd.png";
                } else {
                    return item.targetSpecialPic;
                }
            } else {
                if (item.status === "待回复") {
                    return "img/needToReply.png";
                } else if (item.status === "失败") {
                    return "img/needToReply.png";
                } else {
                    return item.createrSpecialPic;
                }
            }
        };

        $scope.getCustomStatus = function(item) {
            if (item.status == '待确认') {
                return "待确认";
            } else if (item.status == '待回复') {
                if (item.createrUserId == $scope.usersRQ.result[0]._id) {
                    return "待对方回复";
                } else {
                    return "待回复";
                }
            } else if (item.status == '成功') {
                return "成功";
            } else if (item.status == '失败') {
                return "失败";
            }
        };

        $scope.createMeet = function() {
            $ionicLoading.show({
                template: '处理中...'
            });

            //上传当前地理位置和specialInfo
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: true
            };

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;

                var tmpPromiseResult = $scope.asteroid.call("sendMeetCheck", [long, lat]);
                tmpPromiseResult.result.then(function(r) {
                    PPConsole.debug("rr");
                    PPConsole.debug(r);
                    $scope.targetSpecialInfo.data = {};
                    $scope.targetSpecialInfo.data.sex = ($scope.usersRQ.result[0].profile.sex === '男' ? '女' : '男');
                    $scope.modalCreateMeet.show();
                }, function(e) {
                    PPConsole.debug("re");
                    PPConsole.err(e);
                    if (e.error == 'Error: [请更新特征信息!](500)') {
                        $scope.editSpecialInfo();
                    }
                }).finally(function() {
                    $ionicLoading.hide();
                });
                tmpPromiseResult.updated.then(function(r) {
                    PPConsole.debug("ur");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("ue");
                    PPConsole.err(e);
                });
            }, function(err) {
                PPConsole.err(err);
                $ionicLoading.hide();
            });


            // $ionicLoading.show({
            //     template: '处理中...'
            // });
            // var tmpPromiseResult = $scope.asteroid.call("sendMeetCheck");
            // tmpPromiseResult.result.then(function(r) {
            //     PPConsole.debug("rr");
            //     PPConsole.debug(r);
            //     $scope.targetSpecialInfo.data = {};
            //     $scope.targetSpecialInfo.data.sex = ($scope.usersRQ.result[0].profile.sex === '男' ? '女' : '男');
            //     $scope.modalCreateMeet.show();

            // }, function(e) {
            //     PPConsole.debug("re");
            //     PPConsole.err(e);
            //     if (e.error == 'Error: [请更新特征信息!](500)') {
            //         $scope.editSpecialInfo();
            //     }
            // }).finally(function() {
            //     $ionicLoading.hide();
            // });
            // tmpPromiseResult.updated.then(function(r) {
            //     PPConsole.debug("ur");
            //     PPConsole.debug(r)
            // }, function(e) {
            //     PPConsole.debug("ue");
            //     PPConsole.err(e);
            // });
        };

        $scope.searchCreateTarget = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("createMeetSearchTarget", $scope.targetSpecialInfo.data);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $scope.targets.data = r;
                $state.go('tab.meet.searchSpecialPic');
                $scope.modalCreateMeet.hide();
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        };

        $scope.closeWaitForReply = function() {
            $scope.modalWaitForReply.hide();
        };

        $scope.clickMeet = function(item) {
            $scope.curMeet.data = item;
            if (item.createrUserId === $scope.usersRQ.result[0]._id) {
                if (item.status === "待确认") {
                    $scope.targetSpecialInfo.data = item.specialInfo;
                    $ionicLoading.show({
                        template: '处理中...'
                    });
                    var tmpPromiseResult = $scope.asteroid.call("createMeetSearchTarget", $scope.targetSpecialInfo.data);
                    tmpPromiseResult.result.then(function(r) {
                        PPConsole.debug("rr");
                        PPConsole.debug(r);
                        $scope.targets.data = r;
                        $state.go('tab.meet.searchSpecialPicConfirm');
                        $scope.modalCreateMeet.hide();
                    }, function(e) {
                        PPConsole.debug("re");
                        PPConsole.err(e);
                    }).finally(function() {
                        $ionicLoading.hide();
                    });
                    tmpPromiseResult.updated.then(function(r) {
                        PPConsole.debug("ur");
                        PPConsole.debug(r)
                    }, function(e) {
                        PPConsole.debug("ue");
                        PPConsole.err(e);
                    });
                } else if (item.status === "待回复") {
                    $scope.modalWaitForReply.show();
                }
            } else if (item.targetUserId === $scope.usersRQ.result[0]._id) {
                if (item.status === "待回复") {
                    $scope.targetSpecialInfo.data = {
                        sex: $scope.usersRQ.result[0].profile.sex === '男' ? '女' : '男'
                    };
                    $scope.modalReplyMeet.show();
                }
            }
        }

        $scope.searchReplyTarget = function() {
            if (!(
                    $scope.targetSpecialInfo.data.sex && $scope.targetSpecialInfo.data.clothesColor && $scope.targetSpecialInfo.data.clothesStyle && $scope.targetSpecialInfo.data.clothesType && $scope.targetSpecialInfo.data.glasses && $scope.targetSpecialInfo.data.hair
                )) {
                PPConsole.show('请把条件填写完整!');
                return;
            }

            $ionicLoading.show({
                template: '努力搜索中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("replyMeetSearchTarget", $scope.curMeet.data._id, $scope.targetSpecialInfo.data);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                if (r == '特征信息不匹配') {
                    //特征信息不匹配
                    PPConsole.show(r);
                } else {
                    $scope.targets.data = r;
                    $state.go('tab.meet.searchSpecialPicReply');
                    $scope.modalReplyMeet.hide();
                }
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });

        };

        $scope.closeCreateMeetModal = function() {
            $scope.modalCreateMeet.hide();
        };

        $scope.closeReplyMeetModal = function() {
            $scope.modalReplyMeet.hide();
        };

        $scope.editSpecialInfo = function() {
            if ($scope.usersRQ.result[0].profile.specialInfo) {
                $scope.editingSpecialInfo = {
                    hair: $scope.usersRQ.result[0].profile.specialInfo.hair,
                    glasses: $scope.usersRQ.result[0].profile.specialInfo.glasses,
                    clothesType: $scope.usersRQ.result[0].profile.specialInfo.clothesType,
                    clothesColor: $scope.usersRQ.result[0].profile.specialInfo.clothesColor,
                    clothesStyle: $scope.usersRQ.result[0].profile.specialInfo.clothesStyle,
                    specialPic: $scope.usersRQ.result[0].profile.specialInfo.specialPic
                }
            } else {
                $scope.editingSpecialInfo = {};
            }
            $scope.modalSpecialInfo.show();
        };

        $scope.saveSpecialInfo = function() {
            $ionicLoading.show({
                template: '处理中...'
            });

            //上传当前地理位置和specialInfo
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: true
            };

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;

                var tmpPromiseResult = $scope.asteroid.call("saveSpecialInfoAndPosition", $scope.editingSpecialInfo, [long, lat]);
                tmpPromiseResult.result.then(function(r) {
                    PPConsole.debug("rr");
                    PPConsole.debug(r)
                    $scope.modalSpecialInfo.hide();
                }, function(e) {
                    PPConsole.debug("re");
                    PPConsole.err(e);
                }).finally(function() {
                    $ionicLoading.hide();
                });
                tmpPromiseResult.updated.then(function(r) {
                    PPConsole.debug("ur");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("ue");
                    PPConsole.err(e);
                });
            }, function(err) {
                PPConsole.err(err);
                $ionicLoading.hide();
            });
        }

        $scope.takePhoto = function() {
            if (typeof Camera == "undefined") { //不是手机, 是浏览器, 测试用
                $scope.editingSpecialInfo.specialPic = "data:image/png;base64,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";
            } else {

                try {
                    var options = {
                        quality: 30,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: true,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 100,
                        targetHeight: 100,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };

                    $cordovaCamera.getPicture(options)
                        .then(function(imageData) {
                            $scope.editingSpecialInfo.specialPic = "data:image/jpeg;base64," + imageData;
                        }, function(err) {
                            PPConsole.err(err);
                        });
                } catch (err) {
                    PPConsole.err(err);
                }
            }
        }
    })
    .controller('SearchSpecialPicCtrl', function($scope, $ionicModal, $state, $ionicLoading, PPConsole) {
        $ionicModal.fromTemplateUrl('templates/modalBigSpecialPic.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalBigSpecialPic = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalCreateMeetSuccess.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalCreateMeetSuccess = modal;
        });

        $scope.checkBigSpecialPic = function(item) {
            $scope.curTarget.data = item;
            $scope.modalBigSpecialPic.show();
        };

        $scope.closeBigSpecialPic = function() {
            $scope.modalBigSpecialPic.hide();
        }

        $scope.selectSuccess = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("createMeetChooseTarget", $scope.curTarget.data._id, $scope.targetSpecialInfo.data);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $state.go("tab.meet");
                $scope.modalBigSpecialPic.hide();
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }

        $scope.goToMeetTab = function() {
            $state.go("tab.meet");
        }

        $scope.createNeedConfirm = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("createNeedConfirm", $scope.targetSpecialInfo.data);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $state.go("tab.meet");
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }
    })
    .controller('SearchSpecialPicConfirmCtrl', function($scope, $ionicModal, $state, $ionicLoading, PPConsole) {
        $ionicModal.fromTemplateUrl('templates/modalBigSpecialPic.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalBigSpecialPic = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalCreateMeetSuccess.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalCreateMeetSuccess = modal;
        });

        $scope.checkBigSpecialPic = function(item) {
            $scope.curTarget.data = item;
            $scope.modalBigSpecialPic.show();
        };

        $scope.closeBigSpecialPic = function() {
            $scope.modalBigSpecialPic.hide();
        }

        $scope.selectSuccess = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("confirmMeetChooseTarget", $scope.curMeet.data._id, $scope.curTarget.data._id);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $scope.modalBigSpecialPic.hide();
                $state.go("tab.meet");
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }

        $scope.noTarget = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("clearNewMatchCount", $scope.curMeet.data._id);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $state.go("tab.meet");
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });

        }
    })
    .controller('SearchSpecialPicReplyCtrl', function($scope, $ionicModal, $state, $ionicLoading, PPConsole) {
        $ionicModal.fromTemplateUrl('templates/modalBigSpecialPic.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalBigSpecialPic = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalCreateMeetSuccess.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalCreateMeetSuccess = modal;
        });

        $scope.checkBigSpecialPic = function(item) {
            $scope.curTarget.data = item;
            $scope.modalBigSpecialPic.show();
        };

        $scope.closeBigSpecialPic = function() {
            $scope.modalBigSpecialPic.hide();
        }

        $scope.selectSuccess = function() {
            if ($scope.curTarget.data.userId == 'fake') {
                $ionicLoading.show({
                    template: '处理中...'
                });
                var tmpPromiseResult = $scope.asteroid.call("selectFake");
                tmpPromiseResult.result.then(function(r) {
                    PPConsole.debug("rr");
                    PPConsole.debug(r);
                    PPConsole.show('没猜对,请仔细选择图片!');
                    $scope.modalBigSpecialPic.hide();
                    $state.go("tab.meet");
                }, function(e) {
                    PPConsole.debug("re");
                    PPConsole.err(e);
                }).finally(function() {
                    $ionicLoading.hide();
                });
                tmpPromiseResult.updated.then(function(r) {
                    PPConsole.debug("ur");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("ue");
                    PPConsole.err(e);
                });
            } else {
                $ionicLoading.show({
                    template: '处理中...'
                });
                var tmpPromiseResult = $scope.asteroid.call("replyMeetClickTarget", $scope.curMeet.data._id, $scope.curTarget.data.userId);
                tmpPromiseResult.result.then(function(r) {
                    PPConsole.debug("rr");
                    PPConsole.debug(r);
                    PPConsole.show('恭喜你!已加入好友列表,赶紧行动吧!');
                    $scope.modalBigSpecialPic.hide();
                    $state.go("tab.meet");
                }, function(e) {
                    PPConsole.debug("re");
                    PPConsole.err(e);
                }).finally(function() {
                    $ionicLoading.hide();
                });
                tmpPromiseResult.updated.then(function(r) {
                    PPConsole.debug("ur");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("ue");
                    PPConsole.err(e);
                });
            }
        }

        $scope.noTarget = function() {
            $state.go("tab.meet");
        }
    })
    .controller('ActivityCtrl', function($scope, $state, $ionicModal, $ionicLoading, PPConsole) {
        $scope.curFilter = '活动广场';

        $ionicModal.fromTemplateUrl('templates/modalJoinActivity.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $scope.modalJoinActivity = modal;
        });

        $scope.chooseFilter = function(filterString) {
            $scope.curFilter = filterString;
        }

        $scope.joinActivity = function(item) {
            $scope.curActivity = item;
            $scope.modalJoinActivity.show();
        }

        $scope.cancelJoinActivity = function() {
            $scope.modalJoinActivity.hide();
        }

        $scope.chooseMark = function(mark) {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("chooseMark", $scope.curActivity._id, mark);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                PPConsole.show('恭喜你!已加入活动!');
                $scope.modalJoinActivity.hide();
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }
    })
    .controller('FriendCtrl', function($scope, $state) {
        $scope.showDelete = false;

        $scope.toggleDeleteButton = function() {
            $scope.showDelete = !$scope.showDelete;
        }

        $scope.onItemDelete = function(item) {
            var tmpPromiseResult = $scope.asteroid.call("deleteFriend", item._id);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $scope.showDelete = false;
                $scope.$apply();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }

        $scope.unreadCount = function(friendUserId) {
            var tmpArray = $scope.unreadMessageCountsRQ.result;
            for (var i = 0; i < tmpArray.length; i++) {
                if (tmpArray[i]._id == friendUserId) {
                    return tmpArray[i].count;
                }
            }
            return 0;
        };

        $scope.goToChat = function(item) {
            $state.go('tab.friend.chat', {
                friendUserId: $scope.usersRQ.result[0]._id == item.userId1 ? item.userId2 : item.userId1
            });
        };
    })
    .controller('ChatCtrl', function($scope, $state, $stateParams, $ionicScrollDelegate, $timeout, PPConsole) {
        $scope.friendUserId = $stateParams.friendUserId;
        $timeout(function() {
            $ionicScrollDelegate.scrollBottom(true);
        }, 300);

        $scope.friendMessagesRQ = $scope.messages.reactiveQuery({
            $or: [{
                fromUserId: $scope.usersRQ.result[0]._id,
                toUserId: $scope.friendUserId
            }, {
                fromUserId: $scope.friendUserId,
                toUserId: $scope.usersRQ.result[0]._id
            }]
        });
        $scope.friendMessagesRQ.on("change", function() {
            $scope.$apply();
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            }, 300);
            PPConsole.debug("friend messages change");
        });

        $scope.sendMessage = function() {
            //防止在消息发送过程中重复发送或发送空消息
            if (!$scope.inputMessage || $scope.sending) {
                return;
            }

            $scope.sending = true;

            var tmpPromiseResult = $scope.asteroid.call("sendMessage", $scope.inputMessage, $scope.friendUserId);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $scope.inputMessage = '';
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                console.log('abc');
                $scope.sending = false;
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        };

        $scope.myBack = function() {
            var tmpPromiseResult = $scope.asteroid.call("readMessage", $scope.friendUserId);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            })
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
            $state.go('tab.friend');
        }
    })
    .controller('SettingCtrl', function($scope, $state, $ionicLoading, $cordovaGeolocation, PPConsole) {
        $scope.friend = {
            username: ''
        };
        $scope.addFriend = function() {
            $ionicLoading.show({
                template: '处理中...'
            });
            var tmpPromiseResult = $scope.asteroid.call("addFriend", $scope.friend.username);
            tmpPromiseResult.result.then(function(r) {
                PPConsole.debug("rr");
                PPConsole.debug(r);
                $scope.friend.username = "";
            }, function(e) {
                PPConsole.debug("re");
                PPConsole.err(e);
            }).finally(function() {
                $ionicLoading.hide();
            });
            tmpPromiseResult.updated.then(function(r) {
                PPConsole.debug("ur");
                PPConsole.debug(r)
            }, function(e) {
                PPConsole.debug("ue");
                PPConsole.err(e);
            });
        }

        $scope.test = function() {
            console.log('abc');
            $ionicLoading.show({
                template: '处理中...'
            });

            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: true
            };

            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                var lat = position.coords.latitude;
                var long = position.coords.longitude;

                var tmpPromiseResult = $scope.asteroid.call("test", [long, lat]);
                tmpPromiseResult.result.then(function(r) {
                    PPConsole.debug("rr");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("re");
                    PPConsole.err(e);
                }).finally(function() {
                    $ionicLoading.hide();
                });
                tmpPromiseResult.updated.then(function(r) {
                    PPConsole.debug("ur");
                    PPConsole.debug(r)
                }, function(e) {
                    PPConsole.debug("ue");
                    PPConsole.err(e);
                });
            }, function(err) {
                PPConsole.err(err);
                $ionicLoading.hide();
            });
        }

        $scope.logout = function() {
            $scope.asteroid.logout().then(function() {
                $state.go('login');
                // Clear all cache and history
                $timeout(function() {
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                }, 30)
            }, function(err) {
                PPConsole.err(err);
            });
        }
    });