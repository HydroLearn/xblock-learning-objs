/* JavaScript for HydroLearn's learning objectives XBlock, LMS Side. */
function HL_LO_XBlock(runtime, xblock_element) {
    // runtime code for loading the xblock in the LMS portion of the site
    $(function ($) {

        var catalog = new LO_catalog(JSON.parse('{{ blooms_catalog|safe }}'));


        // parse the existing objects
        var existing = JSON.parse('{{ objs|safe|escapejs }}');

        // import this xblocks data into the catalog for use in the system
        catalog.import_objectives(existing)

        // add this listing of catalog records to the template
        $('.HL_LO_xblock', xblock_element).html(catalog.records_as_html());
                
    });
}
