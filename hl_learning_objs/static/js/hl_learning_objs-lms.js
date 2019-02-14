/* JavaScript for HydroLearn's learning objectives XBlock, LMS Side. */
function HL_LO_XBlock(runtime, xblock_element) {
    // runtime code for loading the xblock in the LMS portion of the site
    $(function ($) {

        var catalog = new LO_catalog(JSON.parse('{{ blooms_catalog|safe }}'));


        // parse the existing objects
        var existing = JSON.parse('{{ objs|safe|escapejs }}');
        debugger;
        var test_str = '{{ self.learning_objs.to_string }}';
        

        // import this xblocks data into the catalog for use in the system
        catalog.import_records(existing)

        // add this listing of catalog records to the template
        $('.objectives_listing', xblock_element).html(catalog.records_as_html());

    });
}
