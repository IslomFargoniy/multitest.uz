plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

import java.util.Properties
import java.io.FileInputStream

val versionPropsFile = File(rootDir, "version.properties")
val versionProps = Properties().apply {
    if (versionPropsFile.exists()) {
        load(FileInputStream(versionPropsFile))
    }
}
val vCode = versionProps.getProperty("VERSION_CODE", "1").toInt()
val vName = versionProps.getProperty("VERSION_NAME", "1.0.0")

// Release signing: android/keystore.properties (gitignored) with storeFile, storePassword, keyAlias, keyPassword.
val keystoreProps = Properties().apply {
    val file = File(rootDir, "keystore.properties")
    if (file.exists()) load(FileInputStream(file))
}
val hasReleaseKeystore = keystoreProps.getProperty("storeFile") != null

// Google OAuth *web* client ID: -PGOOGLE_WEB_CLIENT_ID=... or GOOGLE_WEB_CLIENT_ID in local.properties. Empty hides Google login.
val localProps = Properties().apply {
    val file = File(rootDir, "local.properties")
    if (file.exists()) load(FileInputStream(file))
}
val googleWebClientId: String =
    (project.findProperty("GOOGLE_WEB_CLIENT_ID") as String?)
        ?: localProps.getProperty("GOOGLE_WEB_CLIENT_ID")
        ?: ""

android {
    namespace = "uz.multitest.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "uz.multitest.app"
        minSdk = 24
        targetSdk = 35
        versionCode = vCode
        versionName = vName

        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = when {
                hasReleaseKeystore -> signingConfigs.getByName("release")
                // Explicit opt-in for local test builds only; such an APK must never be published.
                project.hasProperty("allowDebugSigning") -> signingConfigs.getByName("debug")
                else -> null
            }
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }

    applicationVariants.all {
        val variant = this
        outputs.map { it as com.android.build.gradle.internal.api.ApkVariantOutputImpl }
            .forEach { output ->
                output.outputFileName = "MultiTest_v${variant.versionName}_${variant.buildType.name}.apk"
            }

        assembleProvider.configure {
            doLast {
                variant.outputs.forEach { output ->
                    val file = output.outputFile
                    if (file != null && file.exists()) {
                        val target = File(rootDir, file.name)
                        file.copyTo(target, overwrite = true)
                        println("APK muvaffaqiyatli saqlandi: ${target.absolutePath}")
                    }
                }
            }
        }
    }

    tasks.matching { it.name == "bundleRelease" }.configureEach {
        doLast {
            val bundleFile = File(layout.buildDirectory.asFile.get(), "outputs/bundle/release/app-release.aab")
            if (bundleFile.exists()) {
                val targetAab = File(rootDir, "MultiTest_v${vName}_release.aab")
                bundleFile.copyTo(targetAab, overwrite = true)
                println("AAB muvaffaqiyatli saqlandi: ${targetAab.absolutePath}")

                val publicDir = File(rootDir.parentFile, "public")
                if (publicDir.exists()) {
                    val publicVersionedAab = File(publicDir, "MultiTest_v${vName}_release.aab")
                    bundleFile.copyTo(publicVersionedAab, overwrite = true)
                    val publicLatestAab = File(publicDir, "MultiTest_release.aab")
                    bundleFile.copyTo(publicLatestAab, overwrite = true)
                    println("AAB public papkaga saqlandi: ${publicVersionedAab.absolutePath}")
                }
            }
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Compose
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    debugImplementation(libs.androidx.ui.tooling)

    // Google Sign-In & Credentials
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.google.id)

    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Retrofit & OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    // DataStore
    implementation(libs.androidx.datastore.preferences)

    // Media & Coil
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.ui)
    implementation(libs.coil.compose)
}

gradle.taskGraph.whenReady {
    val releaseRequested = allTasks.any {
        it.name.contains("Release") && (it.name.startsWith("assemble") || it.name.startsWith("bundle") || it.name.startsWith("package"))
    }
    if (releaseRequested && !hasReleaseKeystore && !project.hasProperty("allowDebugSigning")) {
        throw GradleException(
            "Release signing is not configured. Create android/keystore.properties " +
                "(storeFile, storePassword, keyAlias, keyPassword) or, for a local test build only, " +
                "pass -PallowDebugSigning=true (the APK is then signed with the debug key and must not be published)."
        )
    }
}
