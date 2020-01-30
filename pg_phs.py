import os
import pickle
import re
import psycopg2


conn = psycopg2.connect('dbname=x2260 user=postgres password=postgres')
conn.autocommit = True

cur = conn.cursor()
with open('dict', 'r') as f:
	for l in f:
		sp = l.rstrip('\n').split(' ')
		cur.execute('INSERT INTO dict (word) VALUES (%s) ON CONFLICT DO NOTHING RETURNING id;', (sp[0],))
		m_word_id = cur.fetchone()
		if m_word_id != None:
			phs = [re.sub(r'[^A-Z]', '', s) for s in sp[1:]]
			for n, s in enumerate(phs):
				cur.execute('INSERT INTO dict_ph (word, ph, n) SELECT %s, id, %s FROM ph WHERE p = %s ON CONFLICT DO NOTHING;', (m_word_id[0], len(phs) - n, s))
