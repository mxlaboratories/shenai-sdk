package ai.mxlabs.sdk_android_example

import ai.mxlabs.sdk_android_example.measurement.MeasurePage
import ai.mxlabs.shenai_sdk_android.ShenAIAndroidSDK
import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.ui.platform.ComposeView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.logging.Logger

class MainActivity : AppCompatActivity() {
  private val apiKey = ""
  private val log = Logger.getLogger(this.javaClass.name)
  private var holder: SurfaceHolder? = null
  private val shenaiSDKHandler = ShenAIAndroidSDK()
  private val cameraRequest = 1888
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (checkPermissions()) {
      showWelcomePage()
    } else {
      ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), cameraRequest)
    }
  }

  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (checkPermissions()) {
      showWelcomePage()
    }
  }

  private fun checkPermissions(): Boolean {
    return ContextCompat.checkSelfPermission(
      applicationContext,
      Manifest.permission.CAMERA
    ) != PackageManager.PERMISSION_DENIED
  }

  private fun showWelcomePage() {
    setContentView(R.layout.welcome_page)
    runSurface()
  }

  private fun runSurface() {
    val startButton = findViewById<Button>(R.id.start_button)
    startButton.setOnClickListener {
      setContentView(R.layout.activity_main)
      val surfaceView: SurfaceView = findViewById(R.id.surfaceView)
      holder = surfaceView.holder
      holder!!.addCallback(SurfaceCallback())
      shenaiSDKHandler.attachToActivity(this)
      val bottomBar = findViewById<ComposeView>(R.id.bottomBar)
      MeasurePage().showMeasurementView(bottomBar)
    }
  }

  private inner class SurfaceCallback : SurfaceHolder.Callback {
    private var renderingSurface: Surface? = null
    override fun surfaceCreated(surface: SurfaceHolder) {
      if (holder != null) renderingSurface = holder!!.surface
      shenaiSDKHandler.provideSurfaceForRendering(renderingSurface)

      if (shenaiSDKHandler.isInitialized) {
        shenaiSDKHandler.deinitialize()
      }
      val settings = shenaiSDKHandler.defaultInitializationSettings
      settings.cameraPreviewMirror = true
      val result = shenaiSDKHandler.initialize(apiKey, "", settings)
      if (result != ShenAIAndroidSDK.InitializationResult.OK) {
        log.warning("Initialization failed with error: $result")
      }
    }

    override fun surfaceDestroyed(surface: SurfaceHolder) {
      if (shenaiSDKHandler.isInitialized) {
        shenaiSDKHandler.deinitialize()
      }
      showWelcomePage()
    }

    override fun surfaceChanged(holder2: SurfaceHolder, format: Int, width: Int, height: Int) {
    }
  }
}

