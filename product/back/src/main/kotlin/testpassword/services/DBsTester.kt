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
                support.execute { it.createIndexStatement }
                val execTime = support.measureQuery { query }
                support.execute { it.dropIndexStatement }
                execTime
            }

    private fun formIndexesQueries(): List<IndexQueryStatement> {
        val selectStatement = CCJSqlParserUtil.parse(query) as Select
        val usedTable = TablesNamesFinder().getTableList(selectStatement).first()
        val tableColumns = support.getTableColumns(usedTable)
        val columnsFromSelect = (selectStatement.selectBody as PlainSelect).selectItems.map { it.toString() }
        // todo: вытащить имена из where, group by, order, having
        val columnsFromWhere = selectStatement.toString().split("WHERE")[1].split(" ")
        val columns = (columnsFromSelect + columnsFromWhere).filter { it in tableColumns }.toSet()
        return columns
            .powerset()
            .filter { it.isNotEmpty() }
            .map { IndexQueryStatement(usedTable, it) } // create index query statement for standart sql
            .flatMap { support.creator.buildDBSpecificIndexQueries(it) } // create db-specifix sql index query statement
    }

    infix fun findBest(benchmarkingRes: Map<IndexQueryStatement, Long>): Pair<IndexQueryStatement, Long>? =
        benchmarkingRes.minByOrNull { it.value }?.toPair()
}