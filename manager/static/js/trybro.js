function CodeCtrl($scope, $http, $timeout) {
    $scope.examples = ["hello.bro", "log.bro", "ssh.bro"];
    $scope.pcaps = ["--", "ssh.pcap","http.pcap"];
    $scope.pcap = "--";
    $scope.files = [];
    $scope.mode = "text";
    $scope.visible = "Ready...";

    $scope.editor = ace.edit("editor");
    $scope.editor.getSession().setMode("ace/mode/perl");
    $scope.editor.setShowPrintMargin(false);


    $scope.load_example = function () {
        $http.get("/static/examples/" + $scope.example_name).then(function(response) {
            $scope.editor.setValue(response.data);
            $scope.editor.selection.clearSelection();
        });
    }
    $scope.$watch("example_name", function (newValue) {
        $scope.load_example(newValue);
    });
    $scope.example_name = "hello.bro";

    $scope.run_code = function() {
        $scope.mode = "text";
        $scope.file = "stdout.log";
        $scope.visible = "Running...";
        var code = $scope.editor.getValue();
        $http.post("/run", { "code": code, "pcap": $scope.pcap }).then(function(response) {
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

}

