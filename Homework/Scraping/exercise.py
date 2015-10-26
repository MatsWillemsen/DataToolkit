# Name : Mats Willemsen
# Student number : 10247556
'''
This module contains an implementation of split_string.
'''
import re

# You are not allowed to use the standard string.split() function, use of the
# regular expression module, however, is allowed.
# To test your implementation use the test-exercise.py script.

# A note about the proper programming style in Python:
#
# Python uses indentation to define blocks and thus is sensitive to the
# whitespace you use. It is convention to use 4 spaces to indent your
# code. Never, ever mix tabs and spaces - that is a source of bugs and
# failures in Python programs.


def split_string(source, separators):
    '''
    Split a string <source> on any of the characters in <separators>.

    The ouput of this function should be a list of strings split at the
    positions of each of the separator characters.
    '''
    if not separators:
        return [source] if source else []
    return re.findall("[^{}]+".format(separators), source)

if __name__ == '__main__':
    # You can try to run your implementation here, that will not affect the
    # automated tests.
    print(split_string('abacadabra', 'ba'))  # should print: ['c', 'd', 'r']
