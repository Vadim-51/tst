angular.module('vigilantApp').directive('validationTooltipMessages', function () {
    return {
        restrict: 'A',
        controller: function ($scope) {
            $scope.validators = [];
            this.setMessage = function (key, message) {

                var existed = $scope.validators.find(function (item) {
                    return item.key === key;
                });

                if (existed) {
                    existed.msg = message;
                }
                else {
                    $scope.validators.push({
                        key: key,
                        msg: message
                    });
                }
            };
        },
        link: function (scope, element, attrs) {

            var inputName = attrs.name;
            var formName = element.parents('form').attr('name');
            var msg = '';
            var tooltip = element.tooltip({
                trigger: 'manual',
                title: function () {
                    return msg;
                }
            });

            var unsubscribe = scope.$watch(function () {
                var i = 0,
                    validator;
                for (; i < scope.validators.length; i++) {
                    validator = scope.validators[i];
                    if (scope.$eval(formName + '.' + inputName + '.$error.' + validator.key))
                        return validator;
                }
                return null;
            },
            function (validator) {
                if (validator) {
                    msg = validator.msg;
                    element.tooltip('show');
                }
                else {
                    msg = '';
                    element.tooltip('hide');
                }
            });

            scope.$on('$destroy', function () {
                unsubscribe();
            });
        }
    }
});