#include <iostream>

using namespace std;

int what_is_2x281 () {
    int x = 281, y = 100;
    return x += y;
}

int main() { 
   int some_ints[5] = {1, 2, 3, 4, 0}; 
   int a = 0;
   for (int *p = some_ints; p; ++p) {

        cout << a << endl;
        a++;
   }
   return 0; 
}