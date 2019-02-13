/*
    object to represent a learning objective based off of catalog data
*/
function Learning_obj(level, verb, condition, task, degree, outcomes){

    // error checking
    if(!(!!level && typeof(level) == "string" && !isNaN(parseInt(level)))) throw Error("Learning Objective: level must be an integer string")
    if(!(!!verb && typeof(verb) == "string" && !isNaN(parseInt(verb)))) throw Error("Learning Objective: verb must be an integer string")
    if(!(!!condition && typeof(condition) == "string")) throw Error("Learning Objective: condition must be a string")
    if(!(!!task && typeof(task) == "string")) throw Error("Learning Objective: task must be a string")
    if(!(!!degree && typeof(degree) == "string")) throw Error("Learning Objective: degree must be a string")
    if(!(!!outcomes && Array.isArray(outcomes))) throw Error("Learning Objective: outcomes must be an array of integer string id's")

    // catalog id's for learning level/verb
    this.level = level;
    this.verb = verb;

    // strings generated during building of learning objective
    this.condition = condition;
    this.task = task;
    this.degree = degree;

    // list of abet strings
    this.ABET_ids = outcomes;


}
    // method to output learning objective string from stored values
    Learning_obj.prototype.as_str = function(){
        return "{0} {1} {2} {3}.".format(
                this.condition,
                this.verb,  // this needs to be revised to call the catalog for verb value
                this.task,
                this.degree
            )
    }

    // method to output a json object representing the learning objective
    Learning_obj.prototype.as_obj = function(){
        return {
            'condition': this.condition,
            'level': this.level,
            'verb': this.verb,
            'task': this.task,
            'degree': this.degree,
            "ABET_ids": this.ABET_ids,
        }
    }

    Learning_obj.prototype.outcomes = function(){
        return null;
    }



/*
    Learning Objective LO_catalog
        object containing the structure of learning objectives
        mapping the learning level to its definition/verbs
        and providing a listing of ABET outcomes
*/

function LO_catalog(initial_catalog){

    this.data = initial_catalog.levels;
    this.ABET_outcomes = initial_catalog.ABET;

    // the existing items generated by the catalog
    //  this list will be used to store generated learning objectives
    this._items = []

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
        var self = this;
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
                value: "None",
                text: "Select Level...",
            })
        );

        $.each(self.data, function(key, value){
            var option = $('<option />', {
                class:"learning_level_option",
                value: key,
                text: value.display_name,
            });

            selection.append(option);

            // generate child verb listings for each levels
            wrapper.append(self._generate_verb_selection(key));
        })

        // bind event to selection change to show/hide verb selections
        $(selection).change(self.learning_level_change_evt);

        return wrapper;
    }

    LO_catalog.prototype._generate_verb_selection = function(level_id){

        // ensure the level_id is accounted for in catalog data
        if(typeof(this.data[level_id]) == "undefined") throw Error("the requested 'level_id' isn't present in the data catalog!");
        if(typeof(this.data[level_id].verbs) == "undefined") throw Error("the requested 'level_id' object doesn't contain any predefined verbs!");

        // genearte a select box listing the possible verbs for a specified learning level
        var selection = $('<select />', {
            id:"verbs_select_{0}".format(level_id),
            class:"learning_verb_selection",
            "data-level": level_id,

        });

        // create a default 'null' option for the selection
        selection.append($('<option />', {
                class:"verb_option",
                value: "None",
                text: "Select Action...",
            })
        );

        $.each(this.data[level_id].verbs, function(id, value){
            var option = $("<option />", {
                class: 'verb_option',
                value: id,
                text: value,
            });

            selection.append(option);
        });

        return selection;
    }

    LO_catalog.prototype.learning_level_change_evt = function(){

        var wrapper = $(this).closest('.learning_level_wrapper')
        var val = $(this).val();

        wrapper.find('.learning_verb_selection').removeClass('active');
        wrapper.find('.learning_verb_selection').val("None");

        var associated_verb_select = wrapper.find('.learning_verb_selection[data-level={0}]'.format(val))
        associated_verb_select.addClass('active')


    }

    LO_catalog.prototype.get_level = function(id){
        if(typeof(this.data[id]) == "undefined") throw Error("Learning Objective Catalog: Learning Level matching the provided id does not exist!")
        return this.levels[id];
    }

    LO_catalog.prototype.objective_str = function(level_id,verb_id, condition, task, degree){
        //return "{0} {1} {2} {3}".format(condition, this.data[level_id].get_verb(verb_id), task, degree);
        throw Error('non implemented')
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

    LO_catalog.prototype.item_list = function(){
        return this._items;
    }

    LO_catalog.prototype.add_item = function(new_learning_obj){
        if(!(new_learning_obj instanceof Learning_obj)) throw Error('Catalog only accepts Learning_obj items')

        this._items.push(new_learning_obj);
    }

    LO_catalog.prototype.remove_item = function(item_index){
        // remove the item at the passed index;
        this._items.splice(item_index,1);
    }

    // import the json list conatining existing learning objectives
    LO_catalog.prototype.import_objectives = function(obj_list){
        var self = this;

        $.each(obj_list, function(i, item){
            var new_item = new Learning_obj(
                    item.level,
                    item.verb,
                    item.condition,
                    item.task,
                    item.degree,
                    item.outcomes
                );
            self.add_item(new_item);
        });



    }

    // export the current colleciton of learning objectives as a json obj list
    LO_catalog.prototype.export_objectives = function(){
        return this._items;
    }

    LO_catalog.prototype.verb_validation = function(){
        var level_selected = !!$('#learning_level_selection').val() && $('#learning_level_selection').val() != "None";
        var verb_selected = !!$(".learning_verb_selection.active").val() && $(".learning_verb_selection.active").val() != "None";

        return level_selected && verb_selected;
    }
