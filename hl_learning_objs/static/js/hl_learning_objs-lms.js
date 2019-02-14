/* JavaScript for HydroLearn's learning objectives XBlock, LMS Side. */
function HL_LO_XBlock(runtime, xblock_element, configuration) {
    // runtime code for loading the xblock in the LMS portion of the site
    debugger;
    var catalog = new LO_catalog(JSON.parse('{{ blooms_catalog|safe }}'));

    if(!!configuration.objs){
        var existing = JSON.parse(configuration.objs);
        catalog.import_records(existing);
    }



    $(function ($) {

        debugger;

        // import this xblocks data into the catalog for use in the system


        // add this listing of catalog records to the template
        $('.objectives_listing', xblock_element).html(catalog.records_as_html());

    });
}
