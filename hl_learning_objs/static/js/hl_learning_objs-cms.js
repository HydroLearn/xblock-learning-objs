/* JavaScript for HydroLearn's learning objectives XBlock, Studio Side. */
function HL_LO_XBlockStudio(runtime, xblock_element, viewbag) {

    // add modal tag so it's width gets adjusted on window resize
    $(xblock_element).closest('.modal-window').addClass('hl_resize_correction');


    // initialize the learning objecives data catalog with the provided blooms_catalog
    var catalog = new LO_catalog(JSON.parse(viewbag.blooms_catalog));

    // assuming existing objects were provided parse the records and import them
    var existing = JSON.parse(viewbag.objs);
    catalog.import_records(existing);


    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

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
        $("#condition", xblock_element).val("");
        $("#task", xblock_element).val("");
        $("#degree", xblock_element).val("");
        $("#learning_level_selection", xblock_element).val("None");
        $(".learning_verb_selection.active", xblock_element).val("None");
        $(".learning_verb_selection.active", xblock_element).removeClass('active');
        $(".ABET_selection_wrapper input:checked", xblock_element).prop('checked', false);

        // destroy and reinitalize wizard (reset)
        $('#learning_obj_wizard', xblock_element).steps('destroy');
        initialize_steps();

        // remove 'done' tags from each step tab
        // $('#learning_obj_wizard .steps .done').each(function(index, tab){
        //     $(tab).removeClass('done')._enableAria(false);
        // })
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


                        var valid_input = true;
                        switch(currentIndex){
                            case 0:
                                valid_input = $("#condition", xblock_element).val().trim().length > 0;
                                break;
                            case 1:

                                valid_input = catalog.verb_validation();
                                break;
                            case 2:
                                valid_input = $("#task", xblock_element).val().trim().length > 0
                                break;
                            case 3:
                                valid_input = $("#degree", xblock_element).val().trim().length > 0;
                                break;

                            default: break;

                        }

                        // if loading the review step, update the selected ABET listing
                        if(newIndex == 5){
                            //updateABETReview();
                        }

                        return valid_input;
                    },

                    onFinished: function (event, currentIndex)
                    {
                        // add the new form row for this learning objective
                        //$('.LO_fs_add').click()
                        debugger;
                        var outcomes_ids = $(".ABET_selection_wrapper input:checked", xblock_element).map(function(){
                                              return $(this).val();
                                            }).get();

                        // grab all input field values
                        var values_dictionary = {
                            "condition": $("#condition", xblock_element).val().trim(),
                            "task": $("#task", xblock_element).val().trim(),
                            "degree": $("#degree", xblock_element).val().trim(),
                            "level_id": $("#learning_level_selection option:selected", xblock_element).val(),
                            "level": $("#learning_level_selection option:selected", xblock_element).text(),
                            'verb_id': $(".learning_verb_selection.active option:selected", xblock_element).val(),
                            "verb": $(".learning_verb_selection.active option:selected", xblock_element).text(),
                            "outcomes": outcomes_ids,
                        }

                        var new_LO = new catalog.record(
                                values_dictionary["level_id"],
                                values_dictionary["verb_id"],
                                values_dictionary["condition"],
                                values_dictionary["task"],
                                values_dictionary["degree"],
                                values_dictionary["outcomes"]
                            )

                        catalog.add_record(new_LO);
                        update_listing();

                        editor_toggle();
                        reset_wizard();

                        // add the new form
                        //var learning_objective_form = $('.LO_form').last();
                        // if(learning_objective_form.attr('id') !== "learning_objective_set-0" || learning_objective_form.find(".LO_representation").text() !== ''){
                        //     $('.LO_fs_add').click();
                        //     learning_objective_form = $('.LO_form').last();
                        // }
                        //updateLearningObjective(learning_objective_form, values_dictionary);
                        //$('.ui-dialog-titlebar-close').click();
                        //resetWizard();
                    }
                });

                update_preview()
                bind_input_evts();

                // hide wizard by default
                //$("#learning_obj_creation", xblock_element).hide();


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
        if($('#condition_exclude', wizard).is(':checked')){
            obj_parts.push($('#condition', wizard).val().trim().concat(','));
        }

        obj_parts.push($('.learning_verb_selection.active option:selected', wizard).text().trim());
        obj_parts.push($('#task', wizard).val().trim());

        if($('#degree_exclude', wizard).is(':checked')){
            obj_parts.push($('#degree', wizard).val().trim());
        }

        var preview_string = "";

        $.each(obj_parts, function(i, val){
            // add space before if not the first element
            if(i != 0) preview_string.concat(' ');

            // if the value isn't empty append it to the preview string
            if(!!val){
                preview_string.concat(val);
            }else{
                // otherwise show ellipses, and break the loop (showing more work ahead)
                preview_string.concat('... ');
                return false;
            }

        });

        // add punctuation/capatilize first character
        preview_string.concat('.');
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
    }

    function disable_degree_input(){
        if($(this).is(":checked")) {
            $("#degree", xblock_element).attr('disabled', true);

        }else{
            $("#degree", xblock_element).removeAttr('disabled');
        }
    }

    function bind_input_evts() {
        // bind verb selection swapping on learning_level selecting
        $("#learning_obj_wizard", xblock_element).on('change','#learning_level_selection', catalog.learning_level_change_evt);

        // map preview updating to the inputs
        $("#learning_obj_wizard", xblock_element).on('keyup', '#condition', update_preview);
        $("#learning_obj_wizard", xblock_element).on('change', '#condition_exclude', disable_condition_input);
        $("#learning_obj_wizard", xblock_element).on('change','.learning_verb_selection', update_preview);
        $("#learning_obj_wizard", xblock_element).on('keyup', '#task', update_preview);
        $("#learning_obj_wizard", xblock_element).on('keyup', '#degree', update_preview);
        $("#learning_obj_wizard", xblock_element).on('change', '#degree_exclude', disable_degree_input);
        $("#learning_obj_wizard", xblock_element).on('change', '.ABET_input', update_ABET_review);
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

        if(catalog.num_records() == 0){
            $('#learning_obj_collection', xblock_element).hide();
            $('#learning_obj_empty', xblock_element).show();
        }else{
            $('#learning_obj_empty', xblock_element).hide();
            $('#learning_obj_collection', xblock_element).html("");

            // get the record listing from the catalog as html
            var listing = catalog.records_as_html();
            $('#learning_obj_collection', xblock_element).append(listing);

            $('#learning_obj_collection', xblock_element).show();
        }


    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

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
