import fs from 'fs';
import child_process from 'child_process';
import si from 'systeminformation';
import nmap from 'libnmap';

const {
	NMAP_RANGE = '',
} = process.env;


function getSystemData() {
	return new Promise(resolve => si.getAllData(resolve))
		.then(({ processes, users, ...rest }) => rest);
}

async function monitorSystemData() {
	const data = await getSystemData();
	fs.writeFileSync('/var/log/system-data.json', JSON.stringify(data));
	setTimeout(monitorSystemData, 60 * 1000);
}

function getIptstate() {
	return child_process.execSync('iptstate --single');
}

function monitorIptstate() {
	const data = getIptstate();
	fs.writeFileSync('/var/log/iptstate.txt', data);
	setTimeout(monitorIptstate, 5000);
}

function nmapDiscover() {
	const opts = {
		timeout: 1,
		range: NMAP_RANGE.split(','),
		flags: [
		],
	};
	console.log('Nmap opts', opts);
	return new Promise((resolve, reject) =>
		nmap.scan(opts, (err, report) => (err) ? reject(err) : resolve(report)));
}

async function monitorNmap() {
	const data = await nmapDiscover();
	fs.writeFileSync('/var/log/nmap.json', JSON.stringify(data));
	setTimeout(monitorNmap, 5000);
}

function main() {
	monitorSystemData();
	monitorIptstate();
	monitorNmap();
}
main();
