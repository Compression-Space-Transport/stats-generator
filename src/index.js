import fs from 'fs';
import child_process from 'child_process';
import si from 'systeminformation';

function getSystemData() {
	return new Promise(resolve => si.getAllData(resolve))
		.then(({ processes, users, ...rest }) => rest);
}

async function monitorSystemData() {
	const data = await getSystemData();
	fs.writeFileSync('/var/log/system-data.json', JSON.stringify(data));
	setTimeout(monitorSystemData, 10000);
}

function getIptstate() {
	return child_process.execSync('iptstate --single -l');
}

function monitorIptstate() {
	const data = getIptstate();
	fs.writeFileSync('/var/log/iptstate.txt', data);
	setTimeout(monitorIptstate, 5000);
}

function main() {
	monitorSystemData();
	monitorIptstate();
}
main();
