import React from 'react';
import { Map, Marker, TileLayer, Polyline } from 'react-leaflet';
import { latLngBounds, latLng } from 'leaflet';
import Q from 'q'

const RANDALL = [42.2377016, -93.6014727];

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			term: "",
			n_request: 0,
			request: null,
			path: []
		};
	}
	componentDidUpdate(_, l) {
		console.log(arguments);
		if(l.n_request != this.state.n_request) {
			// asdf
			// const F = new FormData();
			// F.append('term', this.state.term);
			const P = fetch(`/q?term=${this.state.term}`)
				.then((res_towns) => res_towns.ok && res_towns.json()
				)
				.then(towns => Q.all(towns.map(town =>
					fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(town)}&format=json`)
						.then(res => res.ok && res.json()
						)
						.then(res => {
							console.log(res)
							if(res.length > 0)
								return console.log(latLng(parseFloat(res[0].lat), parseFloat(res[0].lon))) || latLng(parseFloat(res[0].lat), parseFloat(res[0].lon));
							else
								throw new Exception(`Place not found. Route was supposed to be ${towns.join(' -> ')} but Nominatim didn't recognize ${town}.`);
						})
				)))
				.then(path => this.setState({ path: path }));
			this.setState({
				request: P
			});
		}
	}
	
	
	render = _ => <div>
		<form onSubmit = {e => this.setState(({ n_request }) => ({ n_request: n_request + 1 })) || e.preventDefault()}>
			<input type="text" onChange={e => this.setState({ term: e.target.value })} />
		</form>
		<Map center={RANDALL}
		     style={{ height: '100%' }}
		     zoom={10}
		     bounds={this.state.path.length > 0 ? latLngBounds(this.state.path) : null}>
			<TileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
			/>
			<Polyline positions={this.state.path} />
		</Map>
	</div>
}