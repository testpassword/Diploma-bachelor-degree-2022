package testpassword.services

import java.io.File
import java.io.FileOutputStream
import java.lang.reflect.Field
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

data class Report(private val objects: Iterable<Any>) {

    private val reportsDir: String =
        System.getenv("REPORTS_STORAGE") ?: "./"

    val name: String =
        "${reportsDir}/sqlopt_report_${
            DateTimeFormatter
                .ofPattern("yyyy-MM-dd_HH-mm-ss")
                .withZone(ZoneOffset.UTC)
                .format(Instant.now())}.csv"

    val reportData: String =
        buildString {
        val fields = objects.first()::class.java.declaredFields.map(Field::getName).filterNot { f -> f == "Companion" }
        append(
            fields.joinToString(","),
            "\n",
            objects.joinToString("\n") {
                buildString {
                    fields.forEach { f ->
                        append("${it::class.java.getDeclaredField(f).apply { isAccessible = true }[it]},")
                    }
                }.dropLast(1)
            }
        )
    }

    val file: File by lazy {
        File(File(reportsDir).apply { mkdirs() }, name).apply {
        createNewFile()
        FileOutputStream(this, true)
            .bufferedWriter()
            .use { it.write(reportData) }
        }
    }
}