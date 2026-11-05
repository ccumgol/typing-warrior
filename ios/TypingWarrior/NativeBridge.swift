// Answers the renderer's window.desktop calls (bridge.js): Keychain secrets, the share sheet for
// badge cards, and whether a hardware keyboard is connected.
import GameController
import UIKit
import WebKit

final class NativeBridge: NSObject, WKScriptMessageHandlerWithReply {
    static let name = "tw"
    weak var webView: WKWebView?

    override init() {
        super.init()
        let center = NotificationCenter.default
        center.addObserver(self, selector: #selector(keyboardChanged), name: .GCKeyboardDidConnect, object: nil)
        center.addObserver(self, selector: #selector(keyboardChanged), name: .GCKeyboardDidDisconnect, object: nil)
    }

    static var hasKeyboard: Bool { GCKeyboard.coalesced != nil }

    @objc private func keyboardChanged() {
        webView?.evaluateJavaScript("window.__twKeyboardChanged?.(\(NativeBridge.hasKeyboard))")
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else {
            return replyHandler(nil, "Bad message")
        }
        switch type {
        case "secret-get":
            guard let name = body["name"] as? String, Keychain.isValidName(name) else { return replyHandler(nil, nil) }
            replyHandler(Keychain.get(name), nil)
        case "secret-set":
            guard let name = body["name"] as? String, Keychain.isValidName(name),
                  let value = body["value"] as? String, value.count <= Keychain.maxLength else { return replyHandler(false, nil) }
            replyHandler(Keychain.set(name, value), nil)
        case "share-image":
            guard let dataUrl = body["dataUrl"] as? String, let image = Self.image(fromDataURL: dataUrl) else {
                return replyHandler(false, nil)
            }
            share(image)
            replyHandler(true, nil)
        case "keyboard":
            replyHandler(NativeBridge.hasKeyboard, nil)
        default:
            replyHandler(nil, "Unknown message")
        }
    }

    private static func image(fromDataURL dataUrl: String) -> UIImage? {
        guard let comma = dataUrl.firstIndex(of: ","), dataUrl.hasPrefix("data:image/png;base64") else { return nil }
        guard let data = Data(base64Encoded: String(dataUrl[dataUrl.index(after: comma)...])) else { return nil }
        return UIImage(data: data)
    }

    /// Share sheet (Save Image, Files, Messages…); on iPad it must hang off a point on screen.
    private func share(_ image: UIImage) {
        guard let webView, let presenter = webView.window?.rootViewController else { return }
        let sheet = UIActivityViewController(activityItems: [image], applicationActivities: nil)
        sheet.popoverPresentationController?.sourceView = webView
        sheet.popoverPresentationController?.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
        sheet.popoverPresentationController?.permittedArrowDirections = []
        (presenter.presentedViewController ?? presenter).present(sheet, animated: true)
    }
}
