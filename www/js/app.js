// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $state, $rootScope, amMoment) {
        amMoment.changeLocale('zh-cn');
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            $rootScope.$on('$ionicView.beforeEnter', function() {
                $rootScope.hideTabs = false;

                if ($state.current.name === 'tab.meet.searchSpecialPic' || $state.current.name === 'tab.meet.searchSpecialPicReply' || $state.current.name === 'tab.meet.searchSpecialPicConfirm' || $state.current.name === 'tab.friend.chat' || $state.current.name === 'tab.activity.chat') {
                    $rootScope.hideTabs = true;
                }

                if ($state.current.name == 'tab.friend.chat') {
                    //避免在浏览器测试错误
                    if (typeof cordova != "undefined") {
                        cordova.plugins.Keyboard.disableScroll(true);
                    }
                } else {
                    //避免在浏览器测试错误
                    if (typeof cordova != "undefined") {
                        cordova.plugins.Keyboard.disableScroll(false);
                    }
                }
            });
        });
    })
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.views.swipeBackEnabled(false);

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider.state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            })
            .state('register', {
                url: '/register',
                templateUrl: 'templates/register.html',
                controller: 'RegisterCtrl'
            })

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
            controller: 'TabsCtrl'
        })

        // Each tab has its own nav history stack:

        .state('tab.meet', {
            url: '/meet',
            views: {
                'tab-meet': {
                    templateUrl: 'templates/tab-meet.html',
                    controller: 'MeetCtrl'
                }
            }
        })

        .state('tab.meet.searchSpecialPic', {
            url: '/searchSpecialPic',
            views: {
                'tab-meet@tab': {
                    templateUrl: 'templates/searchSpecialPic.html',
                    controller: 'SearchSpecialPicCtrl'
                }
            }
        })

        .state('tab.meet.searchSpecialPicReply', {
            url: '/searchSpecialPicReply',
            views: {
                'tab-meet@tab': {
                    templateUrl: 'templates/searchSpecialPicReply.html',
                    controller: 'SearchSpecialPicReplyCtrl'
                }
            }
        })

        .state('tab.meet.searchSpecialPicConfirm', {
            url: '/searchSpecialPicConfirm',
            views: {
                'tab-meet@tab': {
                    templateUrl: 'templates/searchSpecialPicConfirm.html',
                    controller: 'SearchSpecialPicConfirmCtrl'
                }
            }
        })

        .state('tab.friend.chat', {
            url: '/chat/:friendUserId',
            views: {
                'tab-friend@tab': {
                    templateUrl: 'templates/chat.html',
                    controller: 'ChatCtrl'
                }
            }
        })

        .state('tab.activity', {
            url: '/activity',
            views: {
                'tab-activity': {
                    templateUrl: 'templates/tab-activity.html',
                    controller: 'ActivityCtrl'
                }
            }
        })

        .state('tab.activity.chat', {
            url: '/chat/:activityId',
            views: {
                'tab-activity@tab': {
                    templateUrl: 'templates/activityChat.html',
                    controller: 'ActivityChatCtrl'
                }
            }
        })

        .state('tab.friend', {
            url: '/friend',
            views: {
                'tab-friend': {
                    templateUrl: 'templates/tab-friend.html',
                    controller: 'FriendCtrl'
                }
            }
        })

        .state('tab.setting', {
            url: '/setting',
            views: {
                'tab-setting': {
                    templateUrl: 'templates/tab-setting.html',
                    controller: 'SettingCtrl'
                }
            }
        });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');

    });