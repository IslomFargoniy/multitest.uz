package uz.multitest.app.presentation.navigation

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.multitest.app.core.theme.IndigoPrimary

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    data object Dashboard : BottomNavItem(Screen.Dashboard.route, "Asosiy", Icons.Rounded.Home)
    data object Tests : BottomNavItem(Screen.Tests.route, "Testlar", Icons.Rounded.Quiz)
    data object History : BottomNavItem(Screen.History.route, "Natijalar", Icons.Rounded.History)
    data object Profile : BottomNavItem(Screen.Profile.route, "Profil", Icons.Rounded.Person)
}

val bottomNavItems = listOf(
    BottomNavItem.Dashboard,
    BottomNavItem.Tests,
    BottomNavItem.History,
    BottomNavItem.Profile
)

@Composable
fun BottomNavBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 16.dp, vertical = 12.dp)
            .shadow(16.dp, shape = RoundedCornerShape(26.dp), spotColor = IndigoPrimary.copy(alpha = 0.2f)),
        shape = RoundedCornerShape(26.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
        tonalElevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp, horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            bottomNavItems.forEach { item ->
                val isSelected = currentRoute == item.route
                val animatedColor by animateColorAsState(
                    targetValue = if (isSelected) IndigoPrimary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                    animationSpec = tween(300),
                    label = "navColor"
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isSelected) IndigoPrimary.copy(alpha = 0.12f) else Color.Transparent)
                        .clickable(
                            indication = null,
                            interactionSource = remember { MutableInteractionSource() }
                        ) {
                            if (!isSelected) onNavigate(item.route)
                        }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.title,
                            tint = animatedColor,
                            modifier = Modifier.size(22.dp)
                        )
                        if (isSelected) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = item.title,
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    color = IndigoPrimary
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}
