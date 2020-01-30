import ReactDOM from 'react-dom';
import React from 'react';
import MainController from './MainController';

window.addEventListener('load', () => {
	ReactDOM.render(<MainController />, document.getElementById('root'))
});

// import React from 'react';
// import ReactDOM from 'react-dom';
// import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

// class SimpleExample extends React.Component {
//   constructor() {
//     super()
//     this.state = {
//       lat: 51.505,
//       lng: -0.09,
//       zoom: 13
//     }
//   }

//   render() {
//     const position = [this.state.lat, this.state.lng];
//     return (
//       <Map center={position} zoom={this.state.zoom} style={{ height:500 }}>
//         <TileLayer
//           attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//           url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
//         />
//         <Marker position={position}>
//           <Popup>
//             A pretty CSS3 popup. <br/> Easily customizable.
//           </Popup>
//         </Marker>
//       </Map>
//     );
//   }
// }


// window.addEventListener('load', _ => ReactDOM.render(<SimpleExample />, document.getElementById('root')))