// User-entered secrets (the API.Bible key) in the iOS Keychain, like Electron safeStorage on the desktop.
import Foundation
import Security

enum Keychain {
    private static let service = "com.typingwarrior.app.secrets"
    private static let namePattern = try! NSRegularExpression(pattern: "^[a-z][a-z0-9-]{0,30}$") // same rule as src/main/main.cjs
    static let maxLength = 500

    static func isValidName(_ name: String) -> Bool {
        namePattern.firstMatch(in: name, range: NSRange(name.startIndex..., in: name)) != nil
    }

    static func get(_ name: String) -> String? {
        var query = baseQuery(name)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess, let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    /// An empty value removes the secret. Returns true when it was saved or removed.
    static func set(_ name: String, _ value: String) -> Bool {
        let query = baseQuery(name)
        SecItemDelete(query as CFDictionary)
        if value.isEmpty { return true }
        var item = query
        item[kSecValueData as String] = Data(value.utf8)
        item[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(item as CFDictionary, nil) == errSecSuccess
    }

    private static func baseQuery(_ name: String) -> [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service, kSecAttrAccount as String: name]
    }
}
