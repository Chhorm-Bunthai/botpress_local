import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateWhitelistTable1741070867324 implements MigrationInterface {
  table = "whitelist";
  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      {
        name: "phone_number",
        type: "character varying",
        isPrimary: true,
        isNullable: false,
      },
      {
        name: "max_limit",
        type: "numeric",
        isNullable: false,
      },
      {
        name: "industry",
        type: "character varying",
        isNullable: true,
      },
      {
        name: "min_amount",
        type: "numeric",
        isNullable: false,
      },
      {
        name: "max_amount",
        type: "numeric",
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
