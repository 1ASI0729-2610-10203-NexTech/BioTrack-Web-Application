export class Result {
  static ok(value) {
    return { ok: true, value, error: null }
  }

  static fail(error) {
    return { ok: false, value: null, error }
  }
}
