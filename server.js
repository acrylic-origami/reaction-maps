const express = require('express');
	const app = express();
const Q = require('q');
const { OrderedMap } = require('immutable');
const { pool } = require('./pg');

// const target = 'if only this damn application were easier to program, then i\'d be rolling in it alas too many cities';

const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.listen(8080);

// DP
// psql.query('CREATE TEMPORARY TABLE tph (p VARCHAR(64), n SERIAL PRIMARY KEY);')
// 	.then(_ => psql.query('INSERT INTO tph VALUES %L', target.split(' ')))
// 	.then(_ => psql.query('SELECT * FROM tph'))

function rethrow(msg) {
	return e => { console.log(e); throw new Error(msg); };
}
app.post('/a', (req, res) => {
	const path = req.body.map(p => parseInt(p)).filter(p => !isNaN(p));
	pool.connect()
	    .then(psql => {
	    	return psql.query({
	    		text: `SELECT name, lat, lon, id FROM pl WHERE id IN ('${path.join('\',\'')}')`,
	    		rowMode: 'array'
	    	})
	    		.then(places => {
	    			const ret = []
	    			for(const p of path) {
	    				for(const r of places.rows) {
	    					if(p === r[3]) {
	    						ret.push(r);
	    						break;
	    					}
	    				}
	    			}
	    			res.send(ret);
	    			psql.release();
	    		}).catch(e => {
		 			console.log(e.message);
		 			res.status(501).send(e.message);
		 			psql.release();
		 		});
	    });
});
const N_MAX = 32;
app.get('/q', (req, res) => 
	pool.connect()
	    .then(psql => {
			function fail(e) {
				psql.release();
				res.status(501).send(e.message);
			}
			const terms0 = req.query.term.replace(/[^\w\-\' ]/g, '').replace(/ {2,}/g, ' ').toLowerCase().split(' ')
			if(terms0.length > N_MAX) {
				fail(new Error('Phrase not short and sweet enough (>32 words)'));
			}
			else {
		    	console.log('P: ', Date.now(), req.query.term);
		    	return Q.all(
		    		terms0.map(w => psql.query({
		    			text: 'SELECT ph.id, ph.p FROM dict_ph INNER JOIN dict ON dict.id = dict_ph.word INNER JOIN ph ON ph.id = dict_ph.ph WHERE dict.word = $1 ORDER BY dict_ph.n DESC',
		    			values: [w],
		    			rowMode: 'array'
		    		}))
		    	).then(phs_ => {
		    		const phs = phs_.map(r => r.rows).flat().reduce((prev, next) => prev.length > 0 && prev.slice(-1)[0][0] === next[0] ? prev : prev.concat([next]), []); // note: ph ids
		    		if(phs.length > 0) {
			    		return Q.all(
			    				psql.query('DROP TABLE IF EXISTS tph;'),
			    				psql.query('DROP TABLE IF EXISTS tbest;'),
				    			psql.query('CREATE TEMPORARY TABLE tph (p INT, n SERIAL PRIMARY KEY);'), /// , FOREIGN KEY (p) REFERENCES ph (id)
				    			psql.query('CREATE TEMPORARY TABLE tbest (pl INT, score FLOAT, prev INT, n INT PRIMARY KEY);')
				    				.then(_ => psql.query('INSERT INTO tbest (score, n) VALUES (0, 0);'))
				    		)
							.then(_ => console.log(`INSERT INTO tph (p) VALUES (${phs.map(ph => ph[0]).join('),(')})`) || psql.query(`INSERT INTO tph (p) VALUES (${phs.map(ph => ph[0]).join('),(')})`), () => { throw new Error('Temporary table preparation failed.') })
							.then(_ =>
					    		(function recurse(i) {
					    			if(i <= phs.length) { // also is the invariant in the PSQL side, which is a bit sketch
					    				const query = `SELECT id, ($1 - st1.nph), s FROM (
											  SELECT pl.id, topo.nph, (tbest.score + pl.nph) AS s, RANK() OVER (ORDER BY (tbest.score + pl.nph) ASC) AS r
													FROM topo
													
													INNER JOIN pl ON topo.pl = pl.id
													INNER JOIN tbest ON tbest.n = $1 - topo.nph
													INNER JOIN pl_ph ON pl_ph.pl = pl.id
													INNER JOIN tph ON tph.n = $1 - pl_ph.n + 1
													
													WHERE
														topo.p0 = $2
														${[...Array(Math.min(i - 1, 9)).keys()].map(j => `AND (topo.p${j + 1} = $${j + 3} OR topo.p${j + 1} IS NULL)`).join(' \n')}
											  ) st1
											WHERE r = 1
											LIMIT 1;`;
										const phs_ = phs.slice(Math.max(i - 10, 0), i).map(ph => ph[0]);
										phs_.reverse();
					    				return psql.query({
					    					text: query,
						    				values: [i].concat(phs_),
						    				rowMode: 'array'
						    			})
					    				.then(pl => console.log(pl.rows) || psql.query('INSERT INTO tbest (pl, prev, score, n) VALUES ($1, $2, $3, $4);', (pl.rows[0] || [null, 0, null]).concat([i])), rethrow('Query for terms failed.')) // , places.reduce(([pl0, sc0], [pl, sc]) => sc > sc0 ? [pl, sc] : [pl0, sc0], [null, 0]
					    				.then(_ => recurse(i + 1))
					    				.catch(rethrow('DP array update failed.'));
					    			}
						    		else
						    			return Q.all([
						    				psql.query({
							    				text: `
								    				WITH RECURSIVE t (n, name, lat, lon, id) AS (
								    					SELECT n - pl.nph, pl.name, pl.lat, pl.lon, pl.id FROM tbest INNER JOIN pl ON pl.id = tbest.pl WHERE n = (SELECT n FROM tbest ORDER BY score DESC LIMIT 1)
								    					UNION ALL
								    					SELECT COALESCE(tbest.prev, tbest.n - 1), pl.name, pl.lat, pl.lon, pl.id FROM t
								    						INNER JOIN tbest ON tbest.n = t.n
								    						LEFT JOIN pl ON pl.id = tbest.pl
								    				)
								    				SELECT name, lat, lon, t.id, ph.p FROM t
								    				INNER JOIN pl_ph ON pl_ph.pl = t.id
								    				INNER JOIN ph ON ph.id = pl_ph.ph
								    				ORDER BY t.n ASC, pl_ph.n DESC;
							    				`,
						    					rowMode: 'array'
						    				}),
						    				psql.query({
						    					text: 'SELECT tbest.*, pl.name FROM tbest LEFT JOIN pl ON pl.id = tbest.pl ORDER BY n ASC;',
						    					rowMode: 'array'
						    				})
					    				]);
					    		})(1)
							)
							.then(([route, best]) => {
								console.log(best);
								const D = route.rows.reduce((D_, p) => D_.update(p[3], [p.slice(0,-1), []], (([l, r]) => [l, r.concat([p[4]])])), new OrderedMap()).toArray();
								res.send([
									phs.map(p => p[1]),
									D.map(([_, [l, r]]) => l.concat([r]))
								]);
								psql.release();
							}, rethrow('Query for results failed'))
							.catch(rethrow('Response preparation failed.'));
						}
						else {
							throw new Error('No dictionary words in phrase.');
						}
		    	}).catch(fail)
		    }
    	})
);
