from collections import defaultdict
def subarraySum(nums, k: int) -> int:
    
    # IDEA: use prefix-sum
    
    prefixSum = defaultdict(int)
    prefixSum[0] = 1
    count = 0
    curSum = 0
    # k = 5, arr = [2, 3, 5, -1, -9, 5, 3, 3, -10]
    #           [0, 2, 5, 10, 9,  5]
    
    # idea: we try to "chop off" the head and see if the chopped array
    #       is still equal to k, if so, we plus count 
    
    for num in nums:
        curSum += num
        if curSum - k in prefixSum:
            count += prefixSum[curSum - k]
        if curSum in prefixSum:
            prefixSum[curSum] += 1
        else:
            prefixSum[curSum] = 1
        
    
    return count

print(subarraySum([2, 3, 5,-1,-4], 5))