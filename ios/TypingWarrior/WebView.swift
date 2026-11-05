// The web view that runs the renderer: app:// scheme for the bundled files, window.desktop bridge,
// sounds without a tap first, and https links opened in Safari (the app page itself never navigates away).
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        if let root = Bundle.main.url(forResource: "renderer", withExtension: nil) {
            config.setURLSchemeHandler(AppSchemeHandler(root: root), forURLScheme: AppSchemeHandler.scheme)
        }
        config.mediaTypesRequiringUserActionForPlayback = []
        config.userContentController.addScriptMessageHandler(context.coordinator.bridge, contentWorld: .page, name: NativeBridge.name)
        if let url = Bundle.main.url(forResource: "bridge", withExtension: "js"), let source = try? String(contentsOf: url, encoding: .utf8) {
            config.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true } // Safari → Develop menu
        #endif
        context.coordinator.bridge.webView = webView
        webView.load(URLRequest(url: AppSchemeHandler.startURL))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let bridge = NativeBridge()

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url else { return decisionHandler(.cancel) }
            if url.scheme == AppSchemeHandler.scheme { return decisionHandler(.allow) }
            if url.scheme == "https" || url.scheme == "mailto" { UIApplication.shared.open(url) }
            decisionHandler(.cancel)
        }

        // target="_blank" links (About page): open in Safari instead of a new web view.
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url, url.scheme == "https" { UIApplication.shared.open(url) }
            return nil
        }

        // Hardware keys go to the page only while the web view is first responder.
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.becomeFirstResponder()
        }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                     completionHandler: @escaping (Bool) -> Void) {
            present(message, in: webView, actions: [("취소 / Cancel", false), ("확인 / OK", true)], completion: completionHandler)
        }

        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                     completionHandler: @escaping () -> Void) {
            present(message, in: webView, actions: [("확인 / OK", true)]) { _ in completionHandler() }
        }

        /// window.confirm/alert (e.g. "reset records?") as native alerts; WKWebView shows nothing otherwise.
        private func present(_ message: String, in webView: WKWebView, actions: [(String, Bool)], completion: @escaping (Bool) -> Void) {
            guard let presenter = webView.window?.rootViewController else { return completion(false) }
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            for (title, value) in actions {
                alert.addAction(UIAlertAction(title: title, style: value ? .default : .cancel) { _ in completion(value) })
            }
            (presenter.presentedViewController ?? presenter).present(alert, animated: true)
        }
    }
}
