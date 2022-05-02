package testpassword.services

import testpassword.models.IndexQueryStatement

enum class DB_INDEX_CREATORS(val prefix: String, val indexTypes: Set<String>) {

    sqlserver("sqlserver", setOf("CLUSTERED", "NONCLUSTERED")) {
        override fun buildDBSpecificIndexQueries(indexQuery: IndexQueryStatement): List<IndexQueryStatement> {
            val (beginning, end) = indexQuery.createIndexStatement.split(" ", limit = 2, ignoreCase = true)
            if (arrayOf(beginning to "CREATE", end to "INDEX").all { it.first.startsWith(it.second, ignoreCase = true) })
                return indexTypes.map {
                    indexQuery.copy().apply {
                        indexName = "${indexName}_${it}"
                        createIndexStatement = "$beginning $it $end"
                        dropIndexStatement = "DROP INDEX ${indexName}-${it} ON "
                    }
                }
            else throw IndexCreationError(indexQuery.createIndexStatement)
        }
    },

    postgresql("psql", setOf("HASH", "BTREE")) {
        override fun buildDBSpecificIndexQueries(indexQuery: IndexQueryStatement): List<IndexQueryStatement> {
            val (beginning, end) = indexQuery.createIndexStatement.split(" (", limit = 2, ignoreCase = true)
            if (beginning.endsWith(indexQuery.table))
                return indexTypes.mapNotNull {
                    if (it == "HASH" && indexQuery.columns.count() > 1) null
                    else indexQuery.copy().apply {
                        val newName = "${indexName}${it.toUpperCase()}"
                        createIndexStatement = "$beginning USING $it($end".replace(indexName, newName)
                        indexName = newName
                        dropIndexStatement = "DROP INDEX IF EXISTS $indexName RESTRICT;"
                    }
                }
            else throw IndexCreationError(indexQuery.createIndexStatement)
        }
    };

    abstract fun buildDBSpecificIndexQueries(indexQuery: IndexQueryStatement): List<IndexQueryStatement>
}