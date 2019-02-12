/* JavaScript for HydroLearn's learning objectives XBlock, Studio Side. */
function HL_LO_XBlockStudio(runtime, xblock_element) {

    var catalog = new LO_catalog();

    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    function initialize_forms(){
        $('.action_input').append(catalog._generate_level_selection());
        $('.abet_input').append(catalog._generate_ABET_selection());

    }

    function initialize_steps(){
        $("#learning_obj_wizard").steps({
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
                                valid_input = $("#condition").val().trim().length > 0;
                                break;
                            case 1:

                                valid_input = (
                                        $('#learning_level_selection').val().trim().length != "None" &&
                                        $(".learning_verb_wrapper.active").val().trim().length != "None"
                                    )
                                break;
                            case 2:
                                valid_input = $("#task").val().trim().length > 0
                                break;
                            case 3:
                                valid_input = $("#degree").val().trim().length > 0;
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

                        var outcomes_ids = $("#outcomes_selection input:checked").map(function(){
                                              return $(this).val();
                                            }).get();

                        // grab all input field values
                        var values_dictionary = {
                            "condition": $("#condition").val().trim(),
                            "task": $("#task").val().trim(),
                            "degree": $("#degree").val().trim(),
                            "level": $("#knowledgeSelection option:selected").text(),
                            "level_id": $("#knowledgeSelection option:selected").val(),
                            "verb": $("#actionSelection option:selected").text(),
                            'verb_id': $("#actionSelection option:selected").val(),
                            "outcomes": outcomes_ids,
                        }

                        // add the new form
                        var learning_objective_form = $('.LO_form').last();
                        if(learning_objective_form.attr('id') !== "learning_objective_set-0" || learning_objective_form.find(".LO_representation").text() !== ''){
                            $('.LO_fs_add').click();
                            learning_objective_form = $('.LO_form').last();
                        }
                        updateLearningObjective(learning_objective_form, values_dictionary);
                        $('.ui-dialog-titlebar-close').click();
                        resetWizard();
                    }
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

    function tab_highlight(toHighlight) {
        $('.modal-window .editor-modes .modal_tab').removeClass('is-set');
        $('.modal-window .editor-modes .modal_tab[data-mode="' + toHighlight + '"]').addClass('is-set');
    }

    // Hide all panes except toShow
    function tab_switch(toShow) {

        tab_highlight(toShow);

        $('.modal-window .modal_tab_view').hide()
        $('.modal-window .modal_tab_view[data-mode="' + toShow + '"]').show();

        place_modal();
    }

    // Send current code and settings to the backend
    function studio_submit(commit) {

        commit = commit === undefined ? false : commit;
        var handlerUrl = runtime.handlerUrl(xblock_element, 'studio_submit');

        // get the form data from the edit modal
        var data = {
            // "commit": commit.toString(),
            "display_name": $('.chx_display_name').val(),
            // "body_html": ckeditor_html.getData(),
        }

        runtime.notify('save', {state: 'start'});
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
          runtime.notify('save', {state: 'end'});
        });
    }


    $(function($) {

        // Add Save Button
        $('ul', '.modal-actions')
            .prepend(
                $('<li>', {class: "action-item"}).append(
                    $('<a />', {
                        class: "action-primary",
                        id: "chx_submit",
                        text: "Save"
                    })
                )
            );

        // add actions for the top of the modal to switch views
        for (var mode in studio_buttons) {
            $('.editor-modes')
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

        initialize_forms();

        initialize_steps();
        // Set main pane to Options
        tab_switch("editor");

        // Readjust modal window dimensions in case the browser window is resized
        // window.addEventListener('resize', function() {
        //     place_modal();
        // });
        //
        // // reposition modal on window scroll
        // window.addEventListener('scroll', function() {
        //     place_modal();
        // });

        $('.modal-window .editor-modes .modal_tab').click(function(){
            tab_switch($(this).attr('data-mode'));
        });

        // Clicked Save button
        $('#chx_submit').click(function(eventObject) {
            studio_submit(true);
            //setTimeout(function(){location.reload();},200);
        });

        $('.action-cancel').removeClass('action-primary');

    });

}
