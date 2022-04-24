package testpassword.consumers

import com.microsoft.azure.storage.CloudStorageAccount
import java.io.File

object SMB {

    private fun parseCreds(creds: String): String {
        val (address, key) = creds.split(";")
        val name = address.split(".").first().split("//")[1]
        return "DefaultEndpointsProtocol=https;AccountName=${name};AccountKey=${key}"
    }

    operator fun invoke(creds: String, vararg product: File) =
        CloudStorageAccount
            .parse(parseCreds(creds))
            .createCloudFileClient()
            .getShareReference("optreports")
            .also { it.createIfNotExists() }
            .rootDirectoryReference.also {
                product.forEach { p -> it.getFileReference(p.name).uploadFromFile(p.absolutePath) }
            }
}