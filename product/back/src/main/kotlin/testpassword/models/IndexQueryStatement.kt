package testpassword.models

data class IndexQueryStatement(val table: String, val columns: Set<String>) {
    var indexName = columns.plusElement(table).joinToString("", transform = String::capitalize)
    var createIndexStatement: String = "CREATE INDEX $indexName ON $table (${columns.joinToString(", ")});"
    var dropIndexStatement: String = "DROP INDEX IF EXISTS $indexName;"

    override fun equals(other: Any?): Boolean = (other as IndexQueryStatement).indexName == this.indexName
}