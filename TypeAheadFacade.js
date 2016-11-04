(function(root, factory) {

    // Register Global Space
    root.com = root.com || {};
    root.com.package = root.com.package || {};

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            './dist/typeahead.jquery',
            './dist/bloodhound'
        ], function(
            $,
            typeahead,
            Bloodhound
        ) {
            return (root.com.package.TypeAheadFacade = factory(
                $,
                typeahead,
                Bloodhound
            ));
        });
    }

    // CommonJS
    else if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('jquery'),
            require('./dist/typeahead.jquery'),
            require('./dist/bloodhound')
        );
    }

    // Global
    else {
        root.com.package.TypeAheadFacade = factory(
            root.jQuery,
            root.jQuery.fn.typeahead,
            root.Bloodhound
        );
    }
}(this, function(
    $,
    typeahead,
    Bloodhound
) {

    typeahead = $.fn.typeahead.noConflict();
    Bloodhound = Bloodhound.noConflict();

    $.fn.typeahead = typeahead;

    /**
     * Create an auto-suggest style input
     * @class TypeAheadFacade
     * @param {jQuery} input
     * @param {Object} options
     * @property {String} options.selectorPrefix
     * @property {Object} options.typeAhead
     * @property {Number} options.typeAhead.minLength
     * @property {Boolean} options.typeAhead.multiSelect
     * @property {Number} options.typeAhead.maxSelections
     * @property {Boolean} options.typeAhead.highlight
     * @property {Boolean} options.typeAhead.hint
     * @property {Array.<Object>} options.dataSources
     * @property {String|Function|Array.<Object>|Array.<String>} options.dataSources.data
     * @property {String} options.dataSources.displayNode
     * @property {Object} options.dataSources.templates
     * @property {Function} options.dataSources.templates.empty
     * @property {Function} options.dataSources.templates.suggestion
     * @property {Function} options.dataSources.templates.header
     * @property {Function} options.dataSources.templates.footer
     * @property {Function} options.dataSources.templates.pending
     * @returns {TypeAheadFacade}
     * @example var foo = new TypeAheadFacade(inputElement, optionsObject);
     */
    function TypeAheadFacade(input, options) {

        /****************************************
         * Set private instance variables
         ****************************************/
            // Store reference to self
        var _that = this;

        // Pull in options
        var _options = options || {};

        // Get the base container
        var _input = input instanceof $ ? input : $(input);

        // Declare private instance variables
        var _cssPrefix = null;
        var _dotPrefix = null;
        var _isSelect = null;
        var _currentSelectionData = null;
        var _typeAheadOptions = null;
        var _classNamesCombined = null;
        var _classNames = null;
        var _dataSources = null;
        var _isMultiSelect = null;

        // Declare private instance jQuery objects
        var _select = null;
        var _multiSelectWrap = null;


        /****************************************
         * Set private instance methods
         ****************************************/
        /**
         * Set variables values
         * @method setVariableValues
         * @private
         * @returns {void}
         */
        function setVariableValues() {

            // Get CSS prefix
            _cssPrefix = _options.selectorPrefix ? _options.selectorPrefix : '';

            // Create selector prefix
            _dotPrefix = '.' + _cssPrefix;

            // Set private instance variable values
            _isSelect = _input.is('select');
            _select = _isSelect ? _input : null;
            _typeAheadOptions = $.extend(true, {}, _that.defaults.typeAhead, !!_options.typeAhead ? _options.typeAhead : {});
            _classNamesCombined = $.extend(true, {}, _that.defaults.typeAhead.classNames, !!_typeAheadOptions.classNames ? _typeAheadOptions.classNames : {});
            _classNames = {html: buildClassSelectors(_classNamesCombined, false), selectors: buildClassSelectors(_classNamesCombined, true)};
            _typeAheadOptions.classNames = _classNames.html;
            _dataSources = normalizeDataSources(!!_options.dataSources ? _options.dataSources : [{}]);
            _isMultiSelect = _typeAheadOptions.multiSelect;

            // Set jQuery instance objects
            _multiSelectWrap = _typeAheadOptions.multiSelect ? prepareMultiSelect(_input) : null;
            _input = _isSelect ? $('<input type="search" />').addClass(_select.prop('class')) : _input;
        }

        function escapeStringForHTML(stringToEscape) {

            // List of HTML entities for escaping.
            var escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' };
            var escapeKeys = [];
            for (var escapeKey in escapeMap) { escapeKeys.push(escapeKey); }

            // Function for escaping strings to HTML interpolation.
            function escapeString(entityMap) {

                // Regexes for identifying a key that needs to be escaped
                var source = '(?:' + escapeKeys.join('|') + ')';
                var testRegexp = RegExp(source);
                var replaceRegexp = RegExp(source, 'g');
                return function(string) {
                    string = string == null ? '' : '' + string;
                    return testRegexp.test(string) ? string.replace(replaceRegexp, function(stringToEscape) { return entityMap[stringToEscape]; }) : string;
                };
            }

            // Return escaped string
            return escapeString(escapeMap)(stringToEscape);
        };

        /**
         * Add wrappers around input to setup display of multiple selections
         * @method prepareMultiSelect
         * @param {jQuery} input
         * @private
         * @returns {jQuery}
         */
        function prepareMultiSelect(input) {

            // Wrap input
            input.wrap($('<ul class="' + _classNames.html.msWrapper + '"><li class="' + _classNames.html.msInput + '"/></ul>'));

            // Get input parent
            var wrapItem = input.parent();

            // Get multi-select container
            var mainWrap = wrapItem.parent();

            // Set wrap to input width
            mainWrap.css({"width": input.innerWidth()});

            // Reset input width
            input.css({"width": "inherit"});

            // Focus input on wrap click
            mainWrap.on('click', function () {
                input.focus();
            });

            return mainWrap;
        }

        /**
         * Hides select and creates text input in place of select
         * @method prepareSelect
         * @private
         * @returns {void}
         */
        function prepareSelect() {

            // Hide select element
            _select.hide();

            // Add the new input after the select which is hidden by CSS after the wrapping container is applied
            _input.insertAfter(_select);

            // For each pre-selected option
            _select.find('option[selected="selected"], option[selected]').each(function(index, element) {

                // Get option values/text
                var data = {
                    text : $.trim($(element).text()),
                    id : $.trim($(element).val())
                };

                // Ensure values exist
                if (
                    !!data.id &&
                    !!data.text
                ) {

                    // For multi select, add pre-selected items to list
                    if (_typeAheadOptions.multiSelect) {
                        addMultiSelectItem(data);
                    }

                    // For single input, add pre-selected value to type ahead
                    else {
                        _input.val(data.text);
                    }

                    // Update current selection data with latest value
                    _currentSelectionData = data;
                }
            });

            // Bind key down
            _input.on('keydown', function (event) {

                // On backspace and empty input
                if (event.which === 8 && _that.value.length === 0 && _typeAheadOptions.multiSelect) {

                    // Trigger remove multi-select item
                    _input.trigger('typeahead:removeMultiSelectItem', _multiSelectWrap.find(_classNames.selectors.msItemRemove).last());
                }
            });
        }

        /**
         * Adds a multi select item to the selection list
         * @method addMultiSelectItem
         * @param {Object} datum
         * @private
         * @returns {void}
         */
        function addMultiSelectItem(datum) {

            // Enforce maxSelections limit
            if (_typeAheadOptions.maxSelections > _multiSelectWrap.find(_classNames.selectors.msItem).length) {

                // Build selected item
                var dataDatum = typeof datum === 'object' ? JSON.stringify(datum) : datum;
                var itemValue = $('<span class="' + _classNames.html.msItemText + '">' + (!!datum.text ? datum.text : datum) + '</span>');
                var itemRemove = $('<span class="' + _classNames.html.msItemRemove + '">x</span>');
                var item = $('<li class="' + _classNames.html.msItem + '" data-datum=\'' + dataDatum.replace(/'/g, '&apos;') + '\'/>');
                item.html(itemValue.add(itemRemove));

                // Bind remove item
                itemRemove.on('click', function () {

                    // Trigger remove multi-select item
                    _input.trigger('typeahead:removeMultiSelectItem', $(this));
                });

                // Add item to end of list
                item.insertBefore(_input.parents(_classNames.selectors.msInput));

                // Update select options
                updateSelectOptions();
            }
        }

        /**
         * Update <select> options 'selected' attributes
         * @method updateSelectOptions
         * @private
         * @returns {void}
         */
        function updateSelectOptions() {

            // Ensure select exists
            if (_isSelect) {

                // Get all options
                var selectOptions = _select.find('option');

                // Clear all selections
                selectOptions.removeAttr('selected');

                // Get current selections
                var selections = getAllSelections();

                // Set selected options based on selection ids (option values)
                for (var o = 0; o < selectOptions.length; o++) {
                    for (var s = 0; s < selections.length; s++) {
                        if ($(selectOptions[o]).val() === selections[s].id) {
                            $(selectOptions[o]).attr('selected', 'selected');
                        }
                    }
                }
            }
        }

        /**
         * Returns current selections data array
         * @method getAllSelections
         * @private
         * @returns {Array.<Object>}
         */
        function getAllSelections() {

            // If multi select
            return _typeAheadOptions.multiSelect ?

                // Return array of data from selected items
                $.map(_multiSelectWrap.find(_classNames.selectors.msItem), function (item) {
                    return $(item).data('datum');
                }) :

                // Else return array of current selection
                _that.currentSelection === null ? [] : [_that.currentSelection];
        }

        /**
         * Clears current selection data, multi selection data and selected options
         * @method clearAllSelections
         * @private
         * @returns {void}
         */
        function clearAllSelections() {

            // Clear current selection
            _currentSelectionData = null;

            // Clear multi selections
            if (_typeAheadOptions.multiSelect) {
                _multiSelectWrap.find(_classNames.selectors.msItem).remove();
            }

            // If select exists
            if (_isSelect) {

                // Clear all option selections
                _select.find('option[selected="selected"], option[selected]').removeAttr('selected');
            }
        }

        /**
         * Loop through data sources and build Bloodhound and data source settings
         * @method normalizeDataSources
         * @param {Array.<Object>} dataSources
         * @private
         * @returns {Array.<Object>}
         */
        function normalizeDataSources(dataSources) {

            var normalizedDataSources = [];

            for (var i = 0; i < dataSources.length; i++) {

                var normalizedDataSource = {};

                var dataSource = dataSources[i];
                var data = !!dataSource.data ? dataSource.data : null;
                var isSelect = _isSelect;
                var isMultiSelect = _typeAheadOptions.multiSelect;
                var sourceObject = {

                    // Use default limit due to plugin source bug not displaying all suggestions
                    // Developer must use the filter function to limit items manually
                    limit: Infinity,

                    // Use provided name, else null generates one
                    name: !!dataSource.name ? dataSource.name : null,

                    // Use 'text' for all <select>s, else use provided node, else null is for non-object/string arrays
                    displayNode: !!isSelect ? 'text' : !!dataSource.displayNode ? dataSource.displayNode : null
                };

                // Local data
                if ($.isArray(data) || (!!data === false && isSelect)) {

                    // For non-<select> data
                    if ($.isArray(data) && !isSelect) {

                        // Clone local data source to prevent mutation of the original source
                        data = $.extend(true, [], data);
                    }

                    // Begin building normalized data source object
                    normalizedDataSource = {
                        source: sourceObject,
                        local: !!data ? data : []
                    };
                }

                // Remote data
                else if (typeof data === 'string') {

                    // Begin building normalized data source object
                    normalizedDataSource = {
                        source: sourceObject,
                        remote: {
                            url: data,
                            wildcard: !!dataSource.wildcard ? dataSource.wildcard : _that.defaults.dataSources[0].remote.wildcard,
                            filter: !!dataSource.filter ? dataSource.filter : _that.defaults.dataSources[0].remote.filter,
                            prepare: !!dataSource.prepare ? dataSource.prepare : _that.defaults.dataSources[0].remote.prepare
                        }
                    };
                }

                // Wrap with closure in order to properly access each source
                (function () {

                    // Get normalized source object
                    var source = normalizedDataSource.source;

                    // Define default templates
                    var defaultTemplates = {
                        empty: function (typeAheadData) {
                            return '<div class="' + _classNames.html.suggestion + '"><strong>' + escapeStringForHTML(typeAheadData.query) + '</strong> not found</div>';
                        },
                        suggestion: function (typeAheadData) {

                            // Try data display node
                            var displayNode = typeAheadData[source.displayNode];

                            // If data is an object use display node, else use data as string if no node specified
                            var displayText = !!displayNode ? displayNode : typeAheadData;
                            return '<div class="' + _cssPrefix + 'media">' +
                                (!!typeAheadData.image ? '<span class="' + _cssPrefix + 'media__img-wrap ' + _cssPrefix + 'circular-image"><img class="' + _cssPrefix + 'media__img" src="' + typeAheadData.image + '" alt="' + displayText + '" /></span>' : '') +
                                '<span class="' + _cssPrefix + 'media__body">' + displayText + '</span>' +
                                '</div>';
                        }
                    };

                    // Combine custom templates with defaults
                    var combinedTemplates = $.extend(true, {}, defaultTemplates, !!dataSource.templates ? dataSource.templates : {});

                    // Automatically generate local data for select based inputs
                    if (
                        // For select based inputs only
                        !!isSelect
                    ) {

                        // Set local data
                        normalizedDataSource.local = function () {

                            // Creating the suggestions objects from the select options
                            return $.map(_select.find('option'), function(item) {
                                return {
                                    id : $(item).val(),
                                    text : $(item).text()
                                };
                            });
                        }
                    }

                    // Add Bloodhound base object
                    normalizedDataSource.bloodhoundOptions = {};

                    // For local data
                    if (!!normalizedDataSource.local === true) {

                        // Normalize display node
                        source.displayKey = source.displayNode;

                        // Set Bloodhound datum tokenizer for local data
                        normalizedDataSource.bloodhoundOptions.datumTokenizer = function (datum) {

                            // Get tokenizer function using displayNode as the text to tokenize
                            return Bloodhound.tokenizers.whitespace(!!datum[source.displayNode] ? datum[source.displayNode] : datum);
                        };

                        // If multi select
                        if (isMultiSelect) {

                            // Get processed local data
                            var localData = typeof normalizedDataSource.local === 'function' ? normalizedDataSource.local() : normalizedDataSource.local;

                            // Extra data processing for hint inputs and multi selects
                            for (var l = 0; l < localData.length; l++) {

                                // If a 'text' node does not exist
                                if (typeof localData[l] === 'object' && !!localData[l].text === false) {

                                    // Add 'text' node for multi select selected item text
                                    localData[l].text = localData[l][source.displayNode];
                                }
                            }

                            // Update local data source
                            normalizedDataSource.local = localData;
                        }
                    }

                    // For remote data
                    else if (!!normalizedDataSource.remote === true) {

                        // Normalize display node
                        source.display = source.displayNode;

                        // Set Bloodhound datum tokenizer for remote data - sig:function(datum)
                        normalizedDataSource.bloodhoundOptions.datumTokenizer = function () {

                            // Get base tokenizer function
                            return Bloodhound.tokenizers.whitespace;
                        };

                        // If multi select and no filter already set
                        if (isMultiSelect || !!normalizedDataSource.remote.filter === false) {

                            // Add a 'text' node which is the same as the display node for the multi select item text display
                            normalizedDataSource.remote.filter = function (data) {

                                // Normalize response nodes
                                return $.map(!!data.data ? data.data : !!data.response ? data.response : data, function (item) {

                                    // If multi select
                                    if (_typeAheadOptions.multiSelect) {

                                        // If a 'text' node does not exist
                                        if (typeof item === 'object' && !!item.text === false) {

                                            // Add 'text' node for multi select selected item text
                                            item.text = item[source.displayNode];
                                        }
                                    }

                                    // Return item
                                    return item;
                                });
                            }
                        }
                    }

                    // Create Bloodhound search engine for data source
                    normalizedDataSource.bloodhound = new Bloodhound({
                        datumTokenizer: normalizedDataSource.bloodhoundOptions.datumTokenizer,
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        local: !!normalizedDataSource.local === true ? normalizedDataSource.local : null,
                        remote: !!normalizedDataSource.remote === true ? normalizedDataSource.remote : null
                    });

                    // Initialize Bloodhound search engine for data source
                    normalizedDataSource.bloodhound.initialize();

                    // Add Bloodhound data source settings
                    if (!!normalizedDataSource.source === true) {
                        normalizedDataSource.sourceOptions = normalizedDataSource.source;
                    }

                    // Build data source objects
                    normalizedDataSources.push($.extend(true, {}, {
                        source: normalizedDataSource.bloodhound.ttAdapter(),
                        templates: combinedTemplates
                    }, source));
                })();
            }

            // Return normalized data sources
            return normalizedDataSources;
        }

        /**
         * Generate Type Ahead
         * @method initializePlugin
         * @private
         * @returns {void}
         */
        function initializePlugin() {

            // Initialize the type ahead
            _input.typeahead(_typeAheadOptions, _dataSources);

            // Bind type events
            _input

            // Default selection behavior
                .on('typeahead:select', function(event, datum) {

                    // Save selection data on item selection
                    _currentSelectionData = datum;

                    // If multi-select
                    if (_typeAheadOptions.multiSelect) {

                        // Add multi select item
                        addMultiSelectItem(datum);

                        // Clear input for next selection
                        _that.value = '';
                    }
                    else {

                        // Update select options
                        updateSelectOptions();
                    }
                })

                // Default change behavior
                .on('typeahead:change', function(event, datum) {

                    // If user changed text value to one that does not exist in the select
                    if (
                        _isSelect &&
                        !_typeAheadOptions.multiSelect &&
                        (
                            (!!_that.currentSelection && _that.currentSelection.text !== datum) ||
                            _that.currentSelection === null
                        )
                    ) {

                        // Clear select options selection on text mismatch
                        clearAllSelections();
                    }
                })

                // Default multi select item removal behavior
                .on('typeahead:removeMultiSelectItem', function(event, element) {

                    // Clear selection data on item selection
                    _currentSelectionData = null;

                    // Remove multi-select item
                    $(element).parents(_classNames.selectors.msItem).remove();

                    // Update select options
                    updateSelectOptions();
                })

                // Show loading spinner on async request start - sig:function(event)
                .on('typeahead:asyncrequest', function () {
                    $(this).parent().find(_classNames.selectors.hint).addClass('loading');
                })

                // Hide loading spinner on async request end - sig:function(event)
                .on('typeahead:asyncreceive', function () {
                    $(this).parent().find(_classNames.selectors.hint).removeClass('loading');
                })

                .on('typeahead:asynccancel', function () {
                    $(this).parent().find(_classNames.selectors.hint).removeClass('loading');
                });
        }

        /**
         * Build class selectors from non-selector text
         * @method buildClassSelectors
         * @param {Object} classes
         * @param {Boolean} dot
         * @private
         * @returns {Object}
         */
        function buildClassSelectors(classes, dot) {
            var selectors = {};
            for (var prop in classes) {
                if (classes.hasOwnProperty(prop)) {
                    selectors[prop] = (dot ? _dotPrefix : _cssPrefix) + classes[prop];
                }
            }
            return selectors;
        }


        /****************************************
         * Set public instance getters and setters
         ****************************************/


        /****************************************
         * Set public instance methods
         ****************************************/
        /**
         * Get TypeAheadFacade input element
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#getInput
         * @public
         * @returns {jQuery}
         * @example var foo = myTypeAhead.getInput();
         */
        this.getInput = function() { return _input; };

        /**
         * Get TypeAheadFacade select element
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#getSelect
         * @public
         * @returns {jQuery}
         * @example var foo = myTypeAhead.getSelect();
         */
        this.getSelect = function() { return _select; };

        /**
         * Get TypeAheadFacade current selection datum from data source / filter method
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#getCurrentSelection
         * @public
         * @returns {Object|String|null}
         * @example var foo = myTypeAhead.getCurrentSelection();
         */
        this.getCurrentSelection = function() { return _currentSelectionData; };

        /**
         * Get TypeAheadFacade current selections datum from data source / filter method
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#getAllSelections
         * @public
         * @returns {Array.<Object>|Array.<String>|Array}
         * @example var foo = myTypeAhead.getAllSelections();
         */
        this.getAllSelections = function() { return getAllSelections(); };

        /**
         * Get TypeAheadFacade generated wrapping element (usually a <span> of the 'twitter-typeahead' class)
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#getWrapper
         * @public
         * @returns {jQuery|JQuery}
         * @example var foo = myTypeAhead.getWrapper();
         */
        this.getWrapper = function() { return _input.parents(_typeAheadOptions.multiSelect ? _classNames.selectors.msWrapper : _classNames.selectors.wrapper).first(); };

        /**
         * Adds a multi select item to the selection list
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#addMultiSelectItem
         * @public
         * @param {Object} datum
         * @returns {Array.<Object>|Array.<String>|Array}
         * @example myTypeAhead.addMultiSelectItem({text: 'New Item', id: '123'}); // Add item with given datum to selected list
         */
        this.addMultiSelectItem = function (datum) {
            if (_isMultiSelect) {
                addMultiSelectItem(datum);
                return getAllSelections();
            } else {
                return null;
            }
        };

        /**
         * Removes a multi select item at a given index
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#removeMultiSelectItem
         * @public
         * @param {Number} index
         * @returns {Array.<Object>|Array.<String>|Array}
         * @example myTypeAhead.removeMultiSelectItem(0); // Remove first item in selected list
         */
        this.removeMultiSelectItem = function (index) {
            if (_isMultiSelect) {
                $(_multiSelectWrap.find(_classNames.selectors.msItemRemove)[index]).click();
                updateSelectOptions();
                return getAllSelections();
            } else {
                return null;
            }
        };

        /**
         * Resets and clears the current/latest selection data
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#clearCurrentSelection
         * @public
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.clearCurrentSelection();
         */
        this.clearCurrentSelection = function () {
            _currentSelectionData = null;
            return _that;
        };

        /**
         * Resets and clears all current selection data
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#clearAllSelections
         * @public
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.clearAllSelections();
         */
        this.clearAllSelections = function () {
            clearAllSelections();
            return _that;
        };

        /**
         * Returns type ahead input element to its original state
         * @memberOf TypeAheadFacade
         * @alias TypeAheadFacade#destroy
         * @public
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.destroy();
         */
        this.destroy = function () {
            _input.typeahead('destroy');
            clearAllSelections();
            return _that;
        };

        /**
         * Getter: Get default TypeAheadFacade options
         * @memberOf TypeAheadFacade
         * @returns {Object}
         * @example var foo = myTypeAhead.defaults;
         */
        Object.defineProperty(this, 'defaults', {
            get: function() {
                return {
                    typeAhead: {
                        minLength: 1,
                        multiSelect: false,
                        maxSelections: 5,
                        highlight: true, // If true, wraps pattern matches in a <strong> element
                        hint: true, // If false, the type ahead will not show a hint (makes main input transparent to show hint input behind)
                        classNames: {
                            wrapper: 'twitter-typeahead',
                            input: 'tt-input',
                            hint: 'tt-hint',
                            menu: 'tt-menu',
                            dataset: 'tt-dataset',
                            suggestion: 'tt-suggestion',
                            selectable: 'tt-selectable',
                            empty: 'tt-empty',
                            open: 'tt-open',
                            cursor: 'tt-cursor',
                            highlight: 'tt-highlight',
                            msWrapper: 'tt-multi-select',
                            msItem: 'tt-multi-select-item',
                            msItemText: 'tt-multi-select-item-text',
                            msItemRemove: 'tt-multi-select-item-remove',
                            msInput: 'tt-multi-select-input'
                        }
                    },
                    dataSources: [
                        {
                            source: {
                                name: null,
                                limit: Infinity
                            },
                            templates: {
                                empty: null, // function(Object:query) {return String:html}
                                suggestion: null, // function(Object:data) {return String:html}
                                header: null, // function(Object:data) {return String:html}
                                footer: null, // function(Object:data) {return String:html}
                                pending: null // function(Object:query) {return String:html}
                            },
                            local: null,
                            remote: {
                                url: null,
                                wildcard: '%QUERY',
                                filter: null, // function(Array.<String>|Array.<Object>:data) {return Array.<String>|Array.<Object>:data}
                                prepare: null // function(String:query, Object:settings){return String:url;}
                            }
                        }
                    ]
                }
            }
        });


        /****************************************
         * Initialize
         ****************************************/
        setVariableValues();
        if (_isSelect) { prepareSelect(); }
        initializePlugin();
    }


    /****************************************
     * Set prototype methods
     ****************************************/
    /**
     * @memberOf TypeAheadFacade
     */
    TypeAheadFacade.prototype = {

        /**
         * TypeAheadFacade constructor
         */
        constructor: TypeAheadFacade,

        /**
         * Getter: Get TypeAheadFacade input value
         * @memberOf TypeAheadFacade
         * @returns {String}
         * @example var foo = myTypeAhead.value;
         */
        get value() { return this.getInput().typeahead('val'); },

        /**
         * Setter: Set TypeAheadFacade input value
         * @memberOf TypeAheadFacade
         * @param {String} newValue
         * @returns {void}
         * @example myTypeAhead.value = foo;
         */
        set value(newValue) { this.getInput().typeahead('val', newValue); },

        /**
         * Getter: Get TypeAheadFacade input element
         * @memberOf TypeAheadFacade
         * @returns {jQuery}
         * @example var foo = myTypeAhead.input;
         */
        get input() { return this.getInput(); },

        /**
         * Getter: Get TypeAheadFacade select element
         * @memberOf TypeAheadFacade
         * @returns {jQuery}
         * @example var foo = myTypeAhead.select;
         */
        get select() { return this.getSelect(); },

        /**
         * Getter: Get TypeAheadFacade current selection datum from data source / filter method
         * @memberOf TypeAheadFacade
         * @returns {*}
         * @example var foo = myTypeAhead.currentSelection;
         */
        get currentSelection() { return this.getCurrentSelection(); },

        /**
         * Getter: Get TypeAheadFacade current selections datum from data source / filter method
         * Typically used for multi select TypeAheadFacade instances
         * @memberOf TypeAheadFacade
         * @returns {Array.<*>}
         * @example var foo = myTypeAhead.allSelections;
         */
        get allSelections() { return this.getAllSelections(); },

        /**
         * Getter: Get TypeAheadFacade generated wrapping element (usually a <span> of the 'twitter-typeahead' class)
         * @memberOf TypeAheadFacade
         * @returns {jQuery}
         * @example var foo = myTypeAhead.wrapper;
         */
        get wrapper() { return this.getWrapper(); },

        /**
         * Bind custom input change/blur event
         * @memberOf TypeAheadFacade
         * @param {Function} callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onChange(function(inputValue) {});
         */
        onChange: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:change', function (event, inputValue) {
                    callback.call(_that, inputValue);
                });
            }
            return _that;
        },

        /**
         * Bind custom select item event
         * @memberOf TypeAheadFacade
         * @param {Function} callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onSelect(function(datum) {});
         */
        onSelect: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:select', function (event, datum) {
                    callback.call(_that, datum);
                });
            }
            return _that;
        },

        /**
         * Bind custom multi select item removal event
         * @memberOf TypeAheadFacade
         * @param {Function} [callback]
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onRemoveMultiSelectItem(function(element) {});
         */
        onRemoveMultiSelectItem: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:removeMultiSelectItem', function (event, element) {
                    callback.call(_that, element);
                });
            }
            return _that;
        },

        /**
         * Bind custom open event each time a new menu is opened
         * @memberOf TypeAheadFacade
         * @param {Function} callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onOpen(function(datum) {});
         */
        onOpen: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:open', function (event, datum) {
                    callback.call(_that, datum);
                });
            }
            return _that;
        },

        /**
         * Bind custom close event each time a new menu is closed
         * @memberOf TypeAheadFacade
         * @param callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onClose(function(datum) {});
         */
        onClose: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:close', function (event, datum) {
                    callback.call(_that, datum);
                });
            }
            return _that;
        },

        /**
         * Bind custom render event that triggers each time a new menu is rendered
         * @memberOf TypeAheadFacade
         * @param {Function} [callback]
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onRender(function(datum) {});
         */
        onRender: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:render', function (event, datum) {
                    callback.call(_that, datum);
                });
            }
            return _that;
        },

        /**
         * Bind custom event that triggers each time a remote request for suggestions is made
         * @memberOf TypeAheadFacade
         * @param {Function} [callback]
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onAsyncStart(function(event) {});
         */
        onAsyncStart: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:asyncrequest', function (event) {
                    callback.call(_that, event);
                });
            }
            return _that;
        },

        /**
         * Bind custom event that triggers each time a remote request for suggestions is finished
         * @memberOf TypeAheadFacade
         * @param {Function} [callback]
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onAsyncFinish(function(event) {});
         */
        onAsyncFinish: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:asyncreceive', function (event) {
                    callback.call(_that, event);
                });
            }
            return _that;
        },

        /**
         * Bind custom active event
         * @memberOf TypeAheadFacade
         * @param callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onActive(function(event) {});
         */
        onActive: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:active', function (event) {
                    callback.call(_that, event);
                });
            }
            return _that;
        },

        /**
         * Bind custom idle event
         * @memberOf TypeAheadFacade
         * @param callback
         * @returns {TypeAheadFacade}
         * @example myTypeAhead.onIdle(function(event) {});
         */
        onIdle: function (callback) {
            var _that = this;
            if (typeof callback === 'function') {
                _that.input.on('typeahead:idle', function (event) {
                    callback.call(_that, event);
                });
            }
            return _that;
        }
    };

    // Export the module
    return TypeAheadFacade;
}));
