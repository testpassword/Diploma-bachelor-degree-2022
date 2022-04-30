package testpassword.models

import kotlinx.serialization.Serializable
import testpassword.services.CONSUMER
import testpassword.services.DBsSupport
import testpassword.services.JDBC_Creds
import testpassword.services.Report

@Serializable data class TestParams(
    val connectionUrl: String,
    val queries: Set<String> = emptySet(),
    val consumer: CONSUMER = CONSUMER.FS,
    val format: Report.FORMATS = Report.FORMATS.CSV,
    val consumerParams: String = "",
    val saveBetter: Boolean = false,
) {

    val creds: JDBC_Creds
        get() =
            if (DBsSupport.CONNECTION_URL_PATTERN.matches(connectionUrl)) {
                val (url, login, pass) = connectionUrl.split(";")
                JDBC_Creds(url, login, pass)
            } else throw java.sql.SQLClientInfoException()
}