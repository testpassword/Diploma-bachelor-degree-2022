package testpassword.routes

import io.ktor.application.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import testpassword.models.IndexResult
import testpassword.models.TestParams
import testpassword.models.TestResult
import testpassword.services.*
import java.io.File

fun Route.actions() =
    route("/bench/") {
        post {
            val testParams = call.receive<TestParams>()
            val creds = testParams.creds
            call.respond(DBsLock.executeLocking(creds.first) {
                DBsSupport(creds).let { sup ->
                    sup.checkDbAvailability()
                    val results = testParams.queries.map {
                        val tester = DBsTester(it, sup)
                        val benchmarkingResult = tester.benchmarkQuery()
                        val best = tester.findBest(benchmarkingResult)
                        val origTime = sup.measureQuery { it }
                        if (testParams.saveBetter && best != null) sup.execute { best.first.createIndexStatement }
                        val report = Report(it, benchmarkingResult.map { (k, v) -> IndexResult(k.createIndexStatement, origTime, v) }, testParams.format)
                        val res = TestResult(best!!.first.createIndexStatement, origTime, best.second, best.second - origTime)
                        report to res
                    }
                    val temporaryWrite = { act: (f: Array<File>) -> Unit ->
                        val files = results.map { it.first.file }.toTypedArray()
                        act(files)
                        files.forEach { it.delete() }
                        results.map { it.second }
                    }
                    if (testParams.consumer == CONSUMER.FS) {
                        results.forEach { it.first.file }
                        "Reports write to default directory"
                    } else temporaryWrite { testParams.consumer(testParams.consumerParams, *it) }
                }
            })
        }
    }