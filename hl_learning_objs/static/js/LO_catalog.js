/*
    Learning Objective LO_catalog
        object containing the structure of learning objectives
        mapping the learning level to its definition/verbs
        and providing a listing of ABET outcomes
*/

function LO_catalog(){

    this.data = {
        0: {
            "display_name": "Remembering",
            "def": "Remembering involves recognizing or recalling relevant facts, terms, concepts, knowledge, or answers.",
            "verbs": [
                    "define",
                    "describe",
                    "identify",
                    "label",
                    "list",
                    "match",
                    "name",
                    "order",
                    "recall",
                    "select",
                ],
            "get_verb": _get_verb,
        },
        1: {
            "display_name": "Understanding",
            "def": "Understanding involved constructing meaning from instructional messages.",
            "verbs": [
                    "illustrate",
                    "compare",
                    "distinguish",
                    "estimate",
                    "explain",
                    "classify",
                    "interpret",
                    "predict",
                    "summarize",
                    "translate",
                ],
            "get_verb": _get_verb,
        },
        2: {
            "display_name": "Applying",
            "def": "Applying involves using ideas and concepts to solve problems.",
            "verbs": [
                    "organize",
                    "solve",
                    "demonstrate",
                    "discover",
                    "modify",
                    "operate",
                    "predict",
                    "prepare",
                    "produce",
                    "relate",
                    "solve",
                    "choose",
                ],
            "get_verb": _get_verb,
        },
        3: {
            "display_name": "Analyzing",
            "def": "Analyzing involves breaking something down into components, seeing relationships and overall structure.",
            "verbs": [
                    "analyze",
                    "break down",
                    "compare",
                    "select",
                    "contrast",
                    "deconstruct",
                    "discriminate",
                    "distinguish",
                    "differentiate",
                    "outline",
                    "interelate",
                ],
            "get_verb": _get_verb,
        },
        4: {
            "display_name": "Evaluating",
            "def": "Evaluating involves making judgments based on criteria and standards.",
            "verbs": [
                    "rate",
                    "assess",
                    "monitor",
                    "check",
                    "test",
                    "judge",
                    "critique",
                    "recommend",
                    "interpret",
                    "weigh",
                ],
            "get_verb": _get_verb,
        },

        5: {
            "display_name": "Creating",
            "def": "Creating involves reorganizing diverse elements to form a new pattern or structure.",
            "verbs": [
                    "generate",
                    "plan",
                    "compose",
                    "develop",
                    "create",
                    "invent",
                    "organize",
                    "construct",
                    "produce",
                    "compile",
                    "design",
                    "devise",
                ],
            "get_verb": _get_verb,
        },

    }

    this.ABET_outcomes = [
        "An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics",
        "An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors",
        "An ability to communicate effectively with a range of audiences",
        "An ability to recognize ethical and professional responsibilities in engineering situations and make informed judgments, which must consider the impact of engineering solutions in global, economic, environmetal, and societal contexts",
        "An ability to function effectively on a team whose members together provide leadership, create a collaborative and inclusive environmetna, establish goals, plan tasks, and meet objectives",
        "An ability to develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgement to draw conclusions",
        "An ability to acquire and apply new knowledge as needed, using appropriate learning strategies",
    ]

    // internal method used in learning levels
    //      for getting a verb by it's index
    // NOTE: not for use with the base object
    _get_verb = function(id){
        if(typeof(this.verbs) == "undefined") throw Error("Learning Objective Catalog: The _get_verb method was called on an object that doesn't contain a 'verbs' listing");
        if(typeof(this.verbs[id]) == "undefined") throw Error("Learning Objective Catalog: Verb matching the provided id does not exist!")

        return this.verbs[id];

    }
}

    LO_catalog.prototype._generate_ABET_selection = function(){
        // generate a wrapper for the checkbox listing of the
        //  available ABET_outcomes
        var wrapper = $('<div />', {
            class:"ABET_selection_wrapper",
        });

        // for each of the abet outcomes generate a checkable entry
        // and append to the wrapper.
        $.each(this.ABET_outcomes, function(i,outcome){
            var option = $("<label />", {
                "class": "ABET_Label",
                "text": outcome,

            }).prepend($("<input />", {
                "class": "ABET_input",
                "type": "checkbox",
                "value": i,

            }));

            wrapper.append(option);
        })

        // return the listing element
        return wrapper;
    }

    LO_catalog.prototype._generate_level_selection = function(){
        var catalog = this;
        //  generate a select box listing the possible learning levels
        var wrapper = $('<div />', {
            class:"learning_level_wrapper",
        });

        var selection = $('<select />', {
            id:"learning_level_selection",
            class:"learning_level_selection",
        });

        wrapper.append(selection);

        // create a default 'null' option for the selection
        selection.append($('<option />', {
                class:"learning_level_option",
                value: null,
                text: "Select Level...",
            })
        );

        $.each(catalog.data, function(key, value){
            var option = $('<option />', {
                class:"learning_level_option",
                value: key,
                text: value,
            });

            selection.append(option);

            // generate child verb listings for each levels
            wrapper.append(catalog._generate_verb_selection(key));
        })

        // bind event to selection change to show/hide verb selections
        $(selection).change(function(){
            var wrapper = $(this).closest('.learning_level_wrapper')
            var val = this.val();

            wrapper.find('.learning_verb_wrapper').hide();
            wrapper.find('.learning_verb_wrapper').val(null);
            wrapper.find('.learning_verb_wrapper[data-level={0}]'.format(val)).show();

        })

        return wrapper;
    }

    LO_catalog.prototype._generate_verb_selection = function(level_id){
        // ensure the level_id is accounted for in catalog data
        if(typeof(this.data[level_id]) == "undefined") throw Error("the requested 'level_id' isn't present in the data catalog!");
        if(typeof(this.data[level_id].verbs) == "undefined") throw Error("the requested 'level_id' object doesn't contain any predefined verbs!");

        // genearte a select box listing the possible verbs for a specified learning level
        var selection = $('<select />', {
            id:"verbs_select_{0}".format(level_id),
            class:"learning_verb_wrapper",
            "data-level": level_id,
        });

        // create a default 'null' option for the selection
        selection.append($('<option />', {
                class:"learning_level_option",
                value: null,
                text: "Select Level...",
            })
        );

        $.each(this.data[level_id].verbs, function(id, value){
            var option = $("<option />", {
                class: 'verb_option',
                value: id,
                text: value,
            });

            selection.append(option);
        })

        return selection;
    }

    LO_catalog.prototype.get_level = function(id){
        if(typeof(this.data[id]) == "undefined") throw Error("Learning Objective Catalog: Learning Level matching the provided id does not exist!")
        return this.levels[id];
    }

    LO_catalog.prototype.objective_str = function(level_id,verb_id, condition, task, degree){
        return "{0} {1} {2} {3}".format(condition, this.data[level_id].get_verb(verb_id), task, degree);
    }

    LO_catalog.prototype.list_outcomes = function(outcome_ids){
        // create a wrapper for the listing
        var wrapper = $('<div />',{
            class: "ABET_listing_wrapper",
        });
        // create the listing object
        var listing = $('<ul />', {
            class: "ABET_listing"
        })

        // append listing to wrapper
        wrapper.append(listing);

        // for each specified outcome id in the listing
        // generate a list item and append it to the listing
        $.each(outcome_ids, function(i, value){
            var outcome = $('<li />', {
                class: "ABET_outcome",
                text: value,
            });

            listing.append(outcome)
        });

        return wrapper;

    }
