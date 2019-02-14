/* JavaScript for HydroLearn's learning objectives XBlock, Studio Side. */
function HL_LO_XBlockStudio(runtime, xblock_element) {

    // add modal tag so it's width gets adjusted on window resize
    $(xblock_element).closest('.modal-window').addClass('hl_resize_correction');

    // ''
    var catalog = new LO_catalog(JSON.parse('{{ blooms_catalog|safe }}'));

    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    function initialize_forms(){
        $('.action_input', xblock_element).append(catalog._generate_level_selection());
        $('.abet_input', xblock_element).append(catalog._generate_ABET_selection());

        // import this xblocks data into the catalog for use in the system
        var existing = JSON.parse('{{ objs|safe|escapejs }}');
        catalog.import_objectives(existing)

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

                        var new_LO = new Learning_obj(
                                values_dictionary["level_id"],
                                values_dictionary["verb_id"],
                                values_dictionary["condition"],
                                values_dictionary["task"],
                                values_dictionary["degree"],
                                values_dictionary["outcomes"]
                            )

                        catalog.add_item(new_LO);
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

                bind_input_evts();

                // hide wizard by default
                //$("#learning_obj_creation", xblock_element).hide();


    }

    function bind_input_evts() {
        $("#learning_obj_wizard", xblock_element).on('change','#learning_level_selection', catalog.learning_level_change_evt);
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

        var items = catalog.item_list();

        if(items.length == 0){
            $('#learning_obj_collection', xblock_element).hide();
            $('#learning_obj_empty', xblock_element).show();
        }else{
            $('#learning_obj_empty', xblock_element).hide();
            $('#learning_obj_collection', xblock_element).html("");

            var listing = $('<ul />', {
                class: 'objective_listing',
            })

            $.each(items, function(i, item){
                var row = $('<li />', {
                    class: 'objective_item',
                    text: item.as_str(),
                })
                listing.append(row);
            });
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
            "learning_obj_list": catalog.export_objectives(),
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
