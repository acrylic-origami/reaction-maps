import ReactDOM from 'react-dom';
import React from 'react';
import MainController from './MainController';
import { Base64 } from 'js-base64';

window.addEventListener('load', () => {
	const U = new URLSearchParams(window.location.search);
	const m_term0 = U.get('q');
	const m_path0 = U.get('a');
	ReactDOM.render(
		<MainController
			term0={m_term0 ? Base64.decode(m_term0) : null}
			path0={m_path0 ? m_path0.split(',').map(p => parseInt(p)) : null}
		/>,
		document.getElementById('root'));
});