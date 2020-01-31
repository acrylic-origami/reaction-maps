import numpy as np
import psycopg2

conn = psycopg2.connect('dbname=x2260 user=derek-lam')
conn.autocommit = True
cur = conn.cursor()
L = np.load('ng3_perms_NN_20.npy')

for l in range(L.shape[0]):
	# li = (l // (39 ** 2), (l // 39) % 39, l % 39)
	tups = []
	for k in range(L.shape[2]):
		# ki = (L[1,l,k] // (39 ** 2), (L[l,1,k] // 39) % 39, L[1,l,k] % 39)
		# print((L[0,l,k],) + li + ki)
		tups.append('(%d,%d,%d)' % (l+1,L[l,1,k]+1,L[l,0,k]))
		
	cur.execute('INSERT INTO ng_ng_w (a, b, w) VALUES %s;' % ','.join(tups)) # % '),('.join([','.join([str(m // (39 ** 2)), str((m // 39) % 39), str(m % 39)]) for m in k])
