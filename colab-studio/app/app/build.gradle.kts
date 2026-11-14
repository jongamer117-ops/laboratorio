plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "dev.jongamer.bastionalbor"
    compileSdk = 36

    defaultConfig {
        applicationId = "dev.jongamer.bastionalbor"
        minSdk = 33
        targetSdk = 35
        versionCode = 3
        versionName = "0.1.2"
    }

    fun secreto(nombre: String, defecto: String = ""): String {
        val deEntorno = System.getenv(nombre)
        if (!deEntorno.isNullOrBlank()) return deEntorno
        val dePropiedad = findProperty(nombre) as? String
        if (!dePropiedad.isNullOrBlank()) return dePropiedad
        return defecto
    }

    val keystoreDelEntorno = System.getenv("BASTION_KEYSTORE_PATH")
    val keystoreDelRepo = rootProject.file("keystore/bastion-release.jks")
    val keystoreFijo = when {
        !keystoreDelEntorno.isNullOrBlank() -> file(keystoreDelEntorno)
        keystoreDelRepo.isFile -> keystoreDelRepo
        else -> null
    }
    signingConfigs {
        if (keystoreFijo != null) {
            create("bastion") {
                storeFile = keystoreFijo
                storePassword = secreto("BASTION_KEYSTORE_PASSWORD")
                keyAlias = secreto("BASTION_KEY_ALIAS", "bastion")
                keyPassword = secreto("BASTION_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            signingConfig = if (keystoreFijo != null) {
                signingConfigs.getByName("bastion")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    val bom = platform("androidx.compose:compose-bom:2026.06.01")
    implementation(bom)
    androidTestImplementation(bom)

    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.9.4")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.4")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4")
    implementation("androidx.navigation:navigation-compose:2.9.5")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.compose.foundation:foundation")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.room:room-runtime:2.8.4")
    implementation("androidx.room:room-ktx:2.8.4")
    ksp("androidx.room:room-compiler:2.8.4")

    implementation("androidx.datastore:datastore-preferences:1.1.7")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.coil-kt:coil-compose:2.7.0")

    val camera = "1.5.1"
    implementation("androidx.camera:camera-core:$camera")
    implementation("androidx.camera:camera-camera2:$camera")
    implementation("androidx.camera:camera-lifecycle:$camera")
    implementation("androidx.camera:camera-view:$camera")
    implementation("com.google.zxing:core:3.5.3")

    testImplementation("junit:junit:4.13.2")
}
