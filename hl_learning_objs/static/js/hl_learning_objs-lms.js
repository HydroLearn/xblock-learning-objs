/* JavaScript for HydroLearn's learning objectives XBlock, LMS Side. */
function HL_LO_XBlock(runtime, xblock_element, viewbag) {
    // runtime code for loading the xblock in the LMS portion of the site

    // initialize the learning objecives data catalog with the provided blooms_catalog
    var catalog = new LO_catalog(
        $('.objectives_listing', xblock_element),
        JSON.parse(viewbag.blooms_catalog)
    );

    // assuming existing objects were provided parse the records and import them
    var existing = JSON.parse(viewbag.objs);
    catalog.import_records(existing);




    $(function ($) {
        // add this listing of catalog records to the template
        catalog.update_listing();

    });
}
