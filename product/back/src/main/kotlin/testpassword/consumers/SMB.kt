package testpassword.consumers

import com.microsoft.azure.storage.CloudStorageAccount
import java.io.File

object SMB {

    private fun parseCreds(creds: String): String {
        val (address, key) = creds.split(";")
        val name = address.split(".").first().split("//")[1]
        return "DefaultEndpointsProtocol=https;AccountName=${name};AccountKey=${key}"
    }

    operator fun invoke(creds: String, product: File, productName: String = product.name) =
        CloudStorageAccount
            .parse(parseCreds(creds))
            .createCloudFileClient()
            .getShareReference("optreports")
            .also { it.createIfNotExists() }
            .rootDirectoryReference
            .getFileReference(productName)
            .uploadFromFile(product.absolutePath)
}