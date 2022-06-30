#include <vector>
#include <iostream>
#include <deque>
#include <algorithm>
using namespace std;
struct Node {
    uint32_t ID;
    uint32_t dist;
};

bool comp(Node &a, Node &b) {
    return a.dist == b.dist ? a.ID < b.ID : a.dist < b.dist;
}
int main() {
    vector<vector<uint32_t>> edges = { {1, 3}, 
                                       {4, 0},
                                       {5, 3, 4},
                                       {0, 2},
                                       {1, 2},
                                       {2}
                                         };
    deque<uint32_t> q;
    q.push_front(0);
    vector<bool> visited(edges.size(), false);
    vector<Node> tmpResult;
    uint32_t dist = 0;
    visited[0] = true;
    while (!q.empty()){
        int curSize = (int)q.size();
        for (int _ = 0; _ < curSize; _++){
            uint32_t curNode = q.back();
            tmpResult.push_back(Node{curNode, dist});
            q.pop_back();
            for (int j = 0; j < (int)edges[curNode].size(); j++){
                if (!visited[edges[curNode][j]]){
                    q.push_front(edges[curNode][j]);
                    visited[edges[curNode][j]] = true;
                }
            }
        }
        dist++;
    }

    sort(tmpResult.begin(), tmpResult.end(), comp);

    vector<uint32_t> result;
    for (int i = 0; i < (int)tmpResult.size(); i++){
        cout << tmpResult[i].ID << '\t';
    }
    cout << endl;




}