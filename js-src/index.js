import ReactDOM from 'react-dom';
import React from 'react';
import MainController from './MainController';
import { Base64 } from 'js-base64';

window.addEventListener('load', () => {
	ReactDOM.render(
		<MainController />,
		document.getElementById('root'));
});