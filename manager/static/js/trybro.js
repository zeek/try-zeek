function CodeCtrl($scope, $http, $timeout) {
    $scope.examples = ["hello.bro", "log.bro", "ssh.bro"];
    $scope.pcaps = ["--", "ssh.pcap","http.pcap"];
    $scope.pcap = "--";
    $scope.files = [];
    $scope.mode = "text";
    $scope.visible = "Ready...";

    $scope.load_example = function () {
        $http.get("/static/examples/" + $scope.example_name).then(function(response) {
            $scope.code = response.data;
        });
    }
    $scope.$watch("example_name", function (newValue) {
        $scope.load_example(newValue);
    });
    $scope.example_name = "hello.bro";

    $scope.run_code = function() {
        $scope.mode = "text";
        $scope.file = "stdout.log";
        $scope.visible = "Running..."
        $http.post("/run", { "code": $scope.code, "pcap": $scope.pcap }).then(function(response) {
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
            $scope.files = response.data.files;
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

