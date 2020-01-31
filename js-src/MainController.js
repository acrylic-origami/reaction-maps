import React from 'react';
import { Map, Marker, TileLayer, Polyline, Popup, Tooltip , ZoomControl } from 'react-leaflet';
import { latLngBounds, latLng, divIcon } from 'leaflet';
import { decode } from '@mapbox/polyline';
import Q from 'q';
import { Base64 } from 'js-base64';

const RANDALL = [42.2377016, -93.6014727];

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.search_bar_ref = React.createRef();
		this.uri_stash = React.createRef();
		console.log(this.props.term0);
		this.state = {
			term: this.props.term0 || "",
			term_ph: [],
			n_request: +(this.props.path0 !== null),
			n_fulfilled: 0,
			request: null,
			show_ph: false,
			path: [],
			path_ph: [],
			waypoints: [],
			copying: false
		};
		
		if(this.props.path0 !== null) {
			const path0 = this.props.path0.filter(a => !isNaN(a));
			const F = new FormData();
			F.set('path', path0);
			if(path0.length > 0) {
				fetch('/a', {
					method: 'POST',
					headers: new Headers({ 'content-type': 'application/json' }),
					body: JSON.stringify(path0)
				})
				.then(res => res.json())
				.then(path => this.handle_path('', path))
			}
		}
	}
	componentDidMount() {
		this.search_bar_ref.current.focus();
	}
	handle_path = (term, path_) => {
		const path = path_.filter(p => p[0] !== null);
		const waypoints = path.map(p => [p[0], latLng(p[1], p[2])] );
		history.pushState({}, `route-${term}-done`, `?q=${Base64.encode(term)}&a=${encodeURI(path.map(p => p[3]))}`)
		return fetch(`http://router.project-osrm.org/route/v1/driving/${path.map(p => `${p[2]},${p[1]}`).join(';')}`)
			.then(r => r.json())
			.then(({ routes: [{geometry}] }) =>
				this.setState(({ n_fulfilled }) => ({
					path: decode(geometry).map(p => latLng(p[0], p[1])),
					waypoints,
					n_fulfilled: n_fulfilled + 1
				}))
			)
			.catch(_ => this.setState(({ n_fulfilled }) => ({
				path: waypoints.map(p => p[1]),
				waypoints,
				n_fulfilled: n_fulfilled + 1
			})))
	}
	copyURI = () => {
		const past_focus = document.activeElement;
		this.uri_stash.current.select();
		document.execCommand('copy');
		past_focus.focus();
		this.setState({ copying: true });
	}
	componentDidUpdate(_, l) {
		console.log(this.state.n_request, this.state.n_fulfilled);
		if(this.state.copying)
			setTimeout(_ => this.setState({ copying: false }), 1000);
		
		if(l.n_request != this.state.n_request) {
			const term = this.state.term;
			history.pushState({}, `route-${term}`, `?q=${Base64.encode(term)}`)
			const fail = e => {
				console.log(e);
				this.setState(({ n_fulfilled }) => { n_fulfilled + 1 });
			}
			const P = fetch(`/q?term=${term}`)
				.then((res_towns) => { if(res_towns.ok) return res_towns.json(); else throw new Error(`Request failure for ${term}.`); }
				)
				.then(([ term_ph, path ]) =>
					this.handle_path(term, path)
					    .then(_ => this.setState({
					    	term_ph,
					    	path_ph: path.map(p => p[4]).flat()
					    })), fail)
				.catch(fail);
			this.setState({
				request: P
			});
		}
	}
	
	
	render = _ => <div>
		<Map center={RANDALL}
		     style={{ height: '100%' }}
		     zoom={13}
		     zoomControl={false}
		     bounds={this.state.path.length > 0 ? latLngBounds(this.state.waypoints.map(p => p[1])) : null}>
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
				<li><a href="https://xkcd.com/2260/" title="XKCD comic 2260 (Reaction maps)" target="_blank">XKCD 2260</a></li>
				<li><a href="https://lam.io/blog/x2260" target="_blank">How does this work?</a></li>
				<li>
					{ this.state.copying ?
						"Copied!" :
						<a href="javascript:void(null)" onClick={this.copyURI}>Share this path (copy URI)</a>
					}
				</li>
				<li>
					<a href="https://github.com/acrylic-origami/reaction-maps" target="_blank"><span className="github">&nbsp;</span></a>
				</li>
				<li>
					<input type="checkbox" id="show-ph" onChange={e => this.setState({ show_ph: e.target.checked })} checked={ this.state.show_ph } /><label htmlFor="show-ph">Show phonemes</label>
				</li>
			</ul>
			<input type="text" className="hidden" ref={this.uri_stash} value={window.location.href} />
			<div>
				<form onSubmit = {e => this.setState(({ n_request }) => ({ n_request: n_request + 1 })) || e.preventDefault()} id="query">
					<input type="text" ref={this.search_bar_ref} onChange={e => this.setState({ term: e.target.value })} value={this.state.term} placeholder='Search phrase (e.g. jump in a big hole)' />
					{ (this.state.n_request > this.state.n_fulfilled) && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div> }
				</form>
			</div>
			{ (this.state.show_ph && (this.state.term_ph.length > 0 || this.state.path_ph.length > 0))
				? <div id="phoneme_pane">
					<div id="in_ph">
						<h3>Query phonemes:</h3>
						<ul className="phoneme-list">
							{this.state.term_ph.map((ph, k) => <li key={k} className="term">{ph}</li> )}
						</ul>
					</div>
					<div id="out_ph">
						<h3>Path phonemes:</h3>
						<ul className="phoneme-list">
							{this.state.path_ph.map((ph, k) => <li key={k} className="term">{ph}</li> )}
						</ul>
					</div>
				</div>
				: null }
		</div>
	</div>
}
