const { Command } = require('commander');
const fs = require('fs').promises;
const http = require('http');
const path = require('path');
const { Builder } = require('xml2js');

const program = new Command();

program
    .requiredOption('-h, --host <host>', 'Server host')
    .requiredOption('-p, --port <port>', 'Server port')
    .requiredOption('-i, --input <path>', 'Path to input JSON file');

program.parse(process.argv);
const options = program.opts();

const server = http.createServer(async (req, res) => {
    try {
        const jsonPath = path.resolve(options.input);
        const data = await fs.readFile(jsonPath, 'utf8');
        const json = JSON.parse(data);

        const entries = json.map(item => ({
            Code: item.StockCode,
            Currency: item.ValCode,
            Amount: item.Attraction
        }));

        const builder = new Builder({
            rootName: 'GovernmentBonds',
            xmldec: { version: '1.0', encoding: 'UTF-8' }
        });

        const xmlData = { Bond: entries };
        const xml = builder.buildObject(xmlData);

        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.end(xml);
    } catch (err) {
        console.error(err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading or processing data');
    }
});

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});
