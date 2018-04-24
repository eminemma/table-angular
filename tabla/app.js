(function(ng, undefined) {
    ng.module('table-em', []);
    ng.module('table-em').controller('tablaControlador', function($scope, $http, $filter, myservice, $rootScope) {
        $scope.cantidadFilas = 10;
        $scope.inicioPagina = 0;
        $scope.finPagina = 0;
        $scope.cantidadPaginas = 0;
        $scope.paginaActual = 1;
        $scope.data = [];
        $scope.reverso = false;
        $scope.templatePag = "tabla/paginador.html";
        $scope.templateBuscador = "tabla/buscador.html";
        $scope.servicio = myservice;
        $scope.Paginador = [1, 2, 3];
        $scope.buscar = false;
        $scope.formBuscar = {};
        $scope.formReporte = {};

        $rootScope.$on('buscarServer', function(event, args) {
            var form = myservice.getData();
            var url = myservice.getUrl();
            $.LoadingOverlay("show");
            $http.post(url, form).then(
                function(response) {


                    try {

                        if (typeof response.data == 'object') {

                            $scope.data = response.data;
                            $scope.irPrimerPagina();
                            $scope.cantidadPaginas = Math.ceil($scope.data.length / $scope.cantidadFilas);
                            $scope.finPagina = 10;
                            $scope.generarPaginador($scope.paginaActual);
                            $scope.buscar = true;
                        } else {
                            $scope.data.tipo = 'error';
                            $scope.data.mensaje = response.data;
                        }
                    } catch (e) {

                        $scope.data.tipo = 'error';
                        $scope.data.mensaje = response.data;
                    }

                    $.LoadingOverlay("hide");
                }
            );

        });

        $scope.errorBusqueda = function() {
            if ($scope.data.hasOwnProperty('tipo') && $scope.data.tipo == 'error') {
                return $scope.data.mensaje;
            }
            return false;
        }
        $scope.siguientePagina = function() {
            if (!$scope.deshabilitarPaginaFinal()) {
                $scope.inicioPagina = $scope.inicioPagina + $scope.cantidadFilas;
                $scope.finPagina = $scope.inicioPagina + $scope.cantidadFilas;
                $scope.paginaActual += 1;
                $scope.generarPaginador($scope.paginaActual);
            }

        }
        $scope.anteriorPagina = function() {
            if (!$scope.deshabilitarPaginiaInicial()) {
                $scope.inicioPagina = $scope.inicioPagina - $scope.cantidadFilas;
                $scope.finPagina = $scope.finPagina - $scope.cantidadFilas;
                $scope.paginaActual -= 1;
                $scope.generarPaginador($scope.paginaActual);
            }
        }

        $scope.irPagina = function(pagina) {
            if (pagina <= $scope.cantidadPaginas) {
                $scope.finPagina = pagina * $scope.cantidadFilas;
                $scope.inicioPagina = $scope.finPagina - $scope.cantidadFilas;
                $scope.paginaActual = pagina;
                $scope.generarPaginador($scope.paginaActual);
            }

        }
        $scope.irPrimerPagina = function(pagina) {
            $scope.inicioPagina = 0;
            $scope.finPagina = $scope.cantidadFilas;
            $scope.paginaActual = 1;
            $scope.generarPaginador($scope.paginaActual);
        }
        $scope.irUltimaPagina = function() {

            $scope.inicioPagina = ($scope.cantidadPaginas * $scope.cantidadFilas) - $scope.cantidadFilas;
            $scope.finPagina = ($scope.cantidadPaginas * $scope.cantidadFilas);

            $scope.paginaActual = $scope.cantidadPaginas;
            $scope.generarPaginador($scope.paginaActual);
        }
        $scope.generarPaginador = function(pagina) {
            if (pagina == 1) {
                $scope.Paginador = [];
                var vuelta = 0;
                for (var i = 1; i <= $scope.cantidadPaginas; i++) {
                    $scope.Paginador.push(i);
                    if (vuelta == 3)
                        return;
                    vuelta += 1;

                }
            } else {
                $scope.Paginador = [];
                var vuelta = 0;
                for (var i = $scope.paginaActual - 1; i <= $scope.cantidadPaginas; i++) {
                    $scope.Paginador.push(i);
                    if (vuelta == 3)
                        return;
                    vuelta += 1;

                }
            }

        }

        $scope.itemSeleccionado = function(index) {
            $scope.servicio.setItemSeleccionado($scope.data);
        }

        $scope.deshabilitarPaginiaInicial = function() {
            if ($scope.paginaActual == 1) {
                return true;
            }
            return false;
        }
        $scope.deshabilitarPaginaFinal = function() {
            if ($scope.data !== undefined) {
                if ($scope.paginaActual >= $scope.cantidadPaginas) {
                    return true;
                }
            }
            return false;
        }

        $scope.seBusco = function() {
            if ($scope.data.length == 0 && $scope.buscar == true)
                return true;
            return false;
        }

        $scope.deshabilitarMensaje = function() {
            if ($scope.data.length == 0)
                return true;
            return false;
        }




        $scope.getKeys = function(obj, add) {
            if (obj === undefined || obj === null) {
                return undefined;
            }
            var keys = [];
            if (add !== undefined) {
                keys = jQuery.merge(keys, add);
            }
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            return keys;
        }


        $scope.buscarEnArray = function() {

            var text = $scope.formBuscar.buscarEn;
            if (text == '')
                $rootScope.$emit("buscarServer", {});
            var i, obj;
            var array = [];
            var filtered = [];
            angular.forEach($scope.data, function(item) {
                filtered.push(item);
            });
            for (i = 0; i < filtered.length; i++) {
                var obj = filtered[i];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (('' + obj[key]).indexOf(text) >= 0 || ('' + key).indexOf(text) >= 0) {
                            array.push(obj);
                            break;
                        }
                    }
                }
            }
            $scope.data = array;
        }


        $rootScope.$on('abrirReporte', function(e) {
            $('#formReporte').attr("action", "tabla/reporte.php");
            $('#formReporte').attr("target", "_blank");

            $('#data').val(JSON.stringify($scope.data));

            $('#columnas').val(JSON.stringify(myservice.getColumnasReporte()));
            $('#formReporte').submit();
        });

        $rootScope.$on('abrirReporteXLS', function(e) {
            $('#formReporte').attr("action", "tabla/xls.php");
            $('#formReporte').attr("target", "_blank");

            $('#data').val(JSON.stringify($scope.data));

            $('#columnas').val(JSON.stringify(myservice.getColumnasReporte()));
            $('#formReporte').submit();
        });

        $scope.ordenar = function(campo, tipo) {
            var filtered = [];

            $scope.irPagina(1);

            reversed = !$scope.reverso;
            $scope.reverso = reversed;
            angular.forEach($scope.data, function(item) {
                filtered.push(item);
            });
            if (tipo == 'string') {
                filtered.sort(function(a, b) {
                    a = a[campo] == null ? '' : a[campo];
                    b = b[campo] == null ? '' : b[campo];
                    return a.toString().toLowerCase().localeCompare(b.toString().toLowerCase()) * (reversed ? -1 : 1);
                });
            } else if (tipo == 'int') {
                filtered.sort(function(a, b) {
                    a = parseInt(a[campo]);
                    b = parseInt(b[campo]);
                    return (a - b) * (reversed ? -1 : 1);
                });
            } else if (tipo == 'float') {
                filtered.sort(function(a, b) {
                    a = parseFloat(a[campo]);
                    b = parseFloat(b[campo]);

                    return (a - b) * (reversed ? -1 : 1);
                });
            } else if (tipo == 'date') {
                filtered.sort(function(a, b) {
                    var reggie = /(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/;
                    var aArray = reggie.exec(a[campo]);
                    var bArray = reggie.exec(b[campo]);
                    if (a[campo] !== null)
                        aa = new Date(aArray[3], aArray[2], aArray[1], aArray[4], aArray[5], aArray[6]);
                    if (b[campo] !== null)
                        bb = new Date(bArray[3], bArray[2], bArray[1], bArray[4], bArray[5], bArray[6]);
                    if (a[campo] === null) {
                        return 1;
                    } else if (b[campo] === null) {
                        return -1;
                    }
                    return (aa < bb ? -1 : (aa > bb ? 1 : 0)) * (reversed ? -1 : 1);
                });
            }

            $scope.data = filtered;
        };



    });
    ng.module('table-em').filter('startFrom', function() {
        return function(input, start, end) {
            if (input !== undefined && input.length > 0) {
                return input.slice(start, end);
            }
        }
    });


    ng.module('table-em').filter('orderObjectBy', function() {
        return function(items, field, reverse) {

        };
    });

    ng.module('table-em').run(function($templateCache, $http) {
        $http.get('tabla/paginador.html', { cache: $templateCache });
    });
    ng.module('table-em').run(function($templateCache, $http) {
        $http.get('tabla/buscador.html', { cache: $templateCache });
    });

    ng.module('table-em').factory("myservice", function() {
        var url = "";
        var data = null;
        var item = null;
        var columnasReporte = null;

        return {

            setUrl: function(pUrl) {
                url = pUrl;
            },

            getUrl: function() {
                return url;
            },
            setData: function(pData) {
                data = pData;
            },

            getData: function() {
                return data;
            },
            setItemSeleccionado: function(pItem) {
                item = pItem;
            },

            getItemSeleccionado: function() {
                return item;
            },

            setColumnasReporte: function(pColumnasReporte) {
                columnasReporte = pColumnasReporte;
            },

            getColumnasReporte: function() {
                return columnasReporte;
            },
        };

    });
})(angular);


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
