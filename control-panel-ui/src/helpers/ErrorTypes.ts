export enum ErrorMessages {
    FileNotUploaded = `Please upload a file with "jpg" or "png" format`,
    FileFormatUnsupported = `File format needs to be "jpg" or "png"`,
    PasswordEmpty = "Password field can not be empty",
    UserName = "User name can not be empty",
    UserNameTaken = "User name already in use",
    EmailInvalid = "Email field can not be empty",
    PasswordsMustMatch = "Password confirmation is not the same as password, please retry!"
}

export enum ErrorCodes {
    FileNotUploaded,
    FileFormatUnsupported,
    PasswordsMustMatch
}