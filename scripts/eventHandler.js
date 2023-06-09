const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const HOSTNAME = '127.0.0.1';
const PORT = 3001;

const app = express();
app.use(bodyParser.urlencoded({ extended: true })).use(express.json());
app.use(
  cors({
    origin: '*',
  }),
);
// Mock state of the fork
const approvalState = {};

app.post('/reset', (req, res) => {
  try {
    Object.keys(approvalState).forEach((key) => {
      delete approvalState[key];
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Success');
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.write(`Send notification failed: ${JSON.stringify(error)}`);
    res.end();
  }
});

app.get('/logs', (req, res) => {
  try {
    console.log(approvalState);
    if (
      Object.values(approvalState).length === 2 &&
      Object.values(approvalState).every((state) => state)
    ) {
      res.writeHead(200, { 'Content-Type': 'json/application' });
      res.write(JSON.stringify({ status: 'MergeFinalized' }));
    } else if (Object.values(approvalState).some((state) => state)) {
      const proposer = Object.keys(approvalState)
        ? Object.keys(approvalState)[0]
        : undefined;
      res.writeHead(200, { 'Content-Type': 'json/application' });
      res.write(JSON.stringify({ status: 'MergeProposal', proposer }));
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'json/application' });
    res.write(
      JSON.stringify({
        status: 'Failed',
        error: `Send notification failed: ${JSON.stringify(error)}`,
      }),
    );
    res.end();
  }
});

app.post('/sign', async (req, res) => {
  try {
    const { address } = req.body;
    approvalState[address] = true;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Send notification');

    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.write(`Send notification failed: ${JSON.stringify(error)}`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
