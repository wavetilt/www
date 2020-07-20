import * as Surplus from 'surplus';
import S from 's-js';
import * as router from 'sig-router';
import jss, {getDynamicStyles} from "jss";
import preset from "jss-preset-default";

const WAVETILT_BLUE = '#00D1FE';

jss.setup(Object.assign(preset(), {id:{minify:true}}));

function assembleObject(path, value) {
	const root = {};
	let cur = root;
	path = path.slice();
	const terminal = path.pop();
	for (const key of path) {
		cur = cur[key] = {};
	}
	cur[terminal] = value;
	return root;
}

function enumerateAllRules(root, path = [], result = []) {
	for (const key of Object.keys(root)) {
		const v = root[key];
		if (typeof v === 'function') {
			((path, v) => result.push([v, () => assembleObject(path, v())]))(path.concat(key), v);
		} else if (typeof v === 'object') {
			enumerateAllRules(v, path.concat(key), result);
		} else {
			throw new Error(`dynamic styles included non-function/-object value: ${v}`);
		}
	}

	return result;
}

const css = styles => {
	const dynamicStyles = getDynamicStyles(styles);

	const sheet = jss.createStyleSheet(styles, {link: Boolean(dynamicStyles)}).attach();

	if (dynamicStyles) {
		S.root(() => {
			const rules = enumerateAllRules(dynamicStyles);
			rules.forEach(([signal, generator]) => {
				S.on(signal, () => {
					sheet.update(generator());
				}, null, false);
			});
		});
	}

	return sheet.classes;
};

const C = css({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: '100%'
	},
	center: {
		display: 'flex',
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		height: '100%'
	},
	nav: {
		width: '100%',
		height: '2rem',
		background: 'white',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		color: 'black',
		'& > a': {
			fontSize: '1rem',
			lineHeight: '2rem',
			vAlign: 'center',
			color: 'black',
			textDecoration: 'none',
			textAlign: 'center',
			padding: '0 2rem',

			'&:hover > span': {
				borderBottom: '1px solid black'
			}
		}
	}
});

const Logo = ({fill=WAVETILT_BLUE, ...rest}) => (
	<svg
		width="100%"
		height="100%"
		viewBox="0 0 600 656"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		{...rest}
	>
		<path style={{fill: fill}} d="M110.406,613.435l-10.625,0l-7.312,26.725l-7.188,-26.725l-9.812,0l-7.188,26.725l-7.312,-26.725l-10.563,0l11.938,42.431l11,0l7.062,-26.218l7,26.218l11.063,0l11.937,-42.431Zm70.938,42.431l-17.5,-42.431l-10.563,0l-17.5,42.431l11.063,0l2.937,-7.726l17.625,0l2.938,7.726l11,0Zm71,-42.431l-11.375,0l-11.438,28.118l-11.375,-28.118l-11.375,0l17.813,42.431l9.937,0l17.813,-42.431Zm61.687,33.438l-22.312,0l0,-7.979l20.312,0l0,-8.486l-20.312,0l0,-7.98l22.125,0l0,-8.993l-32.438,0l0,42.431l32.625,0l0,-8.993Zm66.438,-24.318l0,-9.12l-37.375,0l0,9.12l13.562,0l0,33.311l10.25,0l0,-33.311l13.563,0Zm40.187,33.311l0,-42.431l-10.312,0l0,42.431l10.312,0Zm63.188,-9.12l-20.625,0l0,-33.311l-10.313,0l0,42.431l30.938,0l0,-9.12Zm65.75,-24.191l0,-9.12l-37.375,0l0,9.12l13.562,0l0,33.311l10.25,0l0,-33.311l13.563,0Zm-385.625,16.592l-10.688,0l5.313,-13.932l5.375,13.932Zm436.031,-570.372c0,-37.958 -30.817,-68.775 -68.775,-68.775l-462.45,0c-37.958,0 -68.775,30.817 -68.775,68.775l0,462.45c0,37.958 30.817,68.775 68.775,68.775l462.45,0c37.958,0 68.775,-30.817 68.775,-68.775l0,-462.45Zm-300,-24.82c141.315,0 256.045,114.73 256.045,256.045c0,141.315 -114.73,256.045 -256.045,256.045c-141.315,0 -256.045,-114.73 -256.045,-256.045c0,-141.315 114.73,-256.045 256.045,-256.045Zm-191.549,351.149c181.097,48.543 152.546,-189.028 403.084,-63.628c-15.24,103.121 -104.206,182.364 -211.535,182.364c-83.866,0 -156.521,-48.384 -191.549,-118.736Zm400.445,-111.069c3.561,3.461 3.512,9.296 -0.109,13.022c-3.622,3.727 -9.453,3.943 -13.014,0.483c-3.561,-3.461 -0.845,-9.038 -17.283,-8.334c17.543,-11.057 26.845,-8.631 30.406,-5.171Zm-31.658,-53.544c11.98,0 21.707,10.179 21.707,22.716c0,12.538 -9.727,22.717 -21.707,22.717c-11.98,0 -16.659,-14.218 -43.918,14.639c11.763,-48.63 31.938,-60.072 43.918,-60.072Z"/>
	</svg>
);

const Link = ({children, href='/', ...rest}) => {
	if (typeof href === 'string') {
		href = href.replace(/^\/+|\/+$/g, '');
	}

	const hrefPath = typeof href === 'string'
		? href
		: '/' + href.join('/');

	href = Array.isArray(href)
		? href
		: href.split(/\/+/g);

	return (
		<a href={hrefPath} onClick={() => {
			router.go(href);
			return false;
		}} {...rest}>
			{children}
		</a>
	);
};

const Nav = ({children}) => (
	<div className={C.nav}>
		{children}
	</div>
);

const Root = () => (
	<div className={C.root}>
		<!--<Link href='/games'><span>Games</span></Link>
		<Link href='/about'><span>About</span></Link>-->
		<Nav>
			<a href="mailto:support@wavetilt.com"><span>Contact</span></a>
			<a href="https://discord.gg/7kcFMrH"><span>Discord</span></a>
		</Nav>
		<div className={C.center}>
			<Logo fill="white" style={{width: '9rem'}} />
		</div>
	</div>
);

document.body.prepend(S.root(() => {
	function getRandomArbitrary(min, max) {
		return Math.random() * (max - min) + min;
	}

	return Root();
}));
