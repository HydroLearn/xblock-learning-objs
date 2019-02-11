/*
    Learning Objective LO_catalog
        object containing the structure of learning objectives
        mapping the learning level to its definition/verbs
        and providing a listing of ABET outcomes
*/
function LO_catalog(){

    data = {
        1: {
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
        2: {
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
        3: {
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
        4: {
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
        5: {
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

        6: {
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

    ABET_outcomes = [
        "An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics",
        "An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare, as well as global, cultural, social, environmental, and economic factors",
        "An ability to communicate effectively with a range of audiences",
        "An ability to recognize ethical and professional responsibilities in engineering situations and make informed judgments, which must consider the impact of engineering solutions in global, economic, environmetal, and societal contexts",
        "An ability to function effectively on a team whose members together provide leadership, create a collaborative and inclusive environmetna, establish goals, plan tasks, and meet objectives",
        "An ability to develop and conduct appropriate experimentation, analyze and interpret data, and use engineering judgement to draw conclusions",
        "An ability to acquire and apply new knowledge as needed, using appropriate learning strategies",
    ]

    _generate_ABET_selection = function(){
        // generate a checkbox listing of the available ABET_outcomes
    }

    _generate_level_listing = function(){
        //  generate a select box listing the possible learning levels


    }

    _generate_verb_listing = function(level_id){
        // genearte a select box listing the possible verbs for a specified learning level
    }

    get_level = function(id){
        if(typeof(this.data[id]) == "undefined") throw Error("Learning Objective Catalog: Learning Level matching the provided id does not exist!")
        return this.levels[id]
    }

    // internal method used in learning levels
    //      for getting a verb by it's index
    // NOTE: not for use with the base object
    _get_verb = function(id){
        if(typeof(this.verbs) == "undefined") throw Error("Learning Objective Catalog: The _get_verb method was called on an object that doesn't contain a 'verbs' listing");
        if(typeof(this.verbs[id]) == "undefined") throw Error("Learning Objective Catalog: Verb matching the provided id does not exist!")

        return this.verbs[id];

    }

    objective_str = function(level_id,verb_id, condition, task, degree){
        return "{0} {1} {2} {3}".format(condition, this.data[level_id].get_verb(verb_id), task, degree);
    }

    list_outcomes = function(outcome_ids){
        return "this should print a list of the outcomes matching the following ids: {0}".format(outcome_ids.join(', '));

    }
}
