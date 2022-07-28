class Solution:
    def maximumScore(self, a: int, b: int, c: int) -> int:
        
        # Records
        # Basic idea done in 8 mins
        # Memoization done in ~ 20 mins
        count = 0
        memo = set()
        
        # top-down, still too slow 
        # O(3N)
        # Observation: 3 2 1 <==> 1 2 3 <==> 2 1 3, so we dont need to memoize al of them, just
        def helper(a, b, c, score):
            nonlocal count
            if ((a == 0 and b == 0) or (b == 0 and c == 0) or (c == 0 and a == 0)):
                # the game is ended
                count = max(count, score)
            if (a, b, c) in memo:
                return; # dont need to redo the same thing twice
            
            if (a and b):
                helper(a - 1, b - 1, c, score + 1)
            if (b and c):
                helper(a, b - 1, c - 1, score + 1)
            if (c and a):
                helper(a - 1, b, c - 1, score + 1)
            
            memo.add((a, b, c))
        
        helper(a, b, c, 0);

        # bottom up
        # 3d memo of a, b, c sizes
        # spent 5 minutes on learning how to initialize a 3d vector in python lol
        # memo = [[[0 for k in range(a)] for j in range(b)] for i in range(c)]
        # for i in range(b):
        #     memo
        return count
    
a = Solution()
print(a.maximumScore(10, 10, 10))
print(a.maximumScore(5, 6, 19))
print(a.maximumScore(6, 3, 21))
print(a.maximumScore(7, 7, 16))