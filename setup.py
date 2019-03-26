"""Setup for xblock-hl-learning-objs XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


# Constants #########################################################
VERSION = '0.1.2'

# xblocks  #########################################################
PREREQs = [
    'XBlock',
    'xblock-utils',
    'xblock-hl-text',

]

BLOCKS = [
    # the main learning obj block
    # 'hl_learning_objs = hl_learning_objs:HL_LearningObjs_text_XBlock',
    # 'hl_learning_objs_advanced = hl_learning_objs:HL_LearningObjs_XBlock',

    'hl_learning_objs = hl_learning_objs:HL_LearningObjs_XBlock',
    'hl_learning_objs_text = hl_learning_objs:HL_LearningObjs_text_XBlock',

]

setup(
    name='xblock-hl_learning_objs',
    version=VERSION,
    author="cRivet",
    description='Custom Xblock for generating collection of learning objectives for use in HydroLearn platform.',
    packages=[
        'hl_learning_objs',
    ],
    install_requires=PREREQs,
    entry_points={
        'xblock.v1': BLOCKS
    },
    package_data=package_data("hl_learning_objs",
                              [
                                    "static",
                                    "public",
                                    "templates"
                              ]),
)
