

function error(err, _, res, _) {
  res.send({
    acknowledgement: false,
    message: err.name,
    description: err.message,
  });
}

module.exports = error;
