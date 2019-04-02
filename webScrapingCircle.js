const Nightmare = require('nightmare');
const https = require('https');
const fetch = require('node-fetch');
const arrayIpAdreses = [
  '192.168.2.101'
];
let connectSuccess = false;
// ///////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////
function getFromAska(ipIndex = 0) {
  const agent = new https.Agent({
    rejectUnauthorized: false
  })
  console.log(`try connect ip = ${arrayIpAdreses[ipIndex]}`);
  return fetch(`https://${arrayIpAdreses[ipIndex]}:4444/actions`, {
        method: 'get',
        agent
    })
    .then(res => {
      connectSuccess = ipIndex;
      return res.json();
    })
    .catch(err => {
      console.log(err);
      ipIndex < arrayIpAdreses.length - 1 ? ipIndex += 1 : ipIndex = 0;
      return getFromAska(ipIndex);
    });
}
// ////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////////////////
function startWork(collectionActions) {
  function checkPriority(v) {
    let timeMustPast = 0;
    switch (v.priorityCheck) {
      case 'low':
        timeMustPast =  7*24*60*60*1000;
        break;
      case 'medium':
        timeMustPast = 24*60*60*1000;
        break;
      case 'high':
        timeMustPast = 30*60*1000;
        break;
      default:
        console.log('v.priorityCheck = undefined');
    }
    timeMustPast += v.timeLastCheck;
    return timeMustPast < Date.now();
  }
  function sendToAska() {
    if (sendCollection.length > 0) {
      console.log('////////////////////////');
      console.log(sendCollection);
      const agent = new https.Agent({
        rejectUnauthorized: false
      })
      fetch(`https://${arrayIpAdreses[connectSuccess]}:4444/actions`, {
            method: 'post',
            body:    JSON.stringify(sendCollection),
            headers: { 'Content-Type': 'application/json' },
            agent
        })
        .then(res => res.text())
        .then(text => {
          console.log(text);
          text === 'saved' ? sendCollection = [] : '';
        });
        console.log('Send to Aska');
    }
  }
  function finish(name, response) {
    responseCount += 1;
    let i = collectionActions.findIndex(v => v.name == name);
    let proverka = false;
    console.log(name);
    if (typeof response === 'string') {
      proverka = collectionActions[i].value !== response;
    } else {
      proverka = JSON.stringify(collectionActions[i].value) !== JSON.stringify(response);
    }

    if (proverka) {
      if (collectionActions[i].value.length != 0) {
        collectionActions[i].readyToSay = true;
        collectionActions[i].value = response;
        collectionActions[i].timeLastCheck = Date.now();
        if (collectionActions[i].priorityCheck === 'medium') {
          collectionActions[i].sayTimes = 2;
        }
        sendCollection.push(collectionActions[i]);
      } else {
        collectionActions[i].timeLastCheck = Date.now();
        collectionActions[i].value = response;
        sendCollection.push(collectionActions[i]);
      }
    } else {
      if (collectionActions[i].priorityCheck === 'medium' ||
          collectionActions[i].priorityCheck === 'low') {
        collectionActions[i].timeLastCheck = Date.now();
        sendCollection.push(collectionActions[i]);
      } else {
        collectionActions[i].timeLastCheck = Date.now();
      }
    }


    if (responseCount === expectedCount) {
      sendToAska();
      expectedCount = 0;
      responseCount = 0;
    }
  }

  function work() {
    collectionActions.filter(checkPriority).map((v, i) => {
      expectedCount = i + 1;
      return {
        func: new Function('nightmare', 'finish', `${v.code}.then(res => finish('${v.name}', res));`)
      }
    }).forEach(v => v.func(new Nightmare({ show: false }), finish));
  }

  let expectedCount = 0;
  let responseCount = 0;

  let sendCollection = [];
  work();
  console.log('Start work');
  setInterval(() => {
    console.log('Interval start work');
    work();
  }, 5 * 60 * 1000);
}
// ////////////////////////////////////////////////////////////////////////////
module.exports = { getFromAska, startWork };
