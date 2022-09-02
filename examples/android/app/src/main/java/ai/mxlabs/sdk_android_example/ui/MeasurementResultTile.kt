package ai.mxlabs.sdk_android_example.ui

import ai.mxlabs.sdk_android_example.theme.AppColors
import ai.mxlabs.sdk_android_example.theme.Shapes
import android.content.res.Resources
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp

@Composable
fun MeasurementResultTile(
    resultTitle: String,
    value: Int,
    unit: String,
    iconId: Int,
) {
    val width = Resources.getSystem().displayMetrics.densityDpi.dp/4

    Box(
        modifier = Modifier
            .clip(Shapes.small)
            .width(width)
            .height(80.dp)
            .background(Color.White),
    ) {
        Image(
            painter = painterResource(id = iconId),
            contentDescription = "Heart Rate",
            modifier = Modifier
                .fillMaxHeight()
                .align(Alignment.CenterEnd)
        )
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .padding(8.dp),
            Arrangement.SpaceBetween,
        ) {
            Text(
                text = resultTitle,
                style = MaterialTheme.typography.subtitle2.copy(AppColors().staticTextColor),
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                Arrangement.Start,
                Alignment.Bottom,
            ) {
                Text(
                    text = "$value ",
                    style = MaterialTheme.typography.h5.copy(AppColors().mainColorTeal),
                )
                Text(
                    text = unit,
                    style = MaterialTheme.typography.caption.copy(AppColors().staticTextColor),
                )
            }
        }
    }
}