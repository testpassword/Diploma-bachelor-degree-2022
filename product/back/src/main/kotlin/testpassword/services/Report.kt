package testpassword.services

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import testpassword.models.IndexResult
import java.io.File
import java.io.FileOutputStream
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

data class Report(
    private val origQuery: String,
    private val results: Iterable<IndexResult>,
    val format: FORMATS = FORMATS.CSV
) {

    enum class FORMATS {
        CSV {
            override fun serialize(objects: Iterable<IndexResult>): String =
                "indexStatement,timeTaken,diff\n" +
                objects.joinToString("\n") { "\"${it.indexStatement}\",${it.timeTaken},${it.diff}" }
        },

        JSON { override fun serialize(objects: Iterable<IndexResult>): String = Json.encodeToString(objects.toList()) };

        abstract fun serialize(objects: Iterable<IndexResult>): String
    }

    var reportsDir: String = "./"

    private val name: String =
        "${reportsDir}/${ 
            if (origQuery.length <= 20) origQuery 
            else "${origQuery.substring(0, 7)}...${origQuery.substring(origQuery.length - 7, origQuery.length - 1)}"
        }_${
            DateTimeFormatter
                .ofPattern("ddMMyyyyHHmmss")
                .withZone(ZoneOffset.UTC)
                .format(Instant.now())}.${format}"

    val reportData: String = format.serialize(results)

    val file: File by lazy {
        File(File(reportsDir).apply { mkdirs() }, name).apply {
        createNewFile()
        FileOutputStream(this, true)
            .bufferedWriter()
            .use { it.write(reportData) }
        }
    }
}