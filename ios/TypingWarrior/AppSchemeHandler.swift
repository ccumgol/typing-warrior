// Serves the bundled renderer files at app://typing-warrior/… so ES modules, dynamic imports,
// localStorage and IndexedDB work as they do on a normal web origin (file:// URLs would block modules).
import Foundation
import WebKit

final class AppSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "app"
    static let host = "typing-warrior"
    static var startURL: URL { URL(string: "\(scheme)://\(host)/index.html")! }

    private let root: URL
    private let types = [
        "html": "text/html", "js": "text/javascript", "css": "text/css", "json": "application/json",
        "svg": "image/svg+xml", "png": "image/png", "woff2": "font/woff2",
    ]

    init(root: URL) {
        self.root = root.standardizedFileURL
    }

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, let file = fileURL(for: url) else {
            return fail(task, status: 404)
        }
        do {
            let data = try Data(contentsOf: file)
            let type = types[file.pathExtension.lowercased()] ?? "application/octet-stream"
            let headers = ["Content-Type": "\(type); charset=utf-8", "Content-Length": String(data.count)]
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!
            task.didReceive(response)
            task.didReceive(data)
            task.didFinish()
        } catch {
            fail(task, status: 404)
        }
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}

    /// Maps a request path to a file inside the renderer folder; nil for anything outside it.
    private func fileURL(for url: URL) -> URL? {
        let path = url.path.isEmpty || url.path == "/" ? "/index.html" : url.path
        let file = root.appendingPathComponent(path).standardizedFileURL
        guard file.path.hasPrefix(root.path + "/") else { return nil }
        return file
    }

    private func fail(_ task: WKURLSchemeTask, status: Int) {
        let url = task.request.url ?? AppSchemeHandler.startURL
        task.didReceive(HTTPURLResponse(url: url, statusCode: status, httpVersion: "HTTP/1.1", headerFields: nil)!)
        task.didReceive(Data())
        task.didFinish()
    }
}
