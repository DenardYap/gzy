import collections
def solution(queries, diff):
    
    # one edge case might be when diff is 0 or even negative
    
    res = []
    hash_ = {}
    
    # ["+4", "+5", "+2", "-4"]
    """
    {
      2 : 2,
      4 : 1,
      3 : 1,
      -2: 1
    }
    [1, 7, 3, 9, 2, 10, 4, 12]
    hwo do u find out how many two sums is equal to 13 in O(N)
     
    """
    # O(n) where n is the number of queries 
    
    def calculateSameDiff():
        
        curCount = 0
        # O(n) where n is the number of queries 
        for key in hash_:
            if key + diff in  hash_:
                
                # if diff is zero 
                if diff == 0:
                    # edge case
                    for i in range(0, hash_[key]):
                        curCount += i
                else:
                    curCount += hash_[key] * hash_[key + diff] 
                
        res.append(curCount)
        
    for query in queries:
        
        if query[0] == "+":
            curNumber = int(query[1:])
            
            if curNumber in hash_:
                hash_[curNumber] += 1 
            else:
                hash_[curNumber] = 1 
            calculateSameDiff()
            
        else:
            curNumber = int(query[1:])
            if curNumber in hash_:
                del hash_[curNumber]
            calculateSameDiff()
    
    print(res)
    return res
    
solution(["+4", "+4", "+4", "+4", "+4", "+4", "-4"], 0)