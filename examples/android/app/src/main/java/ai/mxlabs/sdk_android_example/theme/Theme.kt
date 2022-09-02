package ai.mxlabs.sdk_android_example.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.MaterialTheme
import androidx.compose.material.darkColors
import androidx.compose.material.lightColors
import androidx.compose.runtime.Composable

private val DarkColorPalette = darkColors(
    primary = AppColors().mainColorBlue,
    primaryVariant = AppColors().mainColorDarkBlue,
    secondary = AppColors().mainColorTeal
)

private val LightColorPalette = lightColors(
    primary = AppColors().mainColorBlue,
    primaryVariant = AppColors().mainColorDarkBlue,
    secondary = AppColors().mainColorTeal
)

@Composable
fun ShenaiSdkAndroidTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) {
        DarkColorPalette
    } else {
        LightColorPalette
    }

    MaterialTheme(
        colors = colors,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}