const fs = require('fs').promises;
const Forwarder = require('./Forwarder');
const Observer = require('./Observer');

async function main() {
  try {
    const ruleData = await fs.readFile('./rule.json', 'utf8');
    const rules = JSON.parse(ruleData);

    const forwarders = [];
    const observers = [];

    for (const rule of rules) {
      const forwarder = new Forwarder(rule);
      const observer = new Observer(rule);

      forwarder.forwarders.forEach(f => observer.addForwarder(f));

      observer.on('suspend', () => forwarder.suspend());
      observer.on('resume', () => forwarder.resume());

      forwarders.push(forwarder);
      observers.push(observer);
    }

    await Promise.all(forwarders.map(f => f.start()));

    console.log('Port forwarding started');

    process.on('SIGINT', async () => {
      await Promise.all(forwarders.map(f => f.stop()));
      console.log('Port forwarding stopped');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
