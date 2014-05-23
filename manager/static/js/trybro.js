function CodeCtrl($scope, $http, $timeout) {
    $scope.stdout = "Hello!";

    $scope.code = ' \
event bro_init() { \n\
    print "Hello, World!"; \n\
}';

    $scope.run_code = function() {
        $scope.stdout = $scope.code;
        $http.post("/run", { "code": $scope.code }).then(function(response) {
            $scope.job = response.data.job;
            $scope.wait();
        });
    }

    $scope.wait = function() {
        $http.get("/stdout/" + $scope.job).then(function(response) {
            console.log(response);
            if(response.status != 202) {
                $scope.stdout = response.data;
            } else {
                $timeout($scope.wait, 200);
            }
        });
    }
}

