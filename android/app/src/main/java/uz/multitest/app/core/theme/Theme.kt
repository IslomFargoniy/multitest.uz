package uz.multitest.app.core.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// 🌙 Night Focus Dark Scheme (Default)
private val DarkColorScheme = darkColorScheme(
    primary = NightPrimary,
    onPrimary = Color.White,
    primaryContainer = NightSurface2,
    onPrimaryContainer = NightPrimary,
    secondary = NightSurface2,
    onSecondary = NightTextPrimary,
    background = NightBackground,
    onBackground = NightTextPrimary,
    surface = NightSurface,
    onSurface = NightTextPrimary,
    surfaceVariant = NightSurface2,
    onSurfaceVariant = NightTextMuted,
    secondaryContainer = NightSurface2,
    outline = NightBorderStrong,
    outlineVariant = NightBorder,
    error = NightDestructive,
    onError = Color.White,
    errorContainer = NightDestructiveBg,
    onErrorContainer = NightDestructive
)

// ☀️ Clean Light Scheme
private val LightColorScheme = lightColorScheme(
    primary = NightPrimary,
    onPrimary = Color.White,
    primaryContainer = LightSurface2,
    onPrimaryContainer = NightPrimary,
    secondary = LightSurface2,
    onSecondary = LightTextPrimary,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurface2,
    onSurfaceVariant = LightTextMuted,
    secondaryContainer = LightSurface2,
    outline = LightBorderStrong,
    outlineVariant = LightBorder,
    error = NightDestructive,
    onError = Color.White,
    errorContainer = NightDestructiveBg,
    onErrorContainer = NightDestructive
)

@Composable
fun MultiTestTheme(
    darkTheme: Boolean = true, // Dark by default per §6.1
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
        shapes = Shapes,
        content = content
    )
}
