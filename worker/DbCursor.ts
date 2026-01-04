export class DbCursor {
  dateCreated: number;
  id: number;
  constructor(id: number, dateCreated: number) {
    this.id = id;
    this.dateCreated = dateCreated;
  }

  encode() {
    return Buffer.from(
      JSON.stringify({
        dc: this.dateCreated,
        id: this.id,
      }),
    ).toString("base64");
  }

  static decode(encoded: string) {
    const { dc, id } = JSON.parse(
      Buffer.from(encoded, "base64").toString(),
    ) as { dc: number; id: number };
    return new DbCursor(id, dc);
  }
}
