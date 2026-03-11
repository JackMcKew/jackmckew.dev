Title: Building a Spell Checker From First Principles - Levenshtein Distance and Beyond
Date: 2026-03-10
Author: Jack McKew
Category: Python
Tags: levenshtein, edit-distance, spell-checker, algorithms, nlp

I implemented Levenshtein distance from scratch for a spell checker project, and it's genuinely satisfying how much computer science is contained in a simple grid of numbers. Dynamic programming, bit manipulation, graph algorithms - it's all hiding in there.

## What is Levenshtein distance?

Levenshtein distance (edit distance) is the minimum number of single-character edits (insert, delete, replace) needed to transform one string into another. "cat" to "car" is 1 (replace 't' with 'r'). "cat" to "dog" is 3 (replace all three characters). "kitten" to "sitting" is 3 (substitute 'k' with 's', 'e' with 'i', insert 'g').

It's useful for spell checking because misspelled words are usually 1-2 edits away from the correct word. If someone types "recieve", we know they meant "receive" because the edit distance is 1.

## The algorithm - dynamic programming

The classic approach uses a matrix. For strings A and B, create a matrix where entry (i,j) is the edit distance between A[0...i] and B[0...j].

Here's the naive implementation:

```python
def levenshtein(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)

    # Create matrix
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Base cases
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    # Fill matrix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # deletion
                    dp[i][j - 1],      # insertion
                    dp[i - 1][j - 1]   # substitution
                )

    return dp[m][n]
```

The logic is simple: if characters match, take the diagonal value (no cost). If they don't match, take the minimum of three operations (delete, insert, substitute) and add 1.

For "kitten" vs "sitting":

```
      ""  s  i  t  t  i  n  g
  ""   0  1  2  3  4  5  6  7
  k    1  1  2  3  4  5  6  7
  i    2  2  1  2  3  4  5  6
  t    3  3  2  1  2  3  4  5
  t    4  4  3  2  1  2  3  4
  e    5  5  4  3  2  2  3  4
  n    6  6  5  4  3  3  2  3
```

Bottom-right corner is 3. That's your answer.

![Levenshtein DP matrix for "kitten" vs "sitting"](images/dp_matrix.png)

## Space optimization

The matrix approach uses O(m*n) space. For a 100-character word against 10,000 words in your dictionary, that's a million cells. Doable, but wasteful.

You only ever need the previous row to compute the current row, so you can use two arrays:

```python
def levenshtein_optimized(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_optimized(s2, s1)

    prev = list(range(len(s2) + 1))

    for i in range(1, len(s1) + 1):
        curr = [i] + [0] * len(s2)

        for j in range(1, len(s2) + 1):
            if s1[i - 1] == s2[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])

        prev = curr

    return prev[len(s2)]
```

This uses O(min(m,n)) space instead of O(m*n). For spell checking with a huge dictionary, this matters.

## Building a spell checker

Now for the actual spell checker. The algorithm:

1. Take a misspelled word
2. Find all dictionary words within edit distance 2
3. Rank them by distance (closer = better correction)
4. Return the top suggestions

```python
class SpellChecker:
    def __init__(self, words: list[str]):
        # Use a set for O(1) "is this word correct?" lookups
        self.dictionary_set = set(w.strip().lower() for w in words)
        self.dictionary = list(self.dictionary_set)

    def suggest(self, word: str, max_distance: int = 2) -> list:
        word = word.lower()

        # If word is in dictionary, it's correct
        if word in self.dictionary_set:
            return [word]

        # Find candidates within max_distance
        candidates = []
        for dict_word in self.dictionary:
            distance = levenshtein_optimized(word, dict_word)
            if distance <= max_distance:
                candidates.append((dict_word, distance))

        # Sort by distance, then alphabetically
        candidates.sort(key=lambda x: (x[1], x[0]))
        return [w for w, _ in candidates[:5]]  # top 5

# Usage - load from /usr/share/dict/words on Linux, or inline a sample
import os

if os.path.exists('/usr/share/dict/words'):
    with open('/usr/share/dict/words') as f:
        word_list = [line.strip().lower() for line in f if line.strip().isalpha()]
else:
    # Minimal inline fallback for testing
    word_list = ['receive', 'receipt', 'spelling', 'peeling', 'ceiling',
                 'believe', 'achieve', 'relieve', 'retrieve', 'conceive']

checker = SpellChecker(word_list)
print(checker.suggest("recieve"))  # ['receive', 'receipt', ...]
print(checker.suggest("speling"))  # ['spelling', 'peeling', ...]
```

This works, but it's slow. Checking "recieve" against 100,000 dictionary words means 100,000 distance calculations. Each calculation is O(m*n) where m and n are word lengths. On my laptop, that's about 2 seconds per misspelling.

For a real product, 2 seconds is too slow. You need indexing.

## BK-trees - the hidden speedup

A BK-tree (Burkhard-Keller tree) is a data structure that uses the triangle inequality to prune the search space. The idea: if the distance from A to B is d, and the distance from B to C is e, then the distance from A to C is between (d-e) and (d+e). You can use this to skip huge branches of the search tree.

```python
class BKTree:
    def __init__(self):
        self.root = None

    def add(self, word: str):
        if self.root is None:
            self.root = {"word": word, "children": {}}
        else:
            self._add_recursive(self.root, word)

    def _add_recursive(self, node, word):
        dist = levenshtein_optimized(node["word"], word)
        if dist == 0:
            return  # duplicate word, skip it
        if dist not in node["children"]:
            node["children"][dist] = {"word": word, "children": {}}
        else:
            self._add_recursive(node["children"][dist], word)

    def search(self, word: str, max_distance: int = 2):
        if self.root is None:
            return []
        results = []
        self._search_recursive(self.root, word, max_distance, results)
        return results

    def _search_recursive(self, node, word, max_distance, results):
        dist = levenshtein_optimized(word, node["word"])

        if dist <= max_distance:
            results.append((node["word"], dist))

        # Prune branches based on triangle inequality
        for edge_dist in node["children"]:
            if abs(dist - edge_dist) <= max_distance:
                self._search_recursive(
                    node["children"][edge_dist],
                    word,
                    max_distance,
                    results
                )
```

Building a BK-tree for 100,000 words takes ~30 seconds (you do this once and save it). After that, searching for corrections takes 50-100ms instead of 2 seconds. Not magic, but it's the difference between "usable" and "unusable".

## Performance in practice

On a 100K English dictionary:

- **Naive approach**: ~2000ms per lookup (check every word)
- **BK-tree approach**: ~50ms per lookup (prune 99% of candidates)
- **Pre-computed frequency ranking**: ~30ms (rank by frequency in English, so common corrections appear first)

The real speedup comes from combining techniques:
1. BK-tree to find candidates
2. Rank by frequency (correct spelling is usually more common than misspelling)
3. Rank by distance (1-edit corrections before 2-edit)

## Why this matters

Understanding Levenshtein distance taught me something deeper: a lot of "smart" systems are just good data structures + simple math. The spell checker isn't magic. It's a distance metric + a tree that prunes the search space. That's CS fundamentals.

And it's honestly satisfying to implement. There's no black box, no model training, no hyperparameter tuning. Just a well-designed algorithm that obviously works because the math makes sense.

Try implementing it yourself. Start with the naive approach, optimize the space, then add a BK-tree. You'll understand the whole chain: what the algorithm does, where the bottlenecks are, and why certain optimizations matter. That's worth more than just using a library.
