import React from 'react';
import { Map, Marker, TileLayer, Polyline, Popup, Tooltip , ZoomControl } from 'react-leaflet';
import { latLngBounds, latLng, divIcon } from 'leaflet';
import { decode } from '@mapbox/polyline';
import Q from 'q';
import { Base64 } from 'js-base64';

const RANDALL = [42.2377016, -93.6014727];

const IPA = { 'AE':'&aelig;', 'AH':'&#592;', 'AA':'&#593;', 'B':'b', 'D':'d', 'DH':'&eth;', 'AX':'&#601;', 'EH':'&epsilon;', 'ER': '&#602;', 'EY':'e&#618;', 'F':'f', 'G':'g', 'H':'h', 'IH':'&#618;', 'IX':'&#616;', 'IY':'i', 'K':'k', 'L':'l', 'EL':'&#7735;', 'M':'m', 'M':'m', 'N':'n', 'NG':'&#331;', 'AO':'&#596;', 'P':'p', 'R':'&#633;', 'NX':'n&#33E', 'DX':'&#638;', 'S':'s', 'SH':'&#643;', 'T':'t', 'TH':'&theta;', 'UW':'u', 'UH':'&#650;', 'UX':'&#649;', 'V':'v', 'W':'w', 'WH':'&#653;', 'Y':'j', 'Z':'z', 'ZH':'&#658;', 'Q':'&#660;', 'AW':'a&#650;', 'AY':'a&#618;', 'OW':'o&#650;', 'OY':'&#596;&#618;', 'CH':'&#643;', 'JH':'d&#658;', 'EM':'m&#329;', 'EN':'n&#329;' };

function fromURL() {
	const U = new URLSearchParams(window.location.search);
	const m_term0 = U.get('q');
	const m_path0 = U.get('a');
	return {
		term: m_term0 ? Base64.decode(m_term0) : null,
		path: m_path0 ? m_path0.split(',').map(p => parseInt(p)) : null
	}
}


export default class extends React.Component {
	constructor(props) {
		super(props);
		this.search_bar_ref = React.createRef();
		this.uri_stash = React.createRef();
		
		const { term, path } = fromURL();
		
		this.state = {
			term: term || "",
			term_ph: [],
			n_request: +(path !== null),
			n_fulfilled: 0,
			request: null,
			show_ph: false,
			path: [],
			path_ph: [],
			waypoints: [],
			err: null,
			copying: false
		};
		
		window.addEventListener('popstate', e => {
			const { term, path } = fromURL();
			this.setState({ term });
			this.handle_uri_path(path);
		});
		this.handle_uri_path(path);
	}
	componentDidMount() {
		this.search_bar_ref.current.focus();
	}
	fail = (e) => {
		this.setState(({ n_fulfilled }) => ({ err: [e.message, false], n_fulfilled: n_fulfilled + 1 }));
	}
	handle_uri_path = (ids) => {
		if(ids !== null && ids.length > 0) {
			ids.filter(a => !isNaN(a));
			const F = new FormData();
			F.set('path', ids);
			return fetch('/a', {
				method: 'POST',
				headers: new Headers({ 'content-type': 'application/json' }),
				body: JSON.stringify(ids)
			})
			.then(res => res.json())
			.then(path => this.handle_path('', path, false))
			.catch(_ => this.fail(new Error('Could not handle path supplied by URL')))
		}
		else {
			return Q();
		}
	}
	handle_path = (term, path_, push = true) => {
		const path = path_.filter(p => p[0] !== null);
		const waypoints = path.map(p => [p[0], latLng(p[1], p[2])] );
		if(path.length === 1) {
			this.setState(({ n_fulfilled }) => ({
				path: [],
				waypoints,
				n_fulfilled: n_fulfilled + 1
			}));
			return Q();
		}
		else if(path.length > 1) {
			if(push)
				history.pushState({}, `route-${term}-done`, `?q=${Base64.encode(term)}&a=${encodeURI(path.map(p => p[3]))}`);
			
			return fetch(`http://router.project-osrm.org/route/v1/driving/${path.map(p => `${p[2]},${p[1]}`).join(';')}`)
				.then(r => {
					if(r.ok)
						return r.json();
					else
						throw new Error('Failed to query OSRM routing server.');
				})
				.then(r => {
					if(r.routes.length === 0) throw new Error('No routes found.');
				        else return r;
				})
				.then(({ routes: [{geometry}] }) =>
					this.setState(({ n_fulfilled }) => ({
						path: decode(geometry).map(p => latLng(p[0], p[1])),
						waypoints,
						n_fulfilled: n_fulfilled + 1
					}))
				)
				.catch(e => this.setState(({ n_fulfilled }) => ({
					path: waypoints.map(p => p[1]),
					waypoints,
					n_fulfilled: n_fulfilled + 1,
					err: [ e.msg, false ]
				})))
		}
		else {
			throw new Error('Not enough waypoints found from phrase.');
		}
	}
	copyURI = () => {
		const past_focus = document.activeElement;
		this.uri_stash.current.select();
		document.execCommand('copy');
		past_focus.focus();
		this.setState({ copying: true });
	}
	componentDidUpdate(_, l) {
		// console.log(this.state.n_request, this.state.n_fulfilled);
		if(this.state.err !== null && !this.state.err[1]) {
			const this_err = this.state.err[0];
			this.setState(({ err }) => err !== null && (err[0] === this_err ? { err: [this_err, true] } : {}));
			setTimeout(_ => this.setState(({ err }) => err !== null && (err[0] === this_err ? { err: null } : {})), 4000);
		}
		if(this.state.copying)
			setTimeout(_ => this.setState({ copying: false }), 1000);
		
		if(l.n_request != this.state.n_request) {
			const term = this.state.term;
			// history.pushState({}, `route-${term}`, `?q=${Base64.encode(term)}`)
			const fail = e => {
				console.log(e);
				this.setState(({ n_fulfilled }) => { n_fulfilled + 1 });
			}
			const P = fetch(`/q?term=${term}`)
				.then((res_towns) => {
					if(res_towns.ok)
						return res_towns.json();
					else
						return res_towns.text().then(t => {
							throw new Error(t);
						});
				})
				.then(([ term_ph, path ]) =>
					this.handle_path(term, path)
					    .then(_ => this.setState({
					    	term_ph,
					    	path_ph: path.map(p => p[4]).flat()
					    })))
				.catch(this.fail);
			this.setState({
				request: P
			});
		}
	}
	
	
	render = _ => <div>
		<Map center={this.state.waypoints.length === 1 ? this.state.waypoints[0][1] : RANDALL}
		     style={{ height: '100%' }}
		     zoom={13}
		     zoomControl={false}
		     bounds={this.state.path.length > 1 ? latLngBounds(this.state.waypoints.map(p => p[1])) : null}>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
			/>
			<Polyline positions={this.state.path} />
			{
				this.state.waypoints.map((p, k) =>
					<Marker position={p[1]} key={k} icon={divIcon({ html: `
						<div><span class="ordinal">${k+1}</span><span class="place-name">${p[0]}</span></div>
					`, className: 'place-icon' })} />
				)
			}
			<ZoomControl position="topright" />
		</Map>
		<div id="controls">
			<ul id="context-bar">
				<li><a href="//lam.io" target="_blank"><div class="logo"></div></a></li>
				<li className="boxed"><a href="https://xkcd.com/2260/" title="XKCD comic 2260 (Reaction maps)" target="_blank">XKCD 2260</a></li>
				<li className="boxed"><a href="https://lam.io/projects/x2260" target="_blank">How does this work?</a></li>
				<li className="boxed">
					{ this.state.copying ?
						"Copied!" :
						<a href="javascript:void(null)" onClick={this.copyURI}>Share this path (copy URI)</a>
					}
				</li>
				<li className="boxed">
					<a href="https://github.com/acrylic-origami/reaction-maps" target="_blank"><span className="github">&nbsp;</span></a>
				</li>
				<li className="boxed">
					<input type="checkbox" id="show-ph" onChange={e => this.setState({ show_ph: e.target.checked })} checked={ this.state.show_ph } /><label htmlFor="show-ph">Show phonemes</label>
				</li>
			</ul>
			<input type="text" className="hidden" ref={this.uri_stash} value={window.location.href} />
			<div>
				<form onSubmit = {e => this.setState(({ n_request }) => ({ n_request: n_request + 1 })) || e.preventDefault()} id="query">
					<input type="text"
						ref={this.search_bar_ref}
						onChange={e => this.setState({ term: e.target.value })}
						className={this.state.err && 'err'}
						value={this.state.term}
						placeholder='Search phrase (e.g. jump in a big hole)' />
					{ (this.state.n_request > this.state.n_fulfilled) && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div> }
				</form>
			</div>
			{ (this.state.show_ph && (this.state.term_ph.length > 0 || this.state.path_ph.length > 0))
				? <div id="phoneme_pane">
					<div id="in_ph">
						<h3>Query phonemes:</h3>
						<ul className="phoneme-list">
							{this.state.term_ph.map((ph, k) => <li key={k} className="term" dangerouslySetInnerHTML={{__html: IPA[ph.trim()] }}></li> )}
						</ul>
					</div>
					<div id="out_ph">
						<h3>Path phonemes:</h3>
						<ul className="phoneme-list">
							{this.state.path_ph.map((ph, k) => <li key={k} className="term" dangerouslySetInnerHTML={{__html: IPA[ph.trim()] }}></li> )}
						</ul>
					</div>
				</div>
				: null }
			{ this.state.err && <div id="err_container">
					{this.state.err[0]}
				</div> }
		</div>
	</div>
}
