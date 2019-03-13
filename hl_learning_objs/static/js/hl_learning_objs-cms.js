/* JavaScript for HydroLearn's learning objectives XBlock, Studio Side. */
function HL_LO_XBlockStudio(runtime, xblock_element, viewbag) {

    /* -----------------------------
        initial configuration/data import
    -----------------------------*/
    // add modal tag so it's width gets adjusted on window resize
    $(xblock_element).closest('.modal-window').addClass('hl_resize_correction');


    // initialize the learning objecives data catalog with the provided blooms_catalog
    var catalog = new LO_catalog(
                        '#learning_obj_collection',
                        JSON.parse(viewbag.blooms_catalog),
                        true
                    );

    // assuming existing objects were provided parse the records and import them
    var existing = JSON.parse(viewbag.objs);
    catalog.import_records(existing);


    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    /* -----------------------------
        View Methods
    -----------------------------*/

    function initialize_forms(){
        $('.action_input', xblock_element).append(catalog._generate_level_selection());
        $('.abet_input', xblock_element).append(catalog._generate_ABET_selection());

        // by default hide the creation form until called
        $('#learning_obj_creation', xblock_element).hide()

        // update the listing display now that the data has been imported
        update_listing();

    }

    function reset_wizard(){
        // reset input values
        // $("#condition", xblock_element).val("");
        // $("#task", xblock_element).val("");
        // $("#degree", xblock_element).val("");
        // $("#learning_level_selection", xblock_element).val("None");
        // $(".learning_verb_selection.active", xblock_element).val("None");
        // $(".learning_verb_selection.active", xblock_element).removeClass('active');
        // $(".ABET_selection_wrapper input:checked", xblock_element).prop('checked', false);

        // destroy and reinitalize wizard (reset)
        $('#learning_obj_wizard', xblock_element).steps('destroy');
        initialize_steps();

    }

    function initialize_steps(){
        /*
            initialize the wizard instance and bind events to inputs
            after creation
        */

        $("#learning_obj_wizard", xblock_element).steps({
                    headerTag: "h2",
                    bodyTag: "section",
                    transitionEffect: "fade",

                    onStepChanging: function (event, currentIndex, newIndex)
                    {
                        // Always allow previous action even if the current form is not valid
                        if (currentIndex > newIndex) return true;


                        // map the known steps to add validation before proceeding
                        //  to next step
                        var step_mapping = {
                            "introduction":    0,
                            "condition":    1,
                            "action":       2,
                            "task":         3,
                            "degree":       4,
                            "abet":         5,
                            "review":       6,
                        }


                        var valid_input = true;
                        var exempt = false;

                        switch(currentIndex){
                            case step_mapping.condition:
                                // condition
                                exempt = $("#condition_exclude",xblock_element).is(':checked');
                                valid_input = exempt || ($("#condition", xblock_element).val().trim().length > 0);
                                break;
                            case step_mapping.action:
                                // verb/Action

                                var level_select = $('#learning_level_selection', xblock_element);
                                var verb_select = $(".learning_verb_selection.active", xblock_element);

                                var level_valid = !!level_select.val() && level_select.val() != "None";
                                var verb_valid = !!verb_select.val() && verb_select.val() != "None";

                                valid_input = level_valid && verb_valid;
                                break;
                            case step_mapping.task:
                                // task
                                valid_input = $("#task", xblock_element).val().trim().length > 0
                                break;
                            case step_mapping.degree:
                                // degree
                                exempt = $("#degree_exclude",xblock_element).is(':checked');
                                valid_input = exempt || ($("#degree", xblock_element).val().trim().length > 0);
                                break;

                            default: break;

                        }


                        return valid_input;
                    },

                    onFinished: function (event, currentIndex)
                    {
                        // collect the selected ABET outcomes
                        var outcomes_ids = $(".ABET_selection_wrapper input:checked", xblock_element).map(function(){
                                              return $(this).val();
                                            }).get();

                        // determine if condition and/or degree are exempt
                        var condition_exempt = $("#condition_exclude", xblock_element).is(':checked');
                        var degree_exempt = $("#degree_exclude", xblock_element).is(':checked');

                        // grab all input field values
                        var values_dictionary = {
                            "condition": (condition_exempt)? "": $("#condition", xblock_element).val().trim(),
                            "task": $("#task", xblock_element).val().trim(),
                            "degree": (degree_exempt) ? "" :$("#degree", xblock_element).val().trim(),
                            "level_id": $("#learning_level_selection option:selected", xblock_element).val(),
                            "level": $("#learning_level_selection option:selected", xblock_element).text(),
                            'verb_id': $(".learning_verb_selection.active option:selected", xblock_element).val(),
                            "verb": $(".learning_verb_selection.active option:selected", xblock_element).text(),
                            "outcomes": outcomes_ids,
                        }

                        // generate new catalog record
                        var new_LO = new catalog.record(
                                values_dictionary["level_id"],
                                values_dictionary["verb_id"],
                                values_dictionary["condition"],
                                values_dictionary["task"],
                                values_dictionary["degree"],
                                values_dictionary["outcomes"]
                            )

                        //catalog.update_record_order();

                        // add record to catalog
                        catalog.add_record(new_LO);

                        // update the listing of learning objectives
                        update_listing();

                        // switch back to preview mode
                        editor_toggle();

                        // reset the wizard instance to be ready for the next one
                        reset_wizard();

                    }
                });

                update_preview()
                bind_input_evts();

    }

    function update_preview(){
        // get the wizard and each of the preview boxes
        var wizard = $('#learning_obj_wizard', xblock_element);
        var preview_boxes = $('.wizard_preview', wizard);

        // clear out current previews
        preview_boxes.html("");

        // generate ordered list of inputs based on steps
        var obj_parts = [];

        // collect the input values
        if(!$('#condition_exclude', wizard).is(':checked')){
            var condition_str = $('#condition', wizard).val().trim();
            if(!!condition_str){
                    obj_parts.push(condition_str.concat(','));
            }

        }

        var verb_selection = $('.learning_verb_selection.active', wizard);
        if(verb_selection.length && verb_selection.val() != 'None' && !!verb_selection.find('option:selected', wizard).text().trim()){
            obj_parts.push('the student will be able to '.concat(verb_selection.find('option:selected', wizard).text().trim()));
        }


        obj_parts.push($('#task', wizard).val().trim());

        if(!$('#degree_exclude', wizard).is(':checked')){
            obj_parts.push($('#degree', wizard).val().trim());
        }

        var preview_string = "";
        var complete = true;
        $.each(obj_parts, function(i, val){
            // add space before if not the first element
            if(i != 0) preview_string += ' ';

            // if the value isn't empty append it to the preview string
            if(!!val){
                preview_string += val;
            }else{
                // otherwise show ellipses, and break the loop (showing more work ahead)
                preview_string += '... ';
                complete = false;
                return false;
            }

        });

        // always punctuate complete sentences...
        if(complete){
                preview_string += '.';
        }
        //capatilize first character
        preview_string = preview_string.charAt(0).toUpperCase() + preview_string.slice(1);


        preview_boxes.append(preview_string);
    }

    function update_ABET_review(){
        // get the wizard
        var wizard = $('#learning_obj_wizard', xblock_element);

        // clear the current review contents
        $('.ABET_review', wizard).html("");

        // generate the abet listing
        var listing = $("<ul />")
        $('.abet_input .ABET_input:checked', wizard).each(function(i, elem){
            listing.append($('<li />', {
                text: $(this).parent('.ABET_Label').text()
            }));
        })

        // add the generated listing to the review box
        $('.ABET_review', wizard).append(listing);
    }

    function disable_condition_input(event){
        if($(this).is(":checked")) {
            $("#condition", xblock_element).attr('disabled', true);

        }else{
            $("#condition", xblock_element).removeAttr('disabled');
        }
        update_preview();
    }

    function disable_degree_input(){
        if($(this).is(":checked")) {
            $("#degree", xblock_element).attr('disabled', true);

        }else{
            $("#degree", xblock_element).removeAttr('disabled');
        }
        update_preview();
    }

    function bind_input_evts() {
        // bind verb selection swapping on learning_level selecting
        $("#learning_obj_wizard", xblock_element).on('change','#learning_level_selection', catalog.learning_level_change_evt);


        // trigger change on level selection (hides all learning verb selections)
        //      Added for resetting active verb select when wizard is canceled.
        $("#learning_level_selection", xblock_element).trigger('change');

        // map preview updating to the inputs
        $("#learning_obj_wizard", xblock_element).on('keyup', '#condition', update_preview);
        $("#learning_obj_wizard", xblock_element).on('change', '#condition_exclude', disable_condition_input);
        $("#learning_obj_wizard", xblock_element).on('change','.learning_verb_selection', update_preview);
        $("#learning_obj_wizard", xblock_element).on('keyup', '#task', update_preview);
        $("#learning_obj_wizard", xblock_element).on('keyup', '#degree', update_preview);
        $("#learning_obj_wizard", xblock_element).on('change', '#degree_exclude', disable_degree_input);
        $("#learning_obj_wizard", xblock_element).on('change', '.ABET_input', update_ABET_review);


        // initalize the accordion
        $('.accord_content', xblock_element).accordion({
            collapsible: true,
            active:false,
            heightStyle: content,
        });



    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function editor_toggle(){
        $('#learning_obj_creation', xblock_element).toggle()
        $('#learning_obj_listing', xblock_element).toggle()

        if($('#learning_obj_creation', xblock_element).is(':visible')){
            $(xblock_element).find('.save-button').addClass('disabled');
        }else{
            $(xblock_element).find('.save-button').removeClass('disabled');
        }
    }

    function tab_highlight(toHighlight) {
        $(xblock_element).closest('.modal-window').find('.editor-modes .modal_tab').removeClass('is-set');
        $(xblock_element).closest('.modal-window').find('.editor-modes .modal_tab[data-mode="' + toHighlight + '"]').addClass('is-set');
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {

        tab_highlight(toShow);

        $('.modal_tab_view', xblock_element).hide()
        $('.modal_tab_view[data-mode="' + toShow + '"]', xblock_element).show();

    }

    // update listing of learning objectives based on catalog items
    function update_listing(){

        catalog.update_listing();
        $('#learning_obj_collection', xblock_element).show();



    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

        // trigger commit
        commit = commit === undefined ? false : commit;
        var handlerUrl = runtime.handlerUrl(xblock_element, 'studio_submit');

        // get the form data from the edit modal
        var data = {
            // "commit": commit.toString(),
            "display_name": $('.settings_display_name', xblock_element).val(),
            "learning_obj_list": catalog.export_records(),
        }

        runtime.notify('save', {state: 'start'});
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
          runtime.notify('save', {state: 'end'});
        });
    }


    $(function($) {
        // trigger custom modal resize event (provided by studio view hl template)
        $('body').trigger('resize_modal')

        // add actions for the top of the modal to switch views
        for (var mode in studio_buttons) {

            $(xblock_element).closest('.modal-window').find('.editor-modes')
                .append(
                    $('<li>', {class: "action-item"}).append(
                        $('<a />', {
                            //class: "action-primary",
                            class: mode + "-button modal_tab",
                            //id: mode,
                            text: studio_buttons[mode],
                            href: "#",
                            "data-mode":mode,
                        })
                    )
                );
        }

        // populate form inputs for catalog items
        initialize_forms();
        // initialize jquery steps implementation
        initialize_steps();
        // Set main pane to the editor
        tab_switch("editor");

        /* -----------------------------
            map base modal events
        -----------------------------*/

        $(xblock_element).closest('.modal-window').find('.editor-modes .modal_tab').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

        $('#cancel_new', xblock_element).click(function(){
            editor_toggle();
            reset_wizard();
        });

        // save button clicked
        $(xblock_element).find('.save-button').bind('click', function() {
            studio_submit(true);
        });

        // cancel button clicked
        $(xblock_element).find('.cancel-button').bind('click', function() {
            runtime.notify('cancel', {});
        });

        $('#add_new', xblock_element).click(editor_toggle);


    });

}
