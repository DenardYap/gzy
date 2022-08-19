from collections import Counter, defaultdict
from statistics import mean

def meanAndMode(inputArr):
	# Write your code here
	
	# since the arr size is always more than 0 
	# we dont need to account for the edge case 
	# when it's 0 

	mode = 0
	mean = 0 

	hash_ = defaultdict(int)
	
	for num in inputArr:
		mean += num
		hash_[num] += 1

	curHigh = 0
	"""
	{
		1: 1
		2: 2
		7: 1
		3: 1
		-1: 2
	}
	"""
	for key in hash_:
		if curHigh < hash_[key] or (curHigh == hash_[key] and mode > key):
			curHigh = hash_[key]
			mode = key
		 
	mean = round(mean/len(inputArr), 2)
	mode = round(mode, 2)
	return [mean, mode]

print(meanAndMode([1,2,3,4,5]))
print(meanAndMode([0]))
print(meanAndMode([-1]))
print(meanAndMode([99]))
print(meanAndMode([1,-6.8, 2,-3,4,5, 9, -4.3, -4.3, -5.9, -5, 2, 2, -4.3, -4.3,-6.8,-6.8, 2, -4,-6.8, -4]))
