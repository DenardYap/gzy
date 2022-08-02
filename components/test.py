
class MaxheapObj:

    def __init__(self, val):
        self.val = val

    def __lt__(self, other):
        return self.val > other.val

    def __eq__(self, other):
        return self.val == other.val
    
    def __str__(self, other):
        return str(self.val)
    
class Maxheap:
    def __init__(self):
        self.h = []
        
    def heappush(self, val):
        heapq.heappush(self.h, MaxheapObj(val))
        
    def heappop(self):
        return heapq.heappop(self.h).val
        
    def peek(self):
        if len(self.h) == 0:
            raise "Heap is empty"
        return self.h[0].val
        
    def __getitem__(self, i):
        return self.h[i].val

import heapq

x = Maxheap()
x.heappush(3)
x.heappush(9)
x.heappush(0)
x.heappush(7)
x.heappush(1999)
x.heappush(6)

x.heappush(-3)
print(x.heappop())
print(x.heappop())
print(x.heappop())
print(x.heappop())

print(x.heappop())
print(x.heappop())
print(x.heappop())
# print(x.peek())
a = [1,2, 3, 4, 5, 6]
print(a[1::2])