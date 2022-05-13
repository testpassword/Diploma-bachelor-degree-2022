package testpassword.services

import net.sf.jsqlparser.parser.CCJSqlParserUtil
import net.sf.jsqlparser.statement.select.*
import net.sf.jsqlparser.util.TablesNamesFinder
import testpassword.models.IndexQueryStatement
import testpassword.plugins.powerset

class DBsTester(private val query: String, private val support: DBsSupport) {

    operator fun invoke(): Map<IndexQueryStatement, Long> = benchmarkQuery()

    fun benchmarkQuery(): Map<IndexQueryStatement, Long> =
        formIndexesQueries()
            .associateWith {
                val del = { support.execute { it.dropIndexStatement } }
                if (System.getenv("DEBUG").toBoolean()) del()
                support.execute { it.createIndexStatement }
                val execTime = support.measureQuery { query }
                del()
                execTime
            }

    private fun formIndexesQueries(): List<IndexQueryStatement> =
        with(CCJSqlParserUtil.parse(query) as Select) {
            TablesNamesFinder()
                .getTableList(this)
                .flatMap { t ->
                    this.toString()
                        .split(" ")
                        .filter { it in support.getTableColumns(t) }
                        .powerset()
                        .filter { it.isNotEmpty() }
                        // create index query statement for standart sql
                        .map { IndexQueryStatement(t, it) }
                        // create db-specific sql index query statement
                        .flatMap { support.creator.buildDBSpecificIndexQueries(it) }
            }
        }

    infix fun findBest(benchmarkingRes: Map<IndexQueryStatement, Long>): Pair<IndexQueryStatement, Long>? =
        (benchmarkingRes.minByOrNull { it.value } ?: benchmarkingRes.entries.first()).toPair()
}