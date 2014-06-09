var tbApp = angular.module('trybro', ['ui.ace']);

tbApp.controller('CodeCtrl', function($scope, $http, $timeout) {
    $scope.examples = ["hello", "log", "ssh"];
    $scope.pcaps = ["--", "ssh.pcap","http.pcap"];
    $scope.pcap = "--";
    $scope.files = [];
    $scope.mode = "text";
    $scope.visible = "Ready...";

    $http.get("/static/examples/examples.json").then(function(response) {
        $scope.examples = response.data;
    });

    $scope.source_files = [
        { "name": "main.bro", "content": ""},
    ];

    $scope.aceLoaded = function(_editor) {
        _editor.getSession().setMode("ace/mode/perl");
        _editor.setShowPrintMargin(false);
    };

    $scope.load_example = function () {
        $http.get("/static/examples/" + $scope.example_name + ".json").then(function(response) {
            $scope.source_files = response.data;
            $scope.current_file = $scope.source_files[0];
            //$scope.editor.setValue(response.data);
            //$scope.editor.selection.clearSelection();
        });
    }

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
        f.name = newname;
    };
    $scope.$watch("example_name", function (newValue) {
        $scope.load_example(newValue);
    });
    $scope.example_name = "hello";

    $scope.run_code = function() {
        $scope.mode = "text";
        $scope.file = "stdout.log";
        $scope.visible = "Running...";
        $http.post("/run", { "sources": $scope.source_files, "pcap": $scope.pcap }).then(function(response) {
            $scope.job = response.data.job;
            $scope.wait();
        });
    };

    $scope.wait = function() {
        $http.get("/stdout/" + $scope.job).then(function(response) {
            console.log(response);
            if(response.status != 202) {
                $scope.mode = 'text';
                $scope.visible = response.data.txt;
                $scope.file = "stdout.log";
                $scope.load_files();
            } else {
                $timeout($scope.wait, 200);
            }
        });
    };
    $scope.load_files = function() {
        $http.get("/files/" + $scope.job).then(function(response) {
            var files = response.data.files;
            $scope.stderr = files["stderr.log"];
            delete(files["stderr.log"]);
            $scope.files = files;
        });
    };

    $scope.show_file = function(fn) {
        $scope.visible = $scope.files[fn];
        if($scope.visible.header) {
            $scope.mode = "table";
        } else {
            $scope.mode = "text";
        }
        $scope.file = fn;
    };

});

