package uz.multitest.app.presentation.navigation

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object Auth : Screen("auth")
    data object Main : Screen("main")
    
    // Bottom nav tabs
    data object Dashboard : Screen("dashboard")
    data object Tests : Screen("tests")
    data object History : Screen("history")
    data object Profile : Screen("profile")

    // Flow screens
    data object TestDetail : Screen("test_detail/{testId}") {
        fun createRoute(testId: Long) = "test_detail/$testId"
    }

    data object SpeakingExam : Screen("speaking_exam/{attemptId}") {
        fun createRoute(attemptId: Long) = "speaking_exam/$attemptId"
    }

    data object ExamResult : Screen("exam_result/{attemptId}") {
        fun createRoute(attemptId: Long) = "exam_result/$attemptId"
    }
}
