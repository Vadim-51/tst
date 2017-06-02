//holds references to angular services and provide they to other components
var DependencyContainer = function (servicesObj, servicesName) {
    this._services = {};
    this._fillServiceReferences(servicesObj, servicesName);
};

DependencyContainer.prototype.constructor = DependencyContainer;

DependencyContainer.prototype._fillServiceReferences = function (servicesObj, servicesName) {
    var dependencies = servicesName,
        i = 0;
    for (; i < dependencies.length; i++) 
        this._services[dependencies[i]] = servicesObj[i];
};

DependencyContainer.prototype.getService = function (name) {
    return this._services[name];
};

DependencyContainer.prototype.dispose = function () {
    this._services = null;
};