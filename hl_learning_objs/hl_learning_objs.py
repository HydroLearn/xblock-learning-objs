"""

XBlock for presenting the user with a wizard for generating learning objectives
associated with a unit.

Learning objectives are a specialized statement describing what learners are
expected 'get' out of a lesson. Linking this statement to ABET outcomes
based on Bloom's taxonomy.


Author : Cary Rivet

"""

import urllib, datetime, json, urllib2

from hl_text import hl_text_XBlock



# imports for content indexing support
import re
from xmodule.util.misc import escape_html_characters

from xblock.core import XBlock
from xblock.fields import (
        Scope,
        Integer,
        List,
        String,
        Boolean,
        Dict,
        Reference, # reference to another xblock
        ReferenceList, # list of references to other xblocks
    )

from xblockutils.resources import ResourceLoader
loader = ResourceLoader(__name__)

# from xblock.fragment import Fragment #DEPRECIATED
from web_fragments.fragment import Fragment

#  TODO:
#   revise this component based on the following description:
#       https://docs.google.com/presentation/d/1R4Dhhopm-gyW-n6o498IvVVqjFFoZNT6VgTNs-ToZoA/edit#slide=id.g51c41d0d00_0_0

class HL_LearningObjs_XBlock(XBlock):
    """
        custom xblock for defining a list of learning objective strings for
        a unit in the HydroLearn platform.

        stores a list of Learning objective strings
    """

    CATEGORY = "hl_learning_objs"
    STUDIO_LABEL = "Learning Objectives"

    # xblock fields
    display_name = String(
        display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page",
        scope=Scope.settings,
        default="Learning Objectives (Wizard)"
    )

    learning_objs = List(
            display_name="Learning Objectives",
            help="List of Learning Objectives",
            scope=Scope.content,

            # default=fields.UNSET,
            # values=None,
            # enforce_type=False,
        )

    @XBlock.json_handler
    def get_body_html(self, data, suffix=''):
        return {
                # "content": self.content,
            }

    @staticmethod
    def generate_html():
        # add a wrapper around the content so ck-styling applies
        result = "<div class='HL-Learning-obj_wrapper'>"
        # Assume valid HTML code
        result += html
        result += "</div>"

        return result

    def student_view(self, context=None):
        """
        The student view
        """
        fragment = Fragment()

        blooms = json.loads(loader.load_unicode("static/blooms_catalog.json"))
        content = {
            'self': self,
            }

        # body_html = unicode(self.generate_html())
        fragment.add_content(loader.render_template('templates/learning_objs-lms.html', content))
        fragment.add_css(loader.load_unicode('static/css/lms-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/LO_listing_styling.css'))

        #fragment.add_content(render_template('templates/HLCustomText.html', content))

        # add the custom initialization code for the LMS view and initialize it
        fragment.add_javascript(loader.load_unicode('static/js/js-str-format.js'))
        fragment.add_javascript(loader.load_unicode('static/js/LO_catalog.js'))
        fragment.add_javascript(loader.load_unicode('static/js/hl_learning_objs-lms.js'))

        fragment.initialize_js('LO_catalog')
        fragment.initialize_js('HL_LO_XBlock', {
                'blooms_catalog': json.dumps(blooms),
                'objs': json.dumps(self.learning_objs or []),
            })


        return fragment

    def studio_view(self, context=None):
        """
        The studio view
        """

        # load blooms config
        blooms = json.loads(loader.load_unicode("static/blooms_catalog.json"))
        content = {
            'self': self,
            'blooms_catalog': json.dumps(blooms),
            'objs': json.dumps(self.learning_objs or []),
            }

        fragment = Fragment()

        # Load fragment template
        fragment.add_content(loader.render_template('templates/learning_objs-cms.html', content))

        # add static files for styling, and template initialization
        fragment.add_css(loader.load_unicode('static/css/jquery-ui.min.css'))
        fragment.add_css(loader.load_unicode('static/css/jquery.steps.css'))
        fragment.add_css(loader.load_unicode('static/css/cms-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/modal-styling.css'))
        fragment.add_css(loader.load_unicode('static/css/LO_listing_styling.css'))

        fragment.add_javascript(loader.load_unicode('static/js/js-str-format.js'))
        fragment.add_javascript(loader.load_unicode('static/js/jquery-ui.min.js'))
        fragment.add_javascript(loader.load_unicode('static/js/jquery.steps.js'))
        fragment.add_javascript(loader.load_unicode('static/js/LO_catalog.js'))
        fragment.add_javascript(loader.load_unicode('static/js/hl_learning_objs-cms.js'))

        fragment.initialize_js('LO_catalog')
        fragment.initialize_js('HL_LO_XBlockStudio', {
                'blooms_catalog': json.dumps(blooms),
                'objs': json.dumps(self.learning_objs or []),
            })

        return fragment

    @staticmethod
    def generate_preview(self, dependencies, html, json, jsa, jsb, css):

        preview = ""

        return preview

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        Course author pressed the Save button in Studio
        """

        result = {"submitted": "false", "saved": "false", "message": "", "preview": ""}

        if len(data) > 0:
            # NOTE: No validation going on here; be careful with your code
            self.display_name = data["display_name"]
            self.dependencies = ""
            self.learning_objs = data["learning_obj_list"]

            result["submitted"] = "true"
            result["saved"] = "true"

        return result

    def get_learning_objs_string(self):
        """
            method for generating a string of learning objectives
            from stored list mapped to the catalog.
        """
        return_string = ""
        blooms_catalog = json.loads(loader.load_unicode("static/blooms_catalog.json"))

        # for each item in the stored list, generate a string mapping
        # verb/level/abet_outcomes to the catalog.

        # sample list item{
        #   level,
        #   verb,
        #   condition,
        #   task,
        #   degree,
        #   ABET_ids
        # }
        # if there are learning objectives
        if self.learning_objs:

            # generate a string for each learning objective
            objs_strs = map(lambda x: "<p>Learning Objective: (Level %s:%s) %s %s %s %s.</p>" % (
                                    str(int(x['level']) + 1),
                                    blooms_catalog['levels'][str(x['level'])]['display_name'],
                                    x["condition"],
                                    "the student will be able to %s" % blooms_catalog['levels'][str(x['level'])]['verbs'][int(x["verb"])],
                                    x["task"],
                                    x["degree"]
                                ), self.learning_objs)

            # join the list of learning obj strings
            return_string = "<br/>".join(objs_strs)


            # potential addition of indexing by abet id's

            # for obj in self.learning_objs:
            #     # generate sorted collection of abet outcomes
            #     outcomes_strs = map(lambda id: "ABET Outcome: %s" %
            #                 blooms_catalog["ABET"][int(id)],
            #             sorted(obj["ABET_ids"]))


        return return_string


    def index_dictionary(self):
        xblock_body = super(HL_LearningObjs_XBlock, self).index_dictionary()
        # Removing script and style
        html_content = re.sub(
            re.compile(
                r"""
                    <script>.*?</script> |
                    <style>.*?</style>
                """,
                re.DOTALL |
                re.VERBOSE),
            "",
            self.get_learning_objs_string(),
        )
        html_content = escape_html_characters(html_content)
        html_body = {
            "html_content": html_content,
            "display_name": self.display_name,
        }
        if "content" in xblock_body:
            xblock_body["content"].update(html_body)
        else:
            xblock_body["content"] = html_body
        xblock_body["content_type"] = "Text"
        return xblock_body



    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("HLLearningObjs",
             """<HLLearningObjs/>
             """),
        ]


# # text implementation of learning objs xblock without wizard interface
class HL_LearningObjs_text_XBlock(hl_text_XBlock):

    # modify path to the custom starter template for empty xblocks
    #empty_template = 'templates/initial_learning_activity_template.html'

    display_name = String(
        display_name="Display Name",
        help="This name appears in the horizontal navigation at the top of the page",
        scope=Scope.settings,
        default="Learning Objectives (Template)"
    )

    def get_empty_template(self, context={}):
        return render_template('templates/learning_obj_text_template.html', context)

    def studio_view(self, context):

        fragment = super(HL_LearningObjs_text_XBlock, self).studio_view(context)

        return fragment