function CodeCtrl($scope, $http, $timeout) {
    $scope.files = [];
    $scope.mode = "text";
    $scope.visible = "Ready...";
    $scope.code = ' \
event bro_init() { \n\
    print "Hello, World!"; \n\
}';

    $scope.run_code = function() {
        $scope.stdout = "Running..."
        $http.post("/run", { "code": $scope.code }).then(function(response) {
            $scope.job = response.data.job;
            $scope.wait();
        });
    };

    $scope.wait = function() {
        $http.get("/stdout/" + $scope.job).then(function(response) {
            console.log(response);
            if(response.status != 202) {
                $scope.mode = 'text';
                $scope.visible = response.data;
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

