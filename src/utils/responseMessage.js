class ResponseMessage {
  constructor(status, statusCode, message, data) {
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ResponseMessage;
