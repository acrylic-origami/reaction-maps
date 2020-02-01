import csv
import sys
import numpy as np

# with open(sys.argv[1], 'r') as f:
# 	c = csv.reader(f)
# 	D = {}
# 	for [aw,bw,s] in c:
# 		aw = int(aw)
# 		if aw not in D:
# 			D[aw] = []
# 		D[aw].append(float(s))
	
# 	P = [np.partition(-np.array(p), 2)[1] for _, p in D.items()]
# 	np.save('P_max.npy', P)
# 	print(np.percentile(P, 2))
		

P = np.load('P_max.npy', allow_pickle=True)
# P = [p[1] for p in P]
# np.save('P_max.npy', P)
print(np.percentile(P, 98))