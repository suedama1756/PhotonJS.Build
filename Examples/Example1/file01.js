var file1Message;

/**
 * Gets a message from file 1
 * @return {String}
 */
module.getMessage1 = function () {
    if (!file1Message) {
        file1Message = "Message from file 1.";
    }
    return file1Message;
}