import os
import pickle
import re

if os.path.exists('g2p_phs.pkl'):
	with open('g2p_phs.pkl', 'rb') as f:
		phs = pickle.load(f)
else:
	with open('city-towns-ph.txt', 'r') as f:
		phs = {}
		word = ['', []]
		for l in f:
			if not re.match(r'[\w]', l) and word[0] != '':
				phs[word[0].lstrip(' ')] = word[1]
				word = ['', []]
			else:
				sp = l.rstrip('\n').split(' ')
				word[0] += ' ' + sp[0]
				word[1] += [re.sub(r'[^A-Z]', '', s) for s in sp[1:]]
			
		with open('g2p_phs.pkl', 'wb') as f:
			pickle.dump(phs, f)
