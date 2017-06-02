(function () {
    var screenshot = {
        step2: [],
        step3: [],
        step4: [],
        step5: []
    };

    function pushScreenshotToStep(step, img) {
        var array;
        switch (step) {
            case "2":
                screenshot.step2.push({image: img});
                array = getScreenshotForStep(step);
                break;

            case "3":
                screenshot.step3.push({image: img});
                array = getScreenshotForStep(step);
                break;

            case "4":
                screenshot.step4.push({image: img});
                array = getScreenshotForStep(step);
                break;

            case "5":
                screenshot.step5.push({image: img});
                array = getScreenshotForStep(step);
                break;
        }
        return array;

    }

    function deleteScreenshotFromStep(step, newAraay) {
        switch (step) {
            case "2":
                screenshot.step2 = newAraay;
                break;

            case "3":
                screenshot.step3 = newAraay;
                break;

            case "4":
                screenshot.step4 = newAraay;
                break;

            case "5":
                screenshot.step5 = newAraay;
                break;
        }

    }

    function getScreenShotObject() {
        return screenshot;
        //console.log(screenshot);
    }

    function clearScreenshotObject() {
        screenshot = {
            step2: [],
            step3: [],
            step4: [],
            step5: []
        };
    }

    function loadScreenshot(object) {
        screenshot = object;
    }

    function getScreenshotForStep(step) {
        var array;
        switch (step) {
            case "2":
                array = screenshot.step2;
                break;

            case "3":
                array = screenshot.step3;
                break;

            case "4":
                array = screenshot.step4;
                break;

            case "5":
                array = screenshot.step5;
                break;
        }
        return array;
    }

    var service = function(){
        return {
            pushScreenshotToStep: pushScreenshotToStep,
            deleteScreenshotFromStep: deleteScreenshotFromStep,
            getScreenShotObject: getScreenShotObject,
            clearScreenshotObject: clearScreenshotObject,
            loadScreenshot: loadScreenshot,
            getScreenshotForStep: getScreenshotForStep
        }
    };

    angular.module('vigilantApp').service('ScreenShotService', service);
})();
