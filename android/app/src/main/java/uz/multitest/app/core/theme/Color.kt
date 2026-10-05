package uz.multitest.app.core.theme

import androidx.compose.ui.graphics.Color

// Night Focus design tokens: identical to the web (resources/css/app.css) so both clients look like one product.

// Dark (default)
val NightBackground = Color(0xFF0B1020)
val NightSurface = Color(0xFF111830)
val NightSurface2 = Color(0xFF172040)
val NightSurfaceSunken = Color(0xFF0D1326)
val NightBorder = Color(0xFF1E2744)
val NightBorderStrong = Color(0xFF2A3557)
val NightTextPrimary = Color(0xFFE8ECF5)
val NightTextMuted = Color(0xFF9AA5BD)
val NightPrimary = Color(0xFF5B63E6)
val NightPrimaryHover = Color(0xFF4B52D1)
val NightAccentText = Color(0xFFAEB5FF)
val NightChart = Color(0xFF7B86FF)
val NightSuccess = Color(0xFF3FCF8E)
val NightSuccessBg = Color(0xFF173628)
val NightWarning = Color(0xFFF5B14C)
val NightWarningBg = Color(0xFF3A2A12)
val NightDestructive = Color(0xFFF07178)
val NightDestructiveBg = Color(0xFF3A1820)

// Selected/current navigation state (must stay clearly visible: ≥ 1.4:1 vs the bar, ≥ 4.5:1 text on it)
val NavActiveBg = Color(0xFF262F66)
val NavActiveFg = Color(0xFFAEB5FF)
val NavActiveBgLight = Color(0xFFC3C8FF)
val NavActiveFgLight = Color(0xFF2E35A8)

// Light
val LightBackground = Color(0xFFF5F7FB)
val LightSurface = Color(0xFFFFFFFF)
val LightSurface2 = Color(0xFFEEF1F8)
val LightSurfaceSunken = Color(0xFFF0F3F9)
val LightBorder = Color(0xFFDDE3EF)
val LightBorderStrong = Color(0xFFC9D1E2)
val LightTextPrimary = Color(0xFF0F1424)
val LightTextMuted = Color(0xFF566078)
val LightPrimary = Color(0xFF4F57D9)

// CEFR levels (UzBMB multilevel, 0–75): segment fill + label color on that fill
val CefrA1 = Color(0xFF3A3F52)
val CefrA1Label = Color(0xFFF1F3F8)
val CefrA2 = Color(0xFF6B5A2E)
val CefrA2Label = Color(0xFFF8EED3)
val CefrB1 = Color(0xFF8A6F1E)
val CefrB1Label = Color(0xFFFFF5DA)
val CefrB2 = Color(0xFF3D4FA8)
val CefrB2Label = Color(0xFFEEF1FF)
val CefrC1 = Color(0xFF2F7A5A)
val CefrC1Label = Color(0xFFE6FFF3)

// Aliases kept so existing call sites compile
val Primary = NightPrimary
val BackgroundDark = NightBackground
val SurfaceDark = NightSurface
val Surface2Dark = NightSurface2
val BorderDark = NightBorder
val BorderStrongDark = NightBorderStrong
val TextPrimaryDark = NightTextPrimary
val TextMutedDark = NightTextMuted
val Success = NightSuccess
val SuccessBg = NightSuccessBg
val Warning = NightWarning
val WarningBg = NightWarningBg
val Destructive = NightDestructive
val DestructiveBg = NightDestructiveBg
val Chart = NightChart

val ElectricIndigo = NightPrimary
val ElectricIndigoDark = NightPrimary
val ElectricIndigoLight = NightSurface2
val IndigoPrimary = NightPrimary
val IndigoAccent = NightPrimaryHover
val EmeraldGreen = NightSuccess
val SlateBackgroundLight = LightBackground
val SlateBackgroundDark = NightBackground
val SlateCardLight = LightSurface
val SlateCardDark = NightSurface
val SlateTextPrimaryLight = LightTextPrimary
val SlateTextPrimaryDark = NightTextPrimary
val SlateTextSecondaryLight = LightTextMuted
val SlateTextSecondaryDark = NightTextMuted
val SlateBorderLight = LightBorder
val SlateBorderDark = NightBorder
val SuccessGreen = NightSuccess
val WarningAmber = NightWarning
val ErrorRed = NightDestructive
