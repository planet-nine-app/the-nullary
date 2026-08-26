import Tauri
import UIKit

private let appGroupSuite = "group.freyja.idothis"

struct WriteValueArgs: Decodable {
    let key: String
    let value: String
}

struct ReadValueArgs: Decodable {
    let key: String
}

@objc public class AppGroupPlugin: Plugin {

    @objc public func writeValue(_ invoke: Invoke) throws {
        let args = try invoke.parseArgs(WriteValueArgs.self)
        guard let defaults = UserDefaults(suiteName: appGroupSuite) else {
            invoke.reject("Couldn't open the \(appGroupSuite) App Group container.")
            return
        }
        defaults.set(args.value, forKey: args.key)
        invoke.resolve()
    }

    @objc public func readValue(_ invoke: Invoke) throws {
        let args = try invoke.parseArgs(ReadValueArgs.self)
        guard let defaults = UserDefaults(suiteName: appGroupSuite) else {
            invoke.reject("Couldn't open the \(appGroupSuite) App Group container.")
            return
        }
        invoke.resolve(["value": defaults.string(forKey: args.key) as Any])
    }
}

@_cdecl("init_plugin_app_group")
func initPlugin() -> Plugin {
    return AppGroupPlugin()
}
