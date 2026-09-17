package uz.multitest.app.presentation.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import uz.multitest.app.presentation.dashboard.DashboardScreen
import uz.multitest.app.presentation.navigation.BottomNavBar
import uz.multitest.app.presentation.navigation.Screen
import uz.multitest.app.presentation.profile.HistoryScreen
import uz.multitest.app.presentation.profile.ProfileScreen
import uz.multitest.app.presentation.tests.TestsScreen

@Composable
fun MainScreen(
    onNavigateToTestDetail: (Long) -> Unit,
    onNavigateToExam: (Long) -> Unit,
    onNavigateToResult: (Long) -> Unit,
    onNavigateToAuth: () -> Unit
) {
    var currentTab by rememberSaveable { mutableStateOf(Screen.Dashboard.route) }

    Scaffold(
        bottomBar = {
            BottomNavBar(
                currentRoute = currentTab,
                onNavigate = { currentTab = it }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = innerPadding.calculateBottomPadding())
        ) {
            when (currentTab) {
                Screen.Dashboard.route -> {
                    DashboardScreen(
                        onNavigateToTestDetail = onNavigateToTestDetail,
                        onNavigateToExam = onNavigateToExam,
                        onNavigateToAllTests = { currentTab = Screen.Tests.route }
                    )
                }

                Screen.Tests.route -> {
                    TestsScreen(
                        onNavigateToDetail = onNavigateToTestDetail
                    )
                }

                Screen.History.route -> {
                    HistoryScreen(
                        onNavigateToResult = onNavigateToResult
                    )
                }

                Screen.Profile.route -> {
                    ProfileScreen(
                        onNavigateToAuth = onNavigateToAuth
                    )
                }
            }
        }
    }
}
