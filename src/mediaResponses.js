const fs = require('fs');
const path = require('path');

const loadFile = (req, res, dir, type) => {
  const file = path.resolve(__dirname, dir);

  fs.stat(file, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
      }
      return res.end(err);
    }

    let { range } = req.headers;

    if (!range) {
      range = 'bytes=0-';
    }

    const positions = range.replace(/bytes=/, '').split('-');
    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;


    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accepted-Ranges': 'bytes',
      'Content-ength': chunksize,
      'Content-type': type,
    });

    const stream = fs.createReadStream(file, { start, end });
    stream.on('open', () => {
      stream.pipe(res);
    });

    stream.on('error', (streamErr) => {
      res.end(streamErr);
    });

    return stream;
  });
};


const getParty = (req, res) => {
  loadFile(req, res, '../client/party.mp4', 'video/mp4');
};

const getBling = (req, res) => {
  loadFile(req, res, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (req, res) => {
  loadFile(req, res, '../client/bird.mp4', 'video/mp4');
}


module.exports = {
  getBird,
  getBling,
  getParty,
};
