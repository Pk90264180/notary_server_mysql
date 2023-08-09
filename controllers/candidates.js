const express = require('express');
const router = express.Router();
const connection = require('../db');

const currentDate = new Date();
const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
const formattedDate = currentDate
  .toLocaleDateString('en-US', options)
  .replace(/\//g, '-');

// add user - POST
router.post('/adduser', (req, res) => {
  const { uid, name } = req.body;
  const query = 'INSERT INTO User (uid, name) VALUES (?, ?)';
  connection.query(query, [uid, name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add user' });
    } else {
      res.status(201).json({ message: 'User added successfully' });
    }
  });
});

// get All users - GET
router.get('/users', (req, res) => {
  const query = 'SELECT uid, name FROM User';
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch users' });
    } else {
      res.status(200).json(results);
    }
  });
});

// // add canfidate - POOST

router.post('/addcandidate', (req, res) => {
  const { cid, uid, candidateName } = req.body;

  const queryCandidate =
    'INSERT INTO Candidate (cid, uid, candidateName) VALUES (?, ?, ?)';
  const queryCandidateStatus =
    'INSERT INTO CandidateStatus (cid, status, statusUpdatedAt) VALUES (?, "contacted", NOW())';

  connection.query(
    queryCandidate,
    [cid, uid, candidateName],
    (err, candidateResults) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add candidate' });
      } else {
        connection.query(
          queryCandidateStatus,
          [cid],
          (statusErr, statusResults) => {
            if (statusErr) {
              console.error(statusErr);
              res.status(500).json({ error: 'Failed to add candidate' });
            } else {
              res.status(201).json({ message: 'Candidate added successfully' });
            }
          }
        );
      }
    }
  );
});

// Get candidate statis - GET
router.get('/candidates/:cid/status', (req, res) => {
  const { cid } = req.params;
  const query =
    'SELECT cid, status, statusUpdatedAt FROM CandidateStatus WHERE cid = ?';

  connection.query(query, [cid], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch status' });
    } else {
      if (results.length === 0) {
        res.status(200).json({
          cid: parseInt(cid),
          status: 'contacted',
          statusUpdatedAt: formattedDate,
        });
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});

// console.log('hi');

// console.log(formattedDate);

router.put('/candidates/:cid/status', (req, res) => {
  const { cid } = req.params;
  const { status } = req.body;

  const queryInsert =
    'INSERT INTO CandidateStatus (cid, status, statusUpdatedAt) VALUES (?, ?, NOW())';
  const queryUpdate =
    'UPDATE CandidateStatus SET status = ?, statusUpdatedAt = NOW() WHERE cid = ?';

  connection.query(queryUpdate, [status, cid], (err, updateResults) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update status' });
    } else {
      if (updateResults.affectedRows === 0) {
        connection.query(
          queryInsert,
          [cid, status],
          (insertErr, insertResults) => {
            if (insertErr) {
              console.error(insertErr);
              res.status(500).json({ error: 'Failed to update status' });
            } else {
              res.status(200).json({ message: 'Status updated successfully' });
            }
          }
        );
      } else {
        res.status(200).json({ message: 'Status updated successfully' });
      }
    }
  });
});

router.post('/summary', (req, res) => {
  const { uid } = req.body;
  const query = `
        SELECT
            U.uid,
            COUNT(C.cid) AS TotalCandidates,
            SUM(CASE WHEN CS.status = 'joined' THEN 1 ELSE 0 END) AS Joined,
            SUM(CASE WHEN CS.status = 'interviewed' THEN 1 ELSE 0 END) AS Interview
        FROM User U
        LEFT JOIN Candidate C ON U.uid = C.uid
        LEFT JOIN CandidateStatus CS ON C.cid = CS.cid
        WHERE U.uid = ?
        GROUP BY U.uid
    `;
  connection.query(query, [uid], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch summary' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: 'User not found' });
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});
router.get('/candidates', (req, res) => {
  const query = `
        SELECT C.cid, C.uid, C.candidateName, CS.status, CS.statusUpdatedAt
        FROM Candidate C
        LEFT JOIN CandidateStatus CS ON C.cid = CS.cid
    `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch candidates' });
    } else {
      res.status(200).json(results);
    }
  });
});

module.exports = router;
