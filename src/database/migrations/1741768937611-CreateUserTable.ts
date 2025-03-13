import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateUserTable1741768937611 implements MigrationInterface {
  table = "user";
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      {
        name: "chat_id",
        type: "numeric",
        isPrimary: true,
        isNullable: false,
      },
      {
        name: "phone_number",
        type: "character varying",
        isNullable: false,
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "now()",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "now()",
      },
    ];
    const tableColumns = columns.map((column) => new TableColumn(column));
    await queryRunner.createTable(
      new Table({
        name: this.table,
        columns: [...tableColumns],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.table);
  }
}
