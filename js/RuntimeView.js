(function($) {

    var Alpaca = $.alpaca;

    Alpaca.RuntimeView = Base.extend(
    /**
     * @lends Alpaca.RuntimeView.prototype
     */
    {
        /**
         * Runtime implementation of a view as applied to a field.
         *
         * This provides accessors into the nested behaviors of views and also takes into account field-level attributes
         * of the currently rendering dom element.
         *
         * @constructs
         *
         * @class Class for managing view components such as layout, template, message etc.
         *
         * @param {String} the view id
         * @param {Object} field the field control
         */
        constructor: function(viewId, field) {
            this.field = field;
            this.setView(viewId);
        },

        /**
         * Sets the view that this runtime view adapters should consult during render.
         *
         * @param {String} the view id
         */
        setView: function (viewId)
        {
            // TODO: should field classes ever really be instantiated directly?
            // TODO: this is left in to support Alpaca docs generation (need to clean this up)s
            // if a view is not set at this point it probably means they instantiated a field directly
            // in which case, we'll just pick the default view
            if (!viewId)
            {
                this.id = "VIEW_WEB_EDIT";
                return;
            }

            // the compiled view
            var compiledView = Alpaca.getCompiledView(viewId);
            if (!compiledView)
            {
                Alpaca.logError("Runtime view for view id: " + viewId + " could not find a compiled view");
                throw new Error("Runtime view for view id: " + viewId + " could not find a compiled view");
            }

            // copy compiled properties into this object
            for (var k in compiledView)
            {
                if (compiledView.hasOwnProperty(k)) {
                    this[k] = compiledView[k];
                }
            }
        },

        /**
         * Gets view wizard settings.
         *
         * @returns {Object} View wizard settings.
         */
        getWizard : function () {
            return this.getViewParam("wizard");
        },

        /**
         * Gets the global layout template.
         *
         * @returns {Object|String} Global layout template setting of the view.
         */
        getGlobalTemplateDescriptor : function ()
        {
            return this.getTemplateDescriptor("globalTemplate");
        },

        /**
         * Gets layout template and bindings.
         *
         * @returns {Object} Layout template and bindings setting of the view.
         */
        getLayout: function ()
        {
            var templateDescriptor = this.getTemplateDescriptor("layoutTemplate");

            return {
                "templateDescriptor" : templateDescriptor,
                "bindings" : this.getViewParam(["layout","bindings"], true)
            };
        },

        /**
         * Gets style injection lists.
         *
         * @returns {Object} styles style injection list settings of the view.
         */
        getStyles : function () {

            return this.styles;
        },

        /**
         * Hands back the compiled template id for a given template.
         *
         * @param templateId
         */
        getTemplateDescriptor: function(templateId)
        {
            return Alpaca.getTemplateDescriptor(this, templateId);
        },

        /**
         * Gets message for the given id.
         *
         * @param {String} messageId Message id.
         *
         * @returns {String} Message mapped to the given id.
         */
        getMessage : function (messageId) {
            var messageForLocale = this.getViewParam(["messages",Alpaca.defaultLocale,messageId]);
            return Alpaca.isEmpty(messageForLocale) ? this.getViewParam(["messages",messageId]): messageForLocale;
        },

        /**
         * Retrieves view parameter based on configuration Id or Id array.
         *
         * @param {String|Array} configId Configuration id or array.
         *
         * @returns {Any} View parameter mapped to configuration Id or Id array.
         */
        getViewParam: function (configId, topLevelOnly) {

            // Try the fields
            var fieldPath = this.field.path;
            if (this.fields && this.fields[fieldPath]) {
                var configVal = this._getConfigVal(this.fields[fieldPath], configId);
                if (!Alpaca.isEmpty(configVal)) {
                    return configVal;
                }
            }

            // array related field path
            if (fieldPath && fieldPath.indexOf('[') != -1 && fieldPath.indexOf(']') != -1) {
                fieldPath = fieldPath.replace(/\[\d+\]/g,"[*]");
                if (this.fields && this.fields[fieldPath]) {
                    var configVal = this._getConfigVal(this.fields[fieldPath], configId);
                    if (!Alpaca.isEmpty(configVal)) {
                        return configVal;
                    }
                }
            }

            if (!Alpaca.isEmpty(topLevelOnly) && topLevelOnly && this.field.path != "/") {
                return null;
            }

            return this._getConfigVal(this, configId);
        },

        /**
         * Internal method for getting configuration.
         *
         * @private
         *
         * @param {Any} configVal configuration value.
         * @param {String} configId configuration id.
         *
         * @returns {Any} configuration mapping to the given id
         */
        _getConfigVal : function (configVal, configId) {
            if (Alpaca.isArray(configId)) {
                for (var i = 0; i < configId.length && !Alpaca.isEmpty(configVal); i++) {
                    configVal = configVal[configId[i]];
                }
            } else {
                if (!Alpaca.isEmpty(configVal)) {
                    configVal = configVal[configId];
                }
            }
            return configVal;
        },

        /**
         * Loads an injected style.
         *
         * @param id
         */
        getInjectedStyle: function(id)
        {
            var injectedStyle = null;

            var injections = {};
            if (this.style)
            {
                var _injections = Alpaca.styleInjections[this.style];
                if (_injections) {
                    Alpaca.mergeObject(_injections, injections);
                }
            }

            return injectedStyle[id];
        },

        /**
         * Executes a template.
         *
         * @param view
         * @param templateDescriptor
         * @param model
         */
        tmpl: function(templateDescriptor, model)
        {
            return Alpaca.tmpl(this, templateDescriptor, model);
        }

    });
})(jQuery);