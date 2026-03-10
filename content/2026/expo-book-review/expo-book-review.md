Title: Learning Expo - The Book Never Written But The Docs You Need
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: expo, react-native, mobile, book-review

I've built a few React Native apps over the years, and every time I'd approach them the same way: set up bare React Native, fight Gradle, compile for two hours, fail mysteriously, then switch to Expo and ship in a weekend. But I never really *learned* Expo properly - I just knew it worked.

So I spent the last month properly reading the Expo docs, working through some examples, and building a small app end-to-end. There's no single "Expo in Action" book like there is for other frameworks, but the official docs are genuinely solid. So this is a review of what you actually get when you commit to Expo for a real side project.

## What clicked

The setup is stupidly fast. `npx create-expo-app` and you're running on device within minutes. No Xcode drama, no Gradle nonsense - just a QR code and your phone runs the app. That sounds trivial until you've spent an hour fixing a Gradle plugin conflict.

The dev experience is where Expo shines. Instant reload, error overlays that actually tell you what went wrong, and you can iterate at the speed of hot module reloading. I wrote a form component, broke it, saw the error inline, fixed it, and never left my text editor. That's not a small thing when you're trying to ship a feature before the client's meeting tomorrow.

The built-in libraries are genuinely useful - `expo-camera`, `expo-file-system`, `expo-notifications`, `expo-location` - they all work immediately without wrestling native code. For a side project that needs to ship, this is magic. You can build a real app without ever touching Java or Swift.

Over-the-air updates are real. You push JavaScript changes to EAS Update and your users get them without the App Store. I built a bug fix at 9pm, pushed it, and it was live on all devices by 9:05pm. That alone is worth the switch from bare RN.

## What frustrated me

The docs don't explain *why* certain decisions exist. Expo's approach to native modules is "you can't do it easily - either ask Expo to support it or use a bare fork". That's a valid trade-off (simplicity vs flexibility), but they could be more explicit. I spent an hour looking for "advanced native code" before I understood: Expo is deliberately cutting those features.

EAS (Expo's paid cloud build service) is required if you want to build for iOS on a non-Mac machine. The builds themselves are fast and reliable, but you're buying into their ecosystem. The pricing is reasonable ($17-70/month depending on usage), but it's not free. If you're allergic to SaaS costs, you'll hit frustration here.

The performance story is unclear. Expo apps are slower than bare React Native - not dramatically, but noticeably on older devices. A FlatList with 100 items scrolls smoothly on my iPhone 15 but stutters on my Pixel 5a. The docs mention this vaguely but don't explain the overhead or suggest when to bail out and use bare RN instead.

Custom fonts work but require you to understand the exact naming conventions, and the error messages when you get it wrong are useless. I spent 20 minutes debugging "Poppins font not found" before I realized Expo needed the PostScript name, not the file name. Small paper cuts like this add up.

## Would I recommend it?

For a side project: absolutely. I built a working MVP in two weeks that I'd spend a month building with bare React Native. The constraint of "you can't use arbitrary native code" forced me to think about what I actually needed, and Expo's libraries cover 95% of real apps.

For a startup that'll scale to millions of users: maybe. You'll probably hit the performance ceiling or the "we need custom native code" wall eventually. But by then you've validated your idea and can afford to migrate or hire Android/iOS engineers.

For a hobby project that needs Android + iOS on one device: 100%. This is Expo's sweet spot. You're shipping fast, your users get updates immediately, and you're not drowning in toolchain configuration.

The experience surprised me - not because Expo is uniquely innovative (it's not), but because it lets you focus on building instead of fiddling with build systems. That's rarer in mobile development than it should be.

One more thing: the community around Expo is solid. The Discord is helpful, the GitHub issues get responses from maintainers, and there's a growing ecosystem of open-source libraries built on top. It doesn't feel like a dead ecosystem like some frameworks you pick up.

If you've been avoiding React Native because bare RN feels like too much friction, Expo genuinely changes the equation. You get native mobile apps with the JavaScript development speed you're used to. That's not nothing.
