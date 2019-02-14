"""

XBlock for presenting the user with a wizard for generating learning objectives
associated with a unit.

Learning objectives are a specialized statement describing what learners are
expected 'get' out of a lesson. Linking this statement to ABET outcomes
based on Bloom's taxonomy.


Author : Cary Rivet

"""

import urllib, datetime, json, urllib2
from .utils import render_template, load_resource, resource_string
from django.template import Context, Template

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

# from xblock.fragment import Fragment #DEPRECIATED
from web_fragments.fragment import Fragment


class HL_LearningObjs_XBlock(XBlock):
    """
        custom xblock for defining a list of learning objective strings for
        a unit in the HydroLearn platform.

        stores a list of Learning objective strings
    """
    # xblock fields
    display_name = String(
        display_name="Learning Objectives",
        help="This name appears in the horizontal navigation at the top of the page",
        scope=Scope.settings,
        default="Learning Objectives"
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

        blooms = json.loads(load_resource("static/blooms_catalog.json"))
        content = {
            'self': self,
            'blooms_catalog': json.dumps(blooms),
            'objs': json.dumps(self.learning_objs or []),

            }

        # body_html = unicode(self.generate_html())
        fragment.add_content(render_template('templates/learning_objs-lms.html', content))
        fragment.add_css(load_resource('static/css/lms-styling.css'))
        fragment.add_css(load_resource('static/css/LO_listing_styling.css'))

        #fragment.add_content(render_template('templates/HLCustomText.html', content))

        # add the custom initialization code for the LMS view and initialize it
        fragment.add_javascript(load_resource('static/js/js-str-format.js'))
        fragment.add_javascript(load_resource('static/js/LO_catalog.js'))
        fragment.add_javascript(unicode(render_template('static/js/hl_learning_objs-lms.js', content)))

        fragment.initialize_js('LO_catalog')
        fragment.initialize_js('HL_LO_XBlock', {'objs': self.learning_objs.to_json() })


        return fragment

    def studio_view(self, context=None):
        """
        The studio view
        """

        # load blooms config
        blooms = json.loads(load_resource("static/blooms_catalog.json"))
        content = {
            'self': self,
            'blooms_catalog': json.dumps(blooms),
            'objs': json.dumps(self.learning_objs or []),
            }

        fragment = Fragment()

        # Load fragment template
        fragment.add_content(render_template('templates/learning_objs-cms.html', content))

        # add static files for styling, and template initialization
        fragment.add_css(load_resource('static/css/jquery.steps.css'))
        fragment.add_css(load_resource('static/css/cms-styling.css'))
        fragment.add_css(load_resource('static/css/LO_listing_styling.css'))

        fragment.add_javascript(load_resource('static/js/js-str-format.js'))
        fragment.add_javascript(load_resource('static/js/jquery.steps.js'))
        fragment.add_javascript(load_resource('static/js/LO_catalog.js'))
        fragment.add_javascript(unicode(render_template('static/js/hl_learning_objs-cms.js', content)))

        fragment.initialize_js('LO_catalog')
        fragment.initialize_js('HL_LO_XBlockStudio')

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

    def index_dictionary(self):
        xblock_body = super(HLCustomTextXBlock, self).index_dictionary()
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
            # self.content
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
