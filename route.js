const express = require('express');
const Nightmare = require('nightmare');
const router = express.Router();

busy = false;
answer = 'test';
// //////////////////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////////////////////////
function startRunCode(request, response) {
  busy = true;
  let func = new Function('nightmare', 'response', request.body.answer.code);
  func(new Nightmare({ show: (request.body.answer.devMode === 'true') }), response);
}

router.get('/checkOnline', function (req, res) {
  busy ?
  res.status(201).send() :
  res.status(200).send() ;
});

router.post('/sendCode', function (req, res) {
  busy ?
  res.status(201).send() :
  startRunCode(req, res) ;
});

router.post('/answer', function (req, res) {
  busy ?
  answer = { secondRes: res, data: req.body.answer } :
  res.status(201).send();
});

module.exports.rout = router;
