export function hasEmojiOpening(text) {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}]+\s/u
  return emojiRegex.test(text)
}
