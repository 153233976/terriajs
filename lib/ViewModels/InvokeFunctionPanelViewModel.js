'use strict';

/*global require*/
var BooleanParameterEditor = require('./BooleanParameterEditor');
var defaultValue = require('terriajs-cesium/Source/Core/defaultValue');
var GenericParameterEditor = require('./GenericParameterEditor');
var getElement = require('terriajs-cesium/Source/Widgets/getElement');
var knockout = require('terriajs-cesium/Source/ThirdParty/knockout');
var loadView = require('../Core/loadView');
var RegionDataParameterEditor = require('./RegionDataParameterEditor');
var RegionParameterEditor = require('./RegionParameterEditor');
var RegionTypeParameterEditor = require('./RegionTypeParameterEditor');
var removeView = require('../Core/removeView');

var InvokeFunctionPanelViewModel = function(options) {
    var container = getElement(defaultValue(options.container, document.body));

    this.catalogFunction = options.catalogFunction;

    this.horizontalPadding = defaultValue(options.horizontalPadding, 495);
    this.verticalPadding = defaultValue(options.verticalPadding, 240);
    this.maxWidth = 0;
    this.maxHeight = 0;

    // Initialize the parameter values.  Use the initial values supplied to the constructor, if any.  Otherwise,
    // use the default value, if any.  If there is no initial value and no default value, the initial value is
    // undefined.
    var initialValues = defaultValue(options.initialParametersValues, {});
    var parameters = this.catalogFunction.parameters;
    var parameterValues = {};
    var parameterNames = [];

    for (var i = 0; i < parameters.length; ++i) {
        var parameter = parameters[i];
        parameterNames.push(parameter.id);
        parameterValues[parameter.id] = defaultValue(initialValues[parameter.id], parameter.defaultValue);
    }

    knockout.track(parameterValues, parameterNames);

    this.parameterValues = parameterValues;

    knockout.track(this, ['maxWidth', 'maxHeight']);

    this._domNodes = loadView(require('fs').readFileSync(__dirname + '/../Views/InvokeFunctionPanel.html', 'utf8'), container, this);

    var that = this;

    function updateMaxDimensions() {
        that.maxWidth = container.clientWidth - that.horizontalPadding;
        that.maxHeight = container.clientHeight - that.verticalPadding;

        if (that.maxWidth < 200 || that.maxHeight < 200) {
            // Small screen, allow the invoke function panel to cover almost all of it.
            that.maxWidth = container.clientWidth - 30;
            that.maxHeight = container.clientHeight - 80;
        }
    }

    updateMaxDimensions();

    window.addEventListener('resize', function() {
        updateMaxDimensions();
    }, false);
};

InvokeFunctionPanelViewModel.parameterComponents = {
    boolean: BooleanParameterEditor,
    regionType: RegionTypeParameterEditor,
    region: RegionParameterEditor,
    regionData: RegionDataParameterEditor
};

InvokeFunctionPanelViewModel.prototype.closeIfClickOnBackground = function(viewModel, e) {
    if (e.target.className === 'modal-background' || e.target.className === 'invoke-function-panel-holder-inner') {
        this.close();
    }
    return true;
};

InvokeFunctionPanelViewModel.open = function(options) {
    return new InvokeFunctionPanelViewModel(options);
};

InvokeFunctionPanelViewModel.prototype.close = function() {
    removeView(this._domNodes);
};

InvokeFunctionPanelViewModel.prototype._getComponentForParameter = function(parameter) {
    var Component = defaultValue(InvokeFunctionPanelViewModel.parameterComponents[parameter.type], GenericParameterEditor);
    return new Component(this.catalogFunction, parameter, this.parameterValues);
};

InvokeFunctionPanelViewModel.prototype.invokeFunction = function() {
    var asyncResult = this.catalogFunction.invoke(this.parameterValues);
    asyncResult.isEnabled = true;
    this.close();
};

module.exports = InvokeFunctionPanelViewModel;
