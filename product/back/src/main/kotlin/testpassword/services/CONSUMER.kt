package testpassword.services

import Quadruple
import com.jcraft.jsch.ChannelSftp
import com.jcraft.jsch.JSch
import com.microsoft.azure.storage.CloudStorageAccount
import org.apache.commons.mail.SimpleEmail
import java.io.File
import java.net.URL
import javax.mail.internet.MimeBodyPart
import javax.mail.internet.MimeMultipart
import kotlin.io.path.Path
import kotlin.io.path.absolutePathString

enum class CONSUMER {
    EMAIL {

        private fun parseCreds() =
            System.getenv("EMAIL_SENDER").split(";").let {
                object {
                    val address = it[0]
                    val pass = it[1]
                    val server = URL(it[2])
                }
            }

        override operator fun invoke(creds: String, vararg contents: File) {
            SimpleEmail().apply {
                val creds = parseCreds()
                hostName = creds.server.host
                setSmtpPort(creds.server.port)
                setAuthentication(creds.address, creds.pass)
                isSSLOnConnect = true
                setFrom(creds.address)
            }.apply {
                subject = "You're DB successfully autoindexed"
                setContent(MimeMultipart().apply { addBodyPart(MimeBodyPart().apply { contents.forEach { attachFile(it) } }) })
                addTo(creds)
            }.send()
        }
    },

    SMB {
        private infix fun parseCreds(creds: String): String {
            val (address, key) = creds.split(";")
            val name = address.split(".").first().split("//")[1]
            return "DefaultEndpointsProtocol=https;AccountName=${name};AccountKey=${key}"
        }

        override operator fun invoke(creds: String, vararg contents: File) {
            CloudStorageAccount
                .parse(this parseCreds creds)
                .createCloudFileClient()
                .getShareReference("optreports")
                .also { it.createIfNotExists() }
                .rootDirectoryReference.also {
                    contents.forEach { p -> it.getFileReference(p.name).uploadFromFile(p.absolutePath) }
                }
        }
    },

    SFTP {
        private infix fun parseCreds(creds: String): Quadruple<String, Int, String, String> {
            val (address, username, password) = creds.split(";")
            val (host, port) = address.split(":")
            return Quadruple(host, port.toInt(), username, password)
        }

        override operator fun invoke(creds: String, vararg contents: File) {
            val (host, port, username, password) = this parseCreds creds
            with(JSch().getSession(username, host, port)) {
                setPassword(password)
                connect()
                with(openChannel("sftp") as ChannelSftp) {
                    connect()
                    contents.forEach { put(it.absolutePath, Path("optreports", it.name).absolutePathString()) }
                    exit()
                }
            }
        }
    },

    FS {
        // there is no special action, but I should realize interface for compilation
        override operator fun invoke(creds: String, vararg contents: File) = Unit
    };

    abstract operator fun invoke(creds: String, vararg contents: File)
}