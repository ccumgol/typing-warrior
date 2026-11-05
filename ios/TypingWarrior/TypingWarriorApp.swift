// iPad app: shows the same renderer as the desktop app (src/renderer) in a WKWebView.
// Practice needs a hardware keyboard (Bluetooth, Magic Keyboard, Smart Keyboard).
import SwiftUI

@main
struct TypingWarriorApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .ignoresSafeArea(.container, edges: .bottom)
                .background(Color(red: 0x11 / 255, green: 0x13 / 255, blue: 0x1a / 255))
        }
    }
}
