import sys
import pickle
import phs
import psycopg2
import random

R = 0.5

if __name__ == '__main__':
	conn = psycopg2.connect('dbname=x2260 user=web')
	conn.autocommit = True
	
	cur = conn.cursor()
	N = 8192
	tups = []
	for w, phs in phs.phs.items():
		if len(tups) > N:
			cur.execute('INSERT INTO dict_phs_ VALUES %s;' % ','.join(tups))
			tups = []
			
		for i, ph in enumerate(phs):
			tups.append('(\'%s\',\'%s\', %d)' % (w.replace("'", "''"), ph, len(phs) - i))
	
