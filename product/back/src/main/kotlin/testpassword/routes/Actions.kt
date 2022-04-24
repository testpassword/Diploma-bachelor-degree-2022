package testpassword.routes

import io.ktor.application.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import testpassword.consumers.Postman
import testpassword.consumers.SMB
import testpassword.models.OUTPUT_MODE
import testpassword.models.TestParams
import testpassword.models.TestResult
import testpassword.services.*

// TODO: установить время блокировки (хранения записи в redis), периодически продлевать его, если операция ещё идёт

fun Route.actions() =
    route("/bench/") {
        post {
            val testParams = call.receive<TestParams>()
            val creds = testParams.creds
            call.respond(DBsLock.executeLocking(creds.first) {
                DBsSupport(creds).let { sup ->
                    sup.checkDbAvailability()
                    val tester = DBsTester(testParams.queries, sup)
                    val benchmarkingResult = tester.benchmarkQuery()
                    val best = tester.findBest(benchmarkingResult)
                    //TODO: create not only for first
                    val origTime = sup.measureQuery { testParams.queries.first() }
                    if (testParams.saveBetter && best != null) sup.execute { best.first.createIndexStatement }
                    val report = Report(benchmarkingResult.map {
                        object {
                            val indexStatement = it.key.createIndexStatement
                            val timeTaken = it.value
                            val diff = origTime - it.value
                        }
                    })
                    val res = TestResult(best!!.first.createIndexStatement, origTime, best.second, best.second - origTime)
                    when (testParams.outputMode) {
                        OUTPUT_MODE.HTTP -> report.reportData
                        OUTPUT_MODE.SMB -> {
                            SMB(testParams.outputParams, report.file)
                            report.file.delete()
                            arrayOf(res)
                        }
                        OUTPUT_MODE.EMAIL -> {
                            Postman(testParams.outputParams, "You're DB successfully autoindexed", report.file)
                            report.file.delete()
                            arrayOf(res)

                        }
                        OUTPUT_MODE.FS -> {
                            report.file
                            arrayOf(res)
                        }
                    }
                }
            })
        }
    }