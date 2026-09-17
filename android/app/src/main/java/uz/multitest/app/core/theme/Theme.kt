package uz.multitest.app.core.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = ElectricIndigoDark,
    background = SlateBackgroundDark,
    surface = SlateCardDark,
    onPrimary = SlateTextPrimaryDark,
    onBackground = SlateTextPrimaryDark,
    onSurface = SlateTextPrimaryDark,
    outline = SlateBorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = ElectricIndigo,
    background = SlateBackgroundLight,
    surface = SlateCardLight,
    onPrimary = SlateCardLight,
    onBackground = SlateTextPrimaryLight,
    onSurface = SlateTextPrimaryLight,
    outline = SlateBorderLight
)

@Composable
fun MultiTestTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
