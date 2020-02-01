import sys
import pdb
import pickle
import phs
import g2p_phs
import psycopg2
import random
import csv

R = 1.0

if __name__ == '__main__':
    conn = psycopg2.connect('dbname=x2260 user=web')
    # conn.autocommit = True
    
    cur = conn.cursor()
    
    with open(sys.argv[1], 'r') as f:
        C = csv.reader(f)
        for i, lterms in enumerate(C):
            if random.random() < R:
                sys.stdout.write('%d\r' % i)
                place = lterms[0]
                (lat, lon) = lterms[1].split(' ')
                place_phs_ = [phs.phs[w] if w in phs.phs else None for w in place.split(' ')]
                place_phs = None
                if None not in place_phs_:
                    place_phs = []
                    for p in place_phs_:
                        place_phs += p
                    
                elif place in g2p_phs.phs:
                    place_phs = [g for g in g2p_phs.phs[place] if g != '']
                
                if place_phs != None:
                    cur.execute('UPDATE pl SET lat = %s, lon = %s WHERE name = %s', (lat, lon, place))
                    # cur.execute('''
                    #    INSERT INTO pl (name, nph, lat, lon) VALUES (%s, %s, %s, %s)
                    #    ON CONFLICT ON CONSTRAINT "pl_name_key" DO UPDATE SET lat = %s, lon = %s
                    #    RETURNING id
                    #''', (place, len(place_phs), lat, lon, lat, lon))
                    conn.commit()
                    
                    ''' m_pl_id = cur.fetchone()
                    
                    if m_pl_id != None:
                        err = False
                        for n, ph in enumerate(place_phs):
                            cur.execute(''
                                INSERT INTO pl_ph (pl, ph, n) 
                                SELECT %s, ph.id, %s FROM ph WHERE ph.p = %s
                                ON CONFLICT DO NOTHING
                            '', (m_pl_id[0], len(place_phs) - n, ph))
                            conn.commit()
    
    print('')
    '''
