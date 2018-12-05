import fs from 'fs';
import child_process from 'child_process';
import si from 'systeminformation';
import nmap from 'libnmap';

const {
	NMAP_RANGE,
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

function nmapDiscover(range) {
	const command = `nmap -oX /var/log/nmap.xml ${range}`;
	console.log('nmap scanning', command);
	return new Promise(resolve =>
		child_process.exec(command, (err, stdout) => {
			if(err) { throw err; }
			return resolve(stdout);
		}));
}

async function monitorNmap() {
	await nmapDiscover(NMAP_RANGE);
	console.log('Nmap scan finished');
	setTimeout(monitorNmap, 5000);
}

function main() {
	monitorSystemData();
	monitorIptstate();
	monitorNmap();
}
main();
