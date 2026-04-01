import SwiftUI

struct ContentView: View {
    @State private var isLoading = true

    var body: some View {
        ZStack {
            WebView(url: URL(string: "http://localhost:5173/")!, isLoading: $isLoading)
                .ignoresSafeArea() // Extend behind status bar
                .opacity(isLoading ? 0 : 1)

            if isLoading {
                Color(red: 17/255, green: 24/255, blue: 39/255)
                    .ignoresSafeArea()

                VStack(spacing: 16) {
                    Image(systemName: "dumbbell.fill")
                        .font(.system(size: 60))
                        .foregroundColor(Color(red: 251/255, green: 146/255, blue: 60/255))

                    Text("Grytt")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.white)

                    ProgressView()
                        .tint(Color(red: 251/255, green: 146/255, blue: 60/255))
                }
            }
        }
        .preferredColorScheme(.dark) // Force dark mode
        .statusBarStyle(.lightContent) // White status bar text
    }
}

// Extension to set status bar style
extension View {
    func statusBarStyle(_ style: UIStatusBarStyle) -> some View {
        self.modifier(StatusBarStyleModifier(style: style))
    }
}

struct StatusBarStyleModifier: ViewModifier {
    let style: UIStatusBarStyle

    func body(content: Content) -> some View {
        content
            .onAppear {
                // Set status bar style
                if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                    windowScene.windows.first?.rootViewController?.setNeedsStatusBarAppearanceUpdate()
                }
            }
    }
}

// In your App file, add this:
extension UIViewController {
    open override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
}
