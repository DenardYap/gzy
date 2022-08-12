def findKthLargest(nums, k: int) -> int:
    
    def quick_select(arr, start, end, k):
        pivot = arr[end]
        i = start
        for j in range(start, end):
            if arr[j] <= pivot:
                print(arr[j], pivot)
                arr[i], arr[j] = arr[j], arr[i]
                i += 1
        arr[i], arr[end] = arr[end], arr[i]

        print("End")
        # print(i, k - 1)
        if i < k - 1:
            return quick_select(arr, i+1, end, k)
        elif i > k - 1:
            return quick_select(arr, start, i-1, k)
        else:
            return arr[i]

    return quick_select(nums, 0, len(nums) - 1, len(nums) + 1 - k)

print(findKthLargest([3,2,1,5,6,4], 2))

import random
a = random.choices(2, [-1, 9, 2])
print(a)