package uz.multitest.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import uz.multitest.app.core.theme.MultiTestTheme
import uz.multitest.app.presentation.navigation.MultiTestNavGraph

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MultiTestTheme {
                val navController = rememberNavController()
                MultiTestNavGraph(navController = navController)
            }
        }
    }
}
