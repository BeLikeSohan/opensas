using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmission.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveClassShift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Classes_Name_Shift",
                table: "Classes");

            migrationBuilder.DropColumn(
                name: "Shift",
                table: "Classes");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Name",
                table: "Classes",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Classes_Name",
                table: "Classes");

            migrationBuilder.AddColumn<string>(
                name: "Shift",
                table: "Classes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Classes_Name_Shift",
                table: "Classes",
                columns: new[] { "Name", "Shift" },
                unique: true);
        }
    }
}
