package uz.multitest.app.core.theme

import androidx.compose.ui.graphics.Color

// 🌙 Night Focus Design Tokens (§2 & §6.1)
val NightBackground = Color(0xFF0B0E14)
val NightSurface = Color(0xFF121722)
val NightSurface2 = Color(0xFF181F2E)
val NightBorder = Color(0xFF222B3D)
val NightBorderStrong = Color(0xFF2D384E)
val NightTextPrimary = Color(0xFFF1F5F9)
val NightTextMuted = Color(0xFF94A3B8)
val NightPrimary = Color(0xFF2563EB)
val NightPrimaryHover = Color(0xFF1D4ED8)
val NightSuccess = Color(0xFF10B981)
val NightSuccessBg = Color(0x1A10B981)
val NightWarning = Color(0xFFF59E0B)
val NightWarningBg = Color(0x1AF59E0B)
val NightDestructive = Color(0xFFEF4444)
val NightDestructiveBg = Color(0x1AEF4444)
val NightChart = Color(0xFF3B82F6)

// 🎓 CEFR Colors (§2.3 & §6.1)
val CefrA1 = Color(0xFF64748B)
val CefrA1Bg = Color(0x2664748B)
val CefrA2 = Color(0xFF38BDF8)
val CefrA2Bg = Color(0x2638BDF8)
val CefrB1 = Color(0xFF10B981)
val CefrB1Bg = Color(0x2610B981)
val CefrB2 = Color(0xFF3B82F6)
val CefrB2Bg = Color(0x263B82F6)
val CefrC1 = Color(0xFF8B5CF6)
val CefrC1Bg = Color(0x268B5CF6)

// ☀️ Clean Light Palette
val LightBackground = Color(0xFFFFFFFF)
val LightSurface = Color(0xFFF8FAFC)
val LightSurface2 = Color(0xFFF1F5F9)
val LightBorder = Color(0xFFE2E8F0)
val LightBorderStrong = Color(0xFFCBD5E1)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextMuted = Color(0xFF64748B)

// Aliases for compatibility
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

// Legacy aliases mapped to Night Focus tokens to keep existing callers working
val ElectricIndigo = NightPrimary
val ElectricIndigoDark = NightPrimary
val ElectricIndigoLight = NightSurface2
val IndigoPrimary = NightPrimary
val IndigoAccent = NightPrimaryHover
val RosePink = NightDestructive
val CoralOrange = NightWarning
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
