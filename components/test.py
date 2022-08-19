
import math
import os
import random
import re
import sys
from collections import deque
#
# Complete the 'filterBadWords' function below.
#
# The function is expected to return a STRING.
# The function accepts following parameters:
#  1. STRING badWords
#  2. STRING message
#

from collections import defaultdict

class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False # indicates whether this is a last characters

class Trie:

    def __init__(self):
        self.root = TrieNode() #empty tree

    def insert(self, word):
        cur = self.root

        # apple
        # ape 
        for c in word:  
            if c not in cur.children:
                cur.children[c] = TrieNode()
            cur = cur.children[c]

        cur.end = True

    def search(self, word):
        cur = self.root
        
        # First do front asterisk search
        # abc* -> abcd
        # *bcd -> abcd
        # *bcd, *cde* -> abcdefg
        
        # edge
        # *abc -> abc
        
        # first do search on front asterisk
        if cur.children["*"]:
            # if has front asterisk on any of the bad word 
            startPoint = cur.children["*"]
            cur = startPoint
            
            visited = set()
            q = deque()
            q.append(word[0])
            
            for c in word:
                
                if c in cur.children:
                    cur = cur.children[c]
                else:
                    if "*" in cur.children:
                        return True
                    cur = startPoint
            
            if cur.end:
                return True
    
        cur = self.root
        
        for c in word:
            
            # e.g. Kokonut, dodo, lolo - koko
            
            if c not in cur.children:
                if "*" in cur.children:
                    return True
                return False 
            cur = cur.children[c]

        return cur.end
    
def filterBadWords(badWords, message):
    
    # another approach is to not use split, as this is O(k) too
    # but i will come back later 
    badWords = badWords.split(" ")
    trieList = Trie()
    
    # O(k) where k is the total len of badWord 
    for badWord in badWords:
        
        trieList.insert(badWord)
        
    curWord = ""
    res = ""
    
    for c in enumerate(message):
        
        if c.isalnum():
            # only add when it's alphabet or numbers
            curWord += c
        else:
            # "Stop it, you jerkwad I remain blameless"
            # *stop
            # **** it you jerkwad I remain blameless
            # found a complete word
            
            if trieList.search(curWord.lower()):
                # if found 
                res += "*" * len(curWord)
            else:
                res += curWord
            
            # add the punctuation 
            curWord += c 
            curWord = ""
    
    if len(curWord):
        # if there's a trailing word, we add it 
        if trieList.search(curWord.lower()):
            # if found 
            res += "*" * len(curWord)
        else:
            res += curWord
        
    return res
            
print(filterBadWords("jerk* *lame* fuck lol* *troll faggot", "Stop it, you jerkwad I remain blameless"))
            
            
badWords = "jerk lame fuck dick lmao jingxian" # let's say len is k
badWords = badWords.split(" ")

message = "hello world i am a little pocupine" # let's say len is n 