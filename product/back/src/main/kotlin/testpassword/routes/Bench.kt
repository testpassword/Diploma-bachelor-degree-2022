package testpassword.routes

import io.ktor.application.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import testpassword.models.IndexResult
import testpassword.models.BenchTask
import testpassword.models.TestResult
import testpassword.services.*
import java.io.File

fun Route.actions() =
    route("/bench/") {
        post {
            val benchTask = call.receive<BenchTask>()
            val creds = benchTask.creds
            call.respond(DBsLock.executeLocking(creds.first) {
                DBsSupport(creds).let { sup ->
                    sup.checkDbAvailability()
                    launch(Job()) {
                        val results = benchTask.queries.toSet().map {
                            val tester = DBsTester(it, sup)
                            val benchmarkingResult = tester.benchmarkQuery()
                            val best = tester.findBest(benchmarkingResult)
                            val origTime = sup.measureQuery { it }
                            if (benchTask.saveBetter && best != null) sup.execute { best.first.createIndexStatement }
                            val report = Report(
                                it,
                                benchmarkingResult
                                    .map { (k, v) -> IndexResult(k.createIndexStatement, origTime, v) }
                                    .sortedBy { i -> i.timeTaken },
                                benchTask.format
                            )
                            val res = TestResult(
                                best!!.first.createIndexStatement,
                                origTime,
                                best.second,
                                best.second - origTime
                            )
                            report to res
                        }
                        val temporaryWrite = { act: (f: Array<File>) -> Unit ->
                            val files = results.map { it.first.file }.toTypedArray()
                            act(files)
                            files.forEach { it.delete() }
                            results.map { it.second }
                        }
                        if (benchTask.consumer == CONSUMER.FS) results.forEach {
                            if (benchTask.consumerParams.isNotEmpty()) it.first.reportsDir = benchTask.consumerParams
                            it.first.file
                        } else temporaryWrite { benchTask.consumer(benchTask.consumerParams, *it) }
                    }
                    mapOf("details" to "All validations are successfully passed, test results will be available soon")
                }
            })
        }
    }