import React from 'react';
import { Map, Marker, TileLayer, Polyline, Popup, Tooltip , ZoomControl } from 'react-leaflet';
import { latLngBounds, latLng, divIcon } from 'leaflet';
import { decode } from '@mapbox/polyline';
import Q from 'q'

const RANDALL = [42.2377016, -93.6014727];

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.search_bar_ref = React.createRef();
		this.state = {
			term: "",
			n_request: 0,
			n_fulfilled: 0,
			request: null,
			path: [],
			waypoints: []
		};
	}
	componentDidMount() {
		this.search_bar_ref.current.focus()
	}
	componentDidUpdate(_, l) {
		if(l.n_request != this.state.n_request) {
			// asdf
			// const F = new FormData();
			// F.append('term', this.state.term);
			const P = fetch(`/q?term=${this.state.term}`)
				.then((res_towns) => res_towns.ok && res_towns.json()
				)
				.then(path_ => {
					const path = path_.filter(p => p[0] !== null);
					const waypoints = path.map(p => [p[0], latLng(p[1], p[2])] );
					fetch(`http://router.project-osrm.org/route/v1/driving/${path.map(p => `${p[2]},${p[1]}`).join(';')}`)
						.then(r => r.json())
						.then(({ routes: [{geometry}] }) =>
							this.setState(n_fulfilled => ({
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
				});
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
			</ul>
			<form onSubmit = {e => this.setState(({ n_request }) => ({ n_request: n_request + 1 })) || e.preventDefault()} id="query">
				<input type="text" ref={this.search_bar_ref} onChange={e => this.setState({ term: e.target.value })} placeholder='Search phrase (e.g. jump in a big hole)' />
				{ (this.state.n_request > this.state.n_fulfilled) && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div> }
			</form>
		</div>
	</div>
}