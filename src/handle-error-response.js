function handleErrorResponse (ctx, err) {
  const {res} = ctx
  if (err.message === 'validation_failed') {
    res.status(400)
    res.send({message: 'api_errors.validation_failed'})
  } else if (err.message === 'forbidden') {
    res.status(403)
    res.send({message: 'api_errors.forbidden'})
  } else {
    res.status(500)
    res.send({message: err.message})
  }
}

export {
  handleErrorResponse
}
