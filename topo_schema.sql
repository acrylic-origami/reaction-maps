CREATE TABLE topo (
	pl INT,
	p0 INT,
	p1 INT,
	p2 INT,
	p3 INT,
	p4 INT,
	p5 INT,
	p6 INT,
	p7 INT,
	p8 INT,
	p9 INT,
);
CREATE INDEX ON topo (p0);
CREATE INDEX ON topo (p1);
CREATE INDEX ON topo (p2);
CREATE INDEX ON topo (p3);
CREATE INDEX ON topo (p4);
CREATE INDEX ON topo (p5);
CREATE INDEX ON topo (p6);
CREATE INDEX ON topo (p7);
CREATE INDEX ON topo (p8);
CREATE INDEX ON topo (p9);
ALTER TABLE topo ADD FOREIGN KEY (pl) ON pl(id);

INSERT INTO topo
SELECT
p0.pl,
p0.ph,
p1.ph,
p2.ph,
p3.ph,
p4.ph,
p5.ph,
p6.ph,
p7.ph,
p8.ph,
p9.ph
FROM (SELECT id FROM pl WHERE nph <= 10) st0
INNER JOIN pl_ph p0 ON p0.pl = st0.id
LEFT JOIN pl_ph p1 ON p1.pl = st0.id AND p1.n > p0.n
LEFT JOIN pl_ph p2 ON p2.pl = st0.id AND p2.n > p1.n
LEFT JOIN pl_ph p3 ON p3.pl = st0.id AND p3.n > p2.n
LEFT JOIN pl_ph p4 ON p4.pl = st0.id AND p4.n > p3.n
LEFT JOIN pl_ph p5 ON p5.pl = st0.id AND p5.n > p4.n
LEFT JOIN pl_ph p6 ON p6.pl = st0.id AND p6.n > p5.n
LEFT JOIN pl_ph p7 ON p7.pl = st0.id AND p7.n > p6.n
LEFT JOIN pl_ph p8 ON p8.pl = st0.id AND p8.n > p7.n
LEFT JOIN pl_ph p9 ON p9.pl = st0.id AND p9.n > p8.n;
