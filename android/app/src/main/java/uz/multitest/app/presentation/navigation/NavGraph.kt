package uz.multitest.app.presentation.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import uz.multitest.app.presentation.auth.AuthScreen
import uz.multitest.app.presentation.exam.SpeakingExamScreen
import uz.multitest.app.presentation.main.MainScreen
import uz.multitest.app.presentation.result.ExamResultScreen
import uz.multitest.app.presentation.splash.SplashScreen
import uz.multitest.app.presentation.tests.TestDetailScreen

@Composable
fun MultiTestNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        enterTransition = { fadeIn(animationSpec = tween(300)) },
        exitTransition = { fadeOut(animationSpec = tween(300)) },
        popEnterTransition = { fadeIn(animationSpec = tween(300)) },
        popExitTransition = { fadeOut(animationSpec = tween(300)) }
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToMain = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToAuth = {
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Auth.route) {
            AuthScreen(
                onNavigateToMain = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Auth.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Main.route) {
            MainScreen(
                onNavigateToTestDetail = { testId ->
                    navController.navigate(Screen.TestDetail.createRoute(testId))
                },
                onNavigateToExam = { attemptId ->
                    navController.navigate(Screen.SpeakingExam.createRoute(attemptId))
                },
                onNavigateToResult = { attemptId ->
                    navController.navigate(Screen.ExamResult.createRoute(attemptId))
                },
                onNavigateToAuth = {
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.TestDetail.route,
            arguments = listOf(navArgument("testId") { type = NavType.LongType })
        ) { backStackEntry ->
            val testId = backStackEntry.arguments?.getLong("testId") ?: 0L
            TestDetailScreen(
                testId = testId,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToExam = { attemptId ->
                    navController.navigate(Screen.SpeakingExam.createRoute(attemptId)) {
                        popUpTo(Screen.TestDetail.route) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = Screen.SpeakingExam.route,
            arguments = listOf(navArgument("attemptId") { type = NavType.LongType })
        ) { backStackEntry ->
            val attemptId = backStackEntry.arguments?.getLong("attemptId") ?: 0L
            SpeakingExamScreen(
                attemptId = attemptId,
                onNavigateToResult = { resultAttemptId ->
                    navController.navigate(Screen.ExamResult.createRoute(resultAttemptId)) {
                        popUpTo(Screen.SpeakingExam.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.ExamResult.route,
            arguments = listOf(navArgument("attemptId") { type = NavType.LongType })
        ) { backStackEntry ->
            val attemptId = backStackEntry.arguments?.getLong("attemptId") ?: 0L
            ExamResultScreen(
                attemptId = attemptId,
                onNavigateToMain = {
                    navController.navigate(Screen.Main.route) {
                        popUpTo(Screen.Main.route) { inclusive = true }
                    }
                },
                onRetryTest = { testId ->
                    navController.navigate(Screen.TestDetail.createRoute(testId)) {
                        popUpTo(Screen.ExamResult.route) { inclusive = true }
                    }
                }
            )
        }
    }
}
