package ai.mxlabs.sdk_android_example

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.Surface
import android.view.SurfaceHolder
import android.view.SurfaceView

import ai.mxlabs.shenai_sdk_android.ShenAIAndroidSDK;
import java.util.logging.Logger

class MainActivity : AppCompatActivity() {
    private val LOG = Logger.getLogger(this.javaClass.name)
    private var renderingSurface: Surface? = null
    private var holder: SurfaceHolder? = null
    private val shenaiSDKHandler = ShenAIAndroidSDK()

    private inner class SurfaceCallback : SurfaceHolder.Callback {
        override fun surfaceCreated(surface: SurfaceHolder) {
            renderingSurface = holder!!.surface

            // TODO will be one call with the rest of initialization one day
            shenaiSDKHandler.provideSurfaceForRendering(renderingSurface)

            var settings = shenaiSDKHandler.defaultInitializationSettings
            var result = shenaiSDKHandler.initialize("", "", settings)
            if (result != ShenAIAndroidSDK.InitializationResult.OK) {
                LOG.warning("Initialization failed with error: $result")
            }
        }

        // TODO
        override fun surfaceDestroyed(surface: SurfaceHolder) {}

        // TODO
        override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {}
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val surfaceView: SurfaceView = findViewById(R.id.surfaceView)
        holder = surfaceView.holder
        holder!!.addCallback(SurfaceCallback())
        shenaiSDKHandler.attachToActivity(this)
    }

}
