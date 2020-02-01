import os
import pickle
import re

if os.path.exists('phs.pkl'):
	with open('phs.pkl', 'rb') as f:
		phs = pickle.load(f)
else:
	with open('dict', 'r') as f:
		phs = {}
		for l in f:
			sp = l.rstrip('\n').split(' ')
			phs[sp[0]] = [re.sub(r'[^A-Z]', '', s) for s in sp[1:]]
			
		with open('phs.pkl', 'wb') as f:
			pickle.dump(phs, f)