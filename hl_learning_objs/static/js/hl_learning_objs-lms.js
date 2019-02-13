/* JavaScript for HydroLearn's learning objectives XBlock, LMS Side. */
function HL_LO_XBlock(runtime, xblock_element) {
    // runtime code for loading the xblock in the LMS portion of the site
    $(function ($) {

        var catalog = new LO_catalog(JSON.parse('{{ blooms_catalog|safe }}'));

        // import the data from the xblock_element into the catalog

        // generate learning objective strings


        // append the string list to the xblock's contents
        $('.HL_LO_xblock').append('a list of strings for learning objectives')
    });
}
