package uz.multitest.app.presentation.components

import android.annotation.SuppressLint
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.text.HtmlCompat
import coil.compose.AsyncImage
import java.util.regex.Pattern

@Composable
fun HtmlContentView(
    html: String,
    modifier: Modifier = Modifier,
    textColor: Color = MaterialTheme.colorScheme.onSurface,
    textAlign: TextAlign = TextAlign.Center
) {
    if (html.isBlank()) return

    val hasTable = remember(html) { html.contains("<table", ignoreCase = true) }
    val imgMatches = remember(html) { extractImages(html) }

    if (hasTable) {
        // Render rich table content using optimized transparent WebView with dark styling
        RichHtmlWebView(html = html, textColor = textColor, modifier = modifier)
    } else if (imgMatches.isNotEmpty()) {
        // Render images with AsyncImage and remaining text with clean Compose Text
        val cleanText = remember(html) {
            val textOnly = html.replace(Regex("<img[^>]*>", RegexOption.IGNORE_CASE), "")
            HtmlCompat.fromHtml(textOnly, HtmlCompat.FROM_HTML_MODE_COMPACT).toString().trim()
        }

        Column(
            modifier = modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            imgMatches.forEach { imgSrc ->
                val fullUrl = if (imgSrc.startsWith("http://") || imgSrc.startsWith("https://")) {
                    imgSrc
                } else if (imgSrc.startsWith("/")) {
                    "https://multitest.uz$imgSrc"
                } else {
                    "https://multitest.uz/$imgSrc"
                }

                AsyncImage(
                    model = fullUrl,
                    contentDescription = "Savol rasmi",
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 260.dp)
                        .clip(RoundedCornerShape(14.dp)),
                    contentScale = ContentScale.Fit
                )
            }

            if (cleanText.isNotBlank()) {
                Text(
                    text = cleanText,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.SemiBold,
                        color = textColor,
                        lineHeight = 26.sp
                    ),
                    textAlign = textAlign,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    } else {
        // Clean text without tables or images
        val parsedText = remember(html) {
            HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_COMPACT).toString().trim()
        }
        Text(
            text = parsedText,
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.SemiBold,
                color = textColor,
                lineHeight = 26.sp
            ),
            textAlign = textAlign,
            modifier = modifier.fillMaxWidth()
        )
    }
}

fun parseHtmlToPlainText(html: String?): String {
    if (html.isNullOrBlank()) return ""
    return HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_COMPACT).toString().trim()
}

private fun extractImages(html: String): List<String> {
    val list = mutableListOf<String>()
    val matcher = Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE).matcher(html)
    while (matcher.find()) {
        matcher.group(1)?.let { list.add(it) }
    }
    return list
}

@SuppressLint("SetJavaScriptEnabled")
private fun Color.toCssHex(): String = String.format("#%06X", 0xFFFFFF and this.toArgb())

@Composable
private fun RichHtmlWebView(
    html: String,
    textColor: Color,
    modifier: Modifier = Modifier
) {
    // Colors follow the app theme (Night Focus tokens in dark: text #E8ECF5, border #2A3557, header #172040).
    val text = textColor.toCssHex()
    val border = MaterialTheme.colorScheme.outline.toCssHex()
    val headerBg = MaterialTheme.colorScheme.surfaceVariant.toCssHex()

    val styledHtml = remember(html, text, border, headerBg) {
        val fixedHtml = html.replace("src=\"/storage", "src=\"https://multitest.uz/storage")
            .replace("src='/storage", "src='https://multitest.uz/storage")
            // Wide tables scroll sideways instead of shrinking
            .replace(Regex("<table", RegexOption.IGNORE_CASE), "<div class=\"tbl\"><table")
            .replace(Regex("</table>", RegexOption.IGNORE_CASE), "</table></div>")
        """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body {
                    margin: 0;
                    padding: 4px;
                    background-color: transparent;
                    color: $text;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 15px;
                    line-height: 1.5;
                    text-align: center;
                }
                p { margin: 8px 0; }
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    margin: 8px 0;
                }
                .tbl {
                    overflow-x: auto;
                    margin: 12px 0;
                    border: 1px solid $border;
                    border-radius: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: transparent;
                    font-size: 15px;
                    font-weight: 400;
                }
                th, td {
                    border: 1px solid $border !important;
                    padding: 8px 12px !important;
                    text-align: left;
                    vertical-align: top;
                }
                th, thead td {
                    background: $headerBg;
                    color: $text;
                    font-weight: 600;
                }
                .tbl tr > :first-child { border-left: 0 !important; }
                .tbl tr > :last-child { border-right: 0 !important; }
                .tbl tr:first-child > * { border-top: 0 !important; }
                .tbl tr:last-child > * { border-bottom: 0 !important; }
            </style>
        </head>
        <body>
            $fixedHtml
        </body>
        </html>
        """.trimIndent()
    }

    AndroidView(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 80.dp, max = 600.dp),
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                setBackgroundColor(0x00000000)
                settings.javaScriptEnabled = false
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = false
                webViewClient = WebViewClient()
                loadDataWithBaseURL("https://multitest.uz", styledHtml, "text/html", "UTF-8", null)
            }
        },
        update = { webView ->
            webView.loadDataWithBaseURL("https://multitest.uz", styledHtml, "text/html", "UTF-8", null)
        }
    )
}
