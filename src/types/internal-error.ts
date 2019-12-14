export class InternalError extends Error {
  constructor(message: string) {
    super(message)

    // We need to set the prototype immediately after the super call.
    // tslint:disable-next-line
    // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, InternalError.prototype)
  }
}
