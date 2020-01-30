import sys
import pickle
import phs
import g2p_phs
import psycopg2
import random

R = 0.2

if __name__ == '__main__':
	conn = psycopg2.connect('dbname=x2260 user=derek-lam')
	# conn.autocommit = True
	
	cur = conn.cursor()
	
	with open(sys.argv[1], 'r') as f:
		for i, l in enumerate(f):
			if random.random() < R:
				sys.stdout.write('%d\r' % i)
				place = l.lower().split('\t')[2]
				place_phs_ = [phs.phs[w] if w in phs.phs else None for w in place.split(' ')]
				place_phs = None
				if None not in place_phs_:
					place_phs = []
					for p in place_phs_:
						place_phs += p
					
				elif place in g2p_phs.phs:
					place_phs = g2p_phs.phs[place]
				
				if place_phs != None:
					cur.execute('''
						INSERT INTO pl (name, nph) VALUES (%s, %s)
						ON CONFLICT DO NOTHING
						RETURNING id
					''', (place, len(place_phs)))
					m_pl_id = cur.fetchone()
					
					if m_pl_id != None:
						err = False
						for n, ph in enumerate(place_phs):
							cur.execute('''
								INSERT INTO pl_ph (pl, ph, n) 
								SELECT %s, ph.id, %s FROM ph WHERE ph.p = %s
							''', (m_pl_id[0], len(place_phs) - n, ph))
							if cur.rowcount == 0:
								print(ph)
								err = True
								conn.rollback()
								break
								
						if not err:
							conn.commit()
	
	print('')