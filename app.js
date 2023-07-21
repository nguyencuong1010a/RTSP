const express = require('express');
const https = require('https');
const fs = require('fs');
const rtspRelay = require('rtsp-relay');
const cors = require('cors')
const app = express();
app.use(cors());

const { proxy, scriptUrl } = rtspRelay(app); //, server

//Get 
app.ws('/api/stream/:username/:password/:domain/:channel/:port', (ws, req) => {
  proxy({
    url: `rtsp://${req.params.username}:${req.params.password}@${req.params.domain}.kbvision.tv:${req.params.port}/cam/realmonitor?channel=${req.params.channel}&subtype=0`,
    verbose: false,
    transport: 'tcp',
      additionalFlags: [
      "-f", // force format
      "hls",
      "-codec:v", // specify video codec (MPEG1 required for jsmpeg)
      "mpeg1video",
      "-r",
      "30", // 30 fps. any lower and the client can't decode it
      "-preset",
      "slow",
      "-crf",
      "18",
      "-b:v",
      "3M",
      "-s",
      "650x450",
    ],
  })(ws)
}
);

// this is an example html page to view the stream
app.get('/:username/:password/:domain/:channel', (req, res) => {
  if (!req.params.domain.split(':')[1]) {
    res.send('<h1>Params Error</h1>')
    return;
  }
  let domain = req.params.domain.split(':')[0];
  let port = req.params.domain.split(':')[1];
  console.log('Camera is running!')
  res.send(`
  <canvas id='canvas' width='640' height='480'></canvas>
  <script src='${scriptUrl}'></script>
  <script>
    loadPlayer({
      url: 'wss://' + location.host + '/api/stream/${req.params.username}/${req.params.password}/${domain}/${req.params.channel}/${port}',
      canvas: document.getElementById('canvas')
    });
    
  </script>
`)
}
);

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

const PORT = 8000;
app.listen(PORT, () => {
  console.log('Server is running port ' + PORT)
});