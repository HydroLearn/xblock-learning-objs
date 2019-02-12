/* JavaScript for HydroLearn's learning objectives XBlock, Studio Side. */
function HL_LO_XBlockStudio(runtime, xblock_element) {

    var catalog = new LO_catalog();

    // Define mapping of tabs (modes) to display names
    var studio_buttons = {
        "editor": "EDITOR",
        "settings": "SETTINGS",
    };

    function initialize_forms(){
        $('.level_form').append(catalog._generate_level_selection());
        $('.ABET_form').append(catalog._generate_ABET_selection());

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
