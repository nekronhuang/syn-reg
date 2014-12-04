var async = require('async'),
    sp = require('serialport');
angular.module('service.basic', ['service.write', 'service.read', 'service.tools', 'service.import', 'service.export', 'service.format', 'service.advanced']).service('Basic', ['$rootScope', '$filter', '$cacheFactory', 'Tools', 'Write', 'Read', 'Import', 'Export', 'Format', 'Advanced',
    function($rootScope, $filter, $cacheFactory, Tools, Write, Read, Import, Export, Format, Advanced) {
        this.list = function(callback) {
            async.waterfall([

                function(next) {
                    sp.list(next);
                },
                function(ports, next) {
                    console.log(ports);
                    if (ports.length) {
                        var now = $rootScope.sPort ? $rootScope.sPort.path : null;
                        async.map(ports, function(item, cb) {
                            if (item.comName != now) {
                                var tmp = new sp.SerialPort(item.comName, {
                                    baudrate: 57600,
                                    parser: sp.parsers.custom()
                                }, false);
                                cb(null, tmp);
                            } else {
                                cb(null, $rootScope.sPort);
                            }
                        }, next);
                    } else {
                        next(null, []);
                    }
                },
                function(sPorts, next) {
                    var results = [];
                    async.each(sPorts, function(item, cb) {
                        if (item.readable) {
                            if (typeof(sPort.id) == 'string') {
                                results.push({
                                    display: '读机器',
                                    com: item.path,
                                    readId: sPort.id
                                });
                            } else {
                                results.push({
                                    display: '写机器',
                                    com: item.path
                                });
                            }
                            cb();
                        } else {
                            item.open(function(err) {
                                if (err) {
                                    console.error('cant open' + item.path);
                                    cb();
                                } else {
                                    var auto = true,
                                        date = new Date();
                                    item.once('disconnect', function() {
                                        item.close(function(err) {
                                            console.log('error disconnect', err);
                                        });
                                        cb();
                                    }).once('error', function() {
                                        item.close(function(err) {
                                            console.log('error closed', err);
                                        });
                                        cb();
                                    }).on('data', function(buf) {
                                        auto = false;
                                        if (buf[2] == 119) {
                                            results.push({
                                                display: '写机器',
                                                com: item.path
                                            });
                                            item.close(function(err) {
                                                if (err) {
                                                    console.error(err);
                                                }
                                                cb();
                                            });
                                        } else if (buf[2] == 114) {
                                            results.push({
                                                display: '读机器',
                                                com: item.path,
                                                readId: buf.toString('hex', 3)
                                            });
                                            item.close(function(err) {
                                                if (err) {
                                                    console.error(err);
                                                }
                                                cb();
                                            });
                                        }
                                    });
                                    Tools.communicateSP(item, Buffer.concat([
                                        new Buffer([0x34]),
                                        new Buffer($filter('date')(date, 'yyyyMMddhhmmss'), 'hex'),
                                        new Buffer([date.getDay() + 1])
                                    ]));
                                    setTimeout(function() {
                                        if (auto) {
                                            item.close(function(err) {
                                                console.log('regular close', err);
                                                cb();
                                            });
                                        }
                                    }, 3000);
                                }
                            });
                        }
                    }, function(err) {
                        next(null, results);
                    });
                }
            ], callback);
        }
        this.build = function(com, readId) {
            var myCache = $cacheFactory.get('myCache');
            async.series([

                function(cb) {
                    if ($rootScope.sPort && $rootScope.sPort.path != com) {
                        $rootScope.sPort.close(function(err) {
                            sPort = null;
                            cb(err);
                        });
                    } else {
                        cb();
                    }
                }
            ], function(err) {
                if (err) console.error('cant close', err);
                if (!$rootScope.sPort) {
                    $rootScope.sPort = new sp.SerialPort(com, {
                        baudrate: 57600,
                        parser: sp.parsers.custom()
                    }, false);
                    $rootScope.sPort.id = readId ? readId : 0;
                    $rootScope.sPort.open(function(err) {
                        if (err) return $rootScope.sPort = null;
                    });
                    $rootScope.sPort.on('data', function(buf) {
                        var data = buf.toString(),
                            status = data.substring(0, 2);
                        console.log(data);
                        if (status.indexOf('b') != -1) {
                            Tools.showLog('通讯开始，请勿断开连接');
                        }
                        if (status.indexOf('f') != -1) {
                            Tools.showLog('发送失败，请重新发送命令!');
                            if (status == '5f') {
                                Format.c();
                            }
                            return;
                        }
                        switch (status) {
                            case '1c':
                                Write.c();
                                break;
                            case '1s':
                                Write.s(data);
                                break;
                            case '2s':
                                Read.s(buf);
                                break;
                            case '2u':
                                Read.u();
                                break;
                            case '3s':
                                // NDEF.s();
                                break;
                            case '4s':
                                Import.s(buf);
                                break;
                            case '5s':
                                Format.s();
                                break;
                            case '6b':
                                Export.b(buf);
                                break;
                            case '6s':
                                Export.s(buf);
                                break;
                            case '8s':
                                // NDEF.s();
                                break;
                            case '9s':
                                Advanced.s9();
                                break;
                        }
                    }).once('error', function(err) {
                        myCache.get('sPanel').scope().error();
                        $rootScope.sPort.close(function(err) {
                            $rootScope.sPort = null;
                        });
                    }).once('disconnect', function(err) {
                        myCache.get('sPanel').scope().error();
                        $rootScope.sPort.close(function(err) {
                            $rootScope.sPort = null;
                        });
                    });
                }
            });
        }
        this.disconnect = function() {
            if ($rootScope.sPort) {
                $rootScope.sPort.close(function(err) {
                    $rootScope.sPort = null;
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                $rootScope.showDialog('未连接！');
            }
        }
    }
]);