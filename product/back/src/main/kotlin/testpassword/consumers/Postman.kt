package testpassword.consumers

import org.apache.commons.mail.SimpleEmail
import java.io.File
import java.net.URL
import javax.mail.internet.MimeBodyPart
import javax.mail.internet.MimeMultipart


object Postman {

    private val sender: SimpleEmail =
        SimpleEmail().apply {
            val creds = parseCreds()
            hostName = creds.server.host
            setSmtpPort(creds.server.port)
            setAuthentication(creds.address, creds.pass)
            isSSLOnConnect = true
            setFrom(creds.address)
        }

    private fun parseCreds() =
        System.getenv("EMAIL_SENDER").split(";").let {
            object {
                val address = it[0]
                val pass = it[1]
                val server = URL(it[2])
            }
        }

    operator fun invoke(to: String, subject: String, vararg contents: File) =
        sender.apply {
            setSubject(subject)
            setContent(MimeMultipart().apply { addBodyPart(MimeBodyPart().apply { contents.forEach { attachFile(it) } }) })
            addTo(to)
        }.send()

    operator fun invoke(to: String, subject: String, content: String) =
        sender.apply {
            setSubject(subject)
            setMsg(content)
            addTo(to)
        }.send()
}