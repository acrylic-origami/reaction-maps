const express = require('express');
	const app = express();
const Q = require('q');
const format = require('pg-format');
const { Pool } = require('pg');
	const pool = new Pool({
		host: 'localhost',
		user: 'derek-lam',
		// password: 'postgres',
		database: 'x2260',
		idleTimeoutMillis: 0
	});

function fail() {
	console.log(arguments);
	process.exit(1);
}

// const target = 'if only this damn application were easier to program, then i\'d be rolling in it alas too many cities';

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.listen(8080);

// DP
// psql.query('CREATE TEMPORARY TABLE tph (p VARCHAR(64), n SERIAL PRIMARY KEY);')
// 	.then(_ => psql.query('INSERT INTO tph VALUES %L', target.split(' ')))
// 	.then(_ => psql.query('SELECT * FROM tph'))
const US_ID = 497230;
app.get('/q', (req, res) => 
	pool.connect()
	    .then(psql => {
	    	return Q.all(
	    		req.query.term.replace(/[^\w\-\' ]/g, '').replace(/ {2,}/g, ' ').split(' ').map(w => psql.query('SELECT ph FROM dict_ph INNER JOIN dict ON dict.id = dict_ph.word WHERE dict.word = $1 ORDER BY dict_ph.n DESC', [w]))
	    	).then(phs_ => {
	    		const phs = phs_.map(r => r.rows.map(r_ => r_['ph'])).flat(); // note: ph ids
	    		console.log(phs);
	    		if(phs.length > 0) {
		    		return Q.all(
			    			psql.query('CREATE TEMPORARY TABLE tph (p INT, n SERIAL PRIMARY KEY);'), /// , FOREIGN KEY (p) REFERENCES ph (id)
			    			psql.query('CREATE TEMPORARY TABLE tbest (pl INT, score FLOAT, n INT PRIMARY KEY);')
			    				.then(_ => psql.query('INSERT INTO tbest (score, n) VALUES (0, 0), (0, 1), (0, 2);'))
			    		)
						.then(_ => console.log(`INSERT INTO tph (p) VALUES (${phs.join('),(')})`) || psql.query(`INSERT INTO tph (p) VALUES (${phs.join('),(')})`))
						.then(_ =>
				    		(function recurse(i) {
				    			if(i <= phs.length) // also is the invariant in the PSQL side, which is a bit sketch
				    				return psql.query({
				    					text: `SELECT id, s FROM (
											  SELECT pl.id, pl.nph, MAX(tbest.score) + SUM(ph_w.w) AS s
											    FROM ng3
											    INNER JOIN ng_ng_w ng_alt ON ng_alt.a = ng3.id
											    INNER JOIN pl ON pl.ng = ng_alt.b
											    INNER JOIN tbest ON tbest.n = $1 - pl.nph
											    
											    INNER JOIN pl_ph ON pl_ph.pl = pl.id
											    INNER JOIN tph ON tph.n = $1 - pl_ph.n + 1
											    INNER JOIN ph_w ON ph_w.a = tph.p AND ph_w.b = pl_ph.ph
											    
											    WHERE ng3.a = $4 AND ng3.b = $3 AND ng3.c = $2
											    GROUP BY pl.id
											  ) st1
											ORDER BY s DESC
											LIMIT 1;`,
					    				values: [i].concat(phs.slice(i-3, i)),
					    				rowMode: 'array'
					    			})
				    				.then(pl => psql.query('INSERT INTO tbest (pl, score, n) VALUES ($1, $2, $3);', (pl.rows[0] || console.log(phs.slice(i-3, i)) || [null, 0]).concat([i]))) // , places.reduce(([pl0, sc0], [pl, sc]) => sc > sc0 ? [pl, sc] : [pl0, sc0], [null, 0]
				    				.then(_ => console.log('.') || recurse(i + 1));
					    		else
					    			return Q.all([
					    				psql.query({
						    				text: `
							    				WITH RECURSIVE t (n, name, lat, lon) AS (
							    					SELECT n - pl.nph, pl.name, pl.lat, pl.lon FROM tbest INNER JOIN pl ON pl.id = tbest.pl WHERE n = (SELECT MAX(n) FROM tbest WHERE pl IS NOT NULL)
							    					UNION ALL
							    					SELECT tbest.n - COALESCE(pl.nph, 1), pl.name, pl.lat, pl.lon FROM t
							    						INNER JOIN tbest ON tbest.n = t.n
							    						LEFT JOIN pl ON pl.id = tbest.pl
							    				)
							    				SELECT name, lat, lon FROM t ORDER BY n ASC;
						    				`,
					    					rowMode: 'array'
					    				}),
					    				psql.query({
					    					text: 'SELECT tbest.*, pl.name FROM tbest LEFT JOIN pl ON pl.id = tbest.pl;',
					    					rowMode: 'array'
					    				})
				    				]);
				    		})(3)
						)
						.then(([route, best]) => {
							console.log(route.rows, best.rows);
							res.send(route.rows);
						}, fail);
					}
					else res.status(501).end();
	    	}, fail)
	    	.catch(fail);
    	})
);