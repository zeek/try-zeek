var tbApp = angular.module('trybro', ['ui.router', 'ui.ace']);

tbApp.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $urlRouterProvider.when("/", "/trybro");
    $stateProvider
        .state('trybro', {
            url: '/trybro?example&pcap&version&run',
            templateUrl: '/static/trybro.html',
            controller: 'CodeCtrl',
        })
        .state('trybro.saved', {
            url: '/saved/:job',
            controller: 'CodeCtrl'
        });
});

tbApp.controller('CodeCtrl', function($scope, $http, $timeout, $stateParams, $state){
    $scope.examples = ["hello", "log", "ssh"];
    $scope.pcaps = ["--", "exercise_traffic.pcap", "ssh.pcap","http.pcap"];
    $scope.pcap = "--";
    $scope.files = [];
    $scope.mode = "text";
    $scope.status = "Ready...";
    $scope.pcap_too_large = false;

    $http.get("/static/examples/examples.json").then(function(response) {
        $scope.examples = response.data;
    });
    $http.get("/versions.json").then(function(response) {
        $scope.versions = response.data.versions;
        $scope.version = $scope.version || response.data.default;
    });

    $scope.source_files = [
        { "name": "main.bro", "content": ""},
    ];

    $scope.aceLoaded = function(_editor) {
        _editor.getSession().setMode("ace/mode/perl");
        _editor.setShowPrintMargin(false);
    };

    $scope.pcap_changed = function() {
        var f = document.getElementById("pcap_upload").files[0];
        $scope.$apply(function() {
            $scope.pcap_too_large = !!(f.size > 1024*1024*10);
        });
    }

    $scope.load_example = function () {
        if(!$scope.example_name || $scope.example_name === "--"){
            return;
        }
        $http.get("/static/examples/" + $scope.example_name + ".json").then(function(response) {
            $scope.source_files = response.data;
            $scope.current_file = $scope.source_files[0];
            //$scope.editor.setValue(response.data);
            //$scope.editor.selection.clearSelection();
        });
    };

    $scope.load_saved = function (job_id) {
        //make sure I default to something if the get fails.
        $scope.source_files = [{"name": "main.bro", "content": ""}];
        $scope.current_file = $scope.source_files[0];
        $http.get("/saved/" + job_id).then(function(response) {
            console.log(response.data);
            $scope.source_files = response.data.sources;
            $scope.current_file = $scope.source_files[0];
            $scope.pcap = response.data.pcap || '--';
            $scope.version = response.data.version;
            $scope.run_code();
        }, function (reason) {
            $scope.status = "Failed to load saved session";
        });
    };

    $scope.add_file = function() {
        $scope.source_files.push(
            { "name": "new.bro", "content": "hello"}
        );
    };
    $scope.edit_file = function(f) {
        if($scope.current_file != f) {
            $scope.current_file = f;
            return;
        }
        if(f.name == "main.bro") {
            return;
        }

        var newname = prompt("Rename " + f.name, f.name);
        if(newname) {
            f.name = newname;
        }
    };
    $scope.$watch("example_name", function (newValue) {
        $scope.load_example(newValue);
    });

    $scope.run_code = function() {
        var f = document.getElementById("pcap_upload").files[0];
        if(f)
            return $scope.maybe_upload_pcap(f);
        else
            return $scope.really_run_code($scope.pcap);
    };


    $scope.maybe_upload_pcap = function(file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            var checksum = md5(reader.result);
            $scope.maybe_upload_pcap_checksum(file, checksum);
        }
        reader.readAsBinaryString(file);
    };

    $scope.maybe_upload_pcap_checksum = function(file, checksum) {
        $http.get("/pcap/" + checksum).then(function(response) {
            if(response.data.status) {
                $scope.really_run_code(checksum);
                $scope.upload_percentage = null;
            } else {
                $scope.upload_pcap(file, checksum);
            }
        });
    };

    $scope.upload_pcap = function(file, checksum) {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                $scope.$apply(function() {
                    $scope.upload_percentage = percentage;
                });
            }
        }, false);
        xhr.upload.addEventListener("load", function(e){
            $scope.$apply(function() {
                $scope.upload_percentage = null;
                $scope.really_run_code(checksum);
            });
        }, false);

        var fd = new FormData();
        fd.append('pcap', file);

        xhr.open("POST", "/pcap/upload/" + checksum, true);
        xhr.send(fd);
    };

    $scope.really_run_code = function(pcap) {
        $scope.mode = "text";
        $scope.status = "Running...";
        $scope.stderr = null;
        $scope.files = null;
        $scope.visible = null;
        var data = {
            "sources": $scope.source_files,
            "pcap": pcap,
            "version": $scope.version
        }
        $http.post("/run", data).then(function(response) {
            $scope.job = response.data.job;
            $state.go("trybro.saved", {job: $scope.job}, {notify: false, inherit: false});
            $scope.wait();
        });
    };

    $scope.wait = function() {
        $http.get("/stdout/" + $scope.job).then(function(response) {
            console.log(response);
            if(response.status != 202) {
                $scope.mode = 'text';
                $scope.stdout = response.data.txt;
                $scope.load_files();
            } else {
                $timeout($scope.wait, 200);
            }
        });
    };
    $scope.load_files = function() {
        $scope.status = "Loading files.."
        $http.get("/files/" + $scope.job + ".json").then(function(response) {
            $scope.status = null;
            var files = response.data.files;

            $scope.stderr = files["stderr.log"];
            delete(files["stderr.log"]);

            delete(files["stdout.log"]);
            $scope.files = files;

            var file_keys = Object.keys(files);
            if(file_keys.length == 0) {
                $scope.files = null;
            } else {
                $scope.show_file(file_keys[0]);
            }
        });
    };

    $scope.show_file = function(fn) {
        var visible = $scope.files[fn];
        if(visible.header) {
            $scope.mode = "table";
        } else {
            $scope.mode = "text";
        }
        $scope.visible = visible;
        $scope.file = fn;
    };

    $scope.example_name = "hello";

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if(toParams.job) {
            $scope.example_name = null;
            $scope.load_saved(toParams.job);
        }
        /*FIXME: just make this a loop */
        if(toParams.example) {
            $scope.example_name = toParams.example;
        }
        if(toParams.pcap) {
            $scope.pcap = toParams.pcap;
        }
        if(toParams.version) {
            $scope.version = toParams.version;
        }
        if(toParams.run) {
            $scope.run_code();
        }
    });

});
