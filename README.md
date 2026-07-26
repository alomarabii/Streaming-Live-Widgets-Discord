# Streaming Live Widgets Discord
# YouTube + Twitch + Kick Discord Widgets

## English Version

This project creates three independent Discord Profile Widgets:

1. YouTube widget.
2. Twitch widget.
3. Kick widget.

Each widget uses its own Discord application, bot, and token. However, all three bots are included in the same project and run together through a single startup command.

## How it works

Each bot reads the channel name for its platform, fetches the publicly available data, converts it into Discord User Data fields, and then sends it to the Discord Widget API.

```text
Channel name
     ↓
Public platform data
     ↓
Discord User Data fields
     ↓
Discord Profile Widget
```

No YouTube API key, Twitch Client ID, or Kick Client ID is required. Only the channel name and the Discord data for each widget are needed.

## Discord Widget field types

When creating fields in the Discord Widget Editor, the correct type must be selected:

| Type | Use |
|---|---|
| `String` | Text values such as channel name, stream status, and title |
| `Number` | Numeric values such as followers and viewers |
| `Image` | Images such as profile pictures and stream thumbnails |

Field names are case-sensitive. They must be written exactly as defined, for example:

```text
live_viewers
```

and not:

```text
Live_Viewers
```

# YouTube fields

| Field | Type | Description |
|---|---|---|
| `channel_name` | String | YouTube channel name |
| `avatar` | Image | Channel profile picture |
| `description` | String | Channel description, shortened if long |
| `status` | String | Channel status: `LIVE` or `OFFLINE` |
| `stream_title` | String | Current live stream title |
| `thumbnail` | Image | Stream thumbnail |
| `subscribers` | Number | Subscriber count when available |
| `subscribers_display` | String | Count as shown by the platform or a message indicating it is unavailable |
| `videos` | Number | Number of videos when available |
| `videos_status` | String | Number of videos as text or an unavailable message |
| `live_viewers` | Number | Current live viewers |
| `channel_url` | String | YouTube channel URL |
| `stream_url` | String | Current stream URL |
| `updated_at` | String | Last update time (e.g., "Just now", "5 minutes ago") |

Example:

```text
channel_name = Mohammed
description = Tech and gaming content creator
status = LIVE
stream_title = Gaming Session
subscribers_display = 12.5K subscribers
live_viewers = 430
updated_at = Just now
```

# Twitch fields

| Field | Type | Description |
|---|---|---|
| `channel_name` | String | Twitch channel name |
| `avatar` | Image | Channel profile picture |
| `status` | String | Channel status: `LIVE` or `OFFLINE` |
| `stream_title` | String | Current stream title |
| `thumbnail` | Image | Stream preview image |
| `game` | String | Current game or category |
| `game_image` | Image | Current game or category image |
| `followers` | Number | Total follower count |
| `followers_compact` | String | Compact follower count, e.g. `12.5K` |
| `subscribers` | Number | Subscriber count when publicly available |
| `subscribers_status` | String | Subscriber count or unavailable message |
| `live_viewers` | Number | Current viewer count |
| `uptime` | String | How long the stream has been running |
| `channel_url` | String | Twitch channel URL |
| `updated_at` | String | Last update time (e.g., "Just now", "5 minutes ago") |

Example:

```text
channel_name = streamername
status = LIVE
stream_title = Competitive Gaming
game = Just Chatting
followers_compact = 12.5K
subscribers_status = Not publicly available
live_viewers = 850
uptime = 2 hours, 15 minutes
updated_at = Just now
```

# Kick fields

| Field | Type | Description |
|---|---|---|
| `channel_name` | String | Kick channel name |
| `avatar` | Image | Channel profile picture |
| `banner` | Image | Channel banner image |
| `description` | String | Channel description |
| `verified` | String | Whether the channel is verified |
| `status` | String | Channel status: `LIVE` or `OFFLINE` |
| `stream_title` | String | Current stream title |
| `thumbnail` | Image | Stream image |
| `category` | String | Current category or game |
| `category_image` | Image | Category image |
| `followers` | Number | Follower count |
| `followers_compact` | String | Compact follower count, e.g. `850K` |
| `subscribers` | Number | Subscriber count when provided by Kick |
| `subscribers_status` | String | Subscriber count or unavailable message |
| `live_viewers` | Number | Current viewer count |
| `language` | String | Stream language |
| `uptime` | String | Stream duration |
| `chat_mode` | String | Current chat mode |
| `slow_mode` | String | Whether slow mode is enabled |
| `channel_url` | String | Kick channel URL |
| `updated_at` | String | Last update time (e.g., "Just now", "5 minutes ago") |

Kick may block some direct live requests with a `403` response. The app attempts to read Kick directly first; if this is blocked, it uses the Jina Reader proxy to read the public channel endpoint only. No bot token, Discord user ID, or other secrets are sent to the proxy.

Example:

```text
channel_name = streamer
verified = Verified
status = LIVE
stream_title = Broadcasting Live
category = Just Chatting
followers_compact = 8.5K
subscribers_status = Not publicly available
live_viewers = 320
language = English
chat_mode = Followers
slow_mode = Disabled
updated_at = Just now
```

# Unified settings file

All channel names and the three Discord tokens are stored in a single file:

```text
.env.streaming
```

Create it from the example file:

```powershell
Copy-Item .env.streaming.example .env.streaming
```

## Channel names

```env
YOUTUBE_CHANNEL_NAME=
TWITCH_CHANNEL_NAME=
KICK_CHANNEL_NAME=
```

You can enter just the name:

```env
YOUTUBE_CHANNEL_NAME=ChannelName
TWITCH_CHANNEL_NAME=ChannelName
KICK_CHANNEL_NAME=ChannelName
```

or the name with `@`:

```env
YOUTUBE_CHANNEL_NAME=@ChannelName
TWITCH_CHANNEL_NAME=@ChannelName
KICK_CHANNEL_NAME=@ChannelName
```

or the full channel URL:

```env
YOUTUBE_CHANNEL_NAME=https://youtube.com/@ChannelName
TWITCH_CHANNEL_NAME=https://twitch.tv/ChannelName
KICK_CHANNEL_NAME=https://kick.com/ChannelName
```

# Discord bot data for all three bots

You need to create three Discord applications and three bots:

```text
YouTube Application → YouTube Bot Token
Twitch Application  → Twitch Bot Token
Kick Application    → Kick Bot Token
```

## YouTube bot

```env
YOUTUBE_DISCORD_APP_ID=
YOUTUBE_DISCORD_USER_ID=
YOUTUBE_DISCORD_BOT_TOKEN=
YOUTUBE_DISCORD_WIDGET_USERNAME=YouTube Live
```

| Variable | Description |
|---|---|
| `YOUTUBE_DISCORD_APP_ID` | Discord Application ID for YouTube |
| `YOUTUBE_DISCORD_USER_ID` | Discord account ID that will display the widget |
| `YOUTUBE_DISCORD_BOT_TOKEN` | YouTube bot token |
| `YOUTUBE_DISCORD_WIDGET_USERNAME` | Display name shown above the widget |

## Twitch bot

```env
TWITCH_DISCORD_APP_ID=
TWITCH_DISCORD_USER_ID=
TWITCH_DISCORD_BOT_TOKEN=
TWITCH_DISCORD_WIDGET_USERNAME=Twitch Live
IGDB_CLIENT_ID=
IGDB_ACCESS_TOKEN=
```

| Variable | Description |
|---|---|
| `TWITCH_DISCORD_APP_ID` | Discord Application ID for Twitch |
| `TWITCH_DISCORD_USER_ID` | Discord account ID that will display the widget |
| `TWITCH_DISCORD_BOT_TOKEN` | Twitch bot token |
| `TWITCH_DISCORD_WIDGET_USERNAME` | Display name shown above the widget |
| `IGDB_CLIENT_ID` | IGDB API Client ID (optional, for game images) |
| `IGDB_ACCESS_TOKEN` | IGDB API Access Token (optional, for game images) |

### Getting IGDB credentials

To enable game images for Twitch:

1. Visit https://www.igdb.com/api
2. Sign up or log in
3. Copy your `Client ID` and `Access Token`
4. Add them to `.env.streaming`

If IGDB credentials are not provided, the bot still works—only the game image field will be empty.

## Kick bot

```env
KICK_DISCORD_APP_ID=
KICK_DISCORD_USER_ID=
KICK_DISCORD_BOT_TOKEN=
KICK_DISCORD_WIDGET_USERNAME=Kick Live
```

| Variable | Description |
|---|---|
| `KICK_DISCORD_APP_ID` | Discord Application ID for Kick |
| `KICK_DISCORD_USER_ID` | Discord account ID that will display the widget |
| `KICK_DISCORD_BOT_TOKEN` | Kick bot token |
| `KICK_DISCORD_WIDGET_USERNAME` | Display name shown above the widget |

The same `DISCORD_USER_ID` can be used for all three sections because the widgets will appear on the same Discord account, but each application must have its own bot token.

# Meaning of “Not publicly available”

Some platforms do not publicly expose certain numbers, especially paid subscriber counts.

When a number is hidden, the result may be:

```text
subscribers = 0
subscribers_status = Not publicly available
```

The zero is a numeric fallback so that the Discord widget does not break. It does not mean the channel has no subscribers. The `subscribers_status` field explains that the true number is not publicly available.

# Creating Widgets in Discord and TCNO

Use this guide:

https://hub.tcno.co/discord/widgets/

Then follow these steps:

1. Create a Discord Application for YouTube.
2. Create a Discord Application for Twitch.
3. Create a Discord Application for Kick.
4. Enable Social SDK for each application.
5. Create a widget inside each application.
6. Create the YouTube fields in the first application.
7. Create the Twitch fields in the second application.
8. Create the Kick fields in the third application.
9. Set images to type `Image`.
10. Set numbers to type `Number`.
11. Set the remaining fields to type `String`.
12. Click Save and then Publish for each widget.
13. Authorize each application with the `openid` and `sdk.social_layer` scopes.
14. Add the three widgets to your Discord profile.

# Update settings

Inside `.env.streaming`:

```env
UPDATE_INTERVAL_SECONDS=60
REQUEST_TIMEOUT_MS=20000
MAX_RETRIES=3
```

| Variable | Description |
|---|---|
| `UPDATE_INTERVAL_SECONDS` | Number of seconds between updates |
| `REQUEST_TIMEOUT_MS` | Maximum time to wait for a network request |
| `MAX_RETRIES` | Number of retry attempts on failure |

# Test each platform

Test YouTube without updating Discord:

```powershell
npm run dry-run:youtube
```

Test Twitch:

```powershell
npm run dry-run:twitch
```

Test Kick:

```powershell
npm run dry-run:kick
```

The tests show data and Discord JSON in the terminal, but do not send an update to Discord.

# Running

Run all three bots together:

```powershell
npm start
```

or:

```powershell
npm run start:all
```

This starts YouTube, Twitch, and Kick as independent processes. If one bot stops, the supervisor restarts it after five seconds without stopping the other two.

To stop everyone:

```text
Ctrl+C
```

# Security

- Do not share bot tokens with anyone.
- Do not place tokens inside JavaScript files.
- Do not upload `.env.streaming` to GitHub.
- Use Reset Token immediately if any token appears in a public place.
- Use a different bot token for each Discord application.

---

## النسخة العربية


## طريقة العمل

كل بوت يقرأ اسم القناة الخاصة بمنصته، ثم يجلب البيانات العامة المتاحة ويحوّلها
إلى حقول `User Data`، وبعد ذلك يرسلها إلى Discord Widget API.

```text
Channel name
     ↓
Public platform data
     ↓
Discord User Data fields
     ↓
Discord Profile Widget
```

لا يحتاج جلب بيانات القنوات إلى YouTube API Key أو Twitch Client ID أو Kick
Client ID. المطلوب فقط اسم القناة وبيانات Discord الخاصة بكل Widget.

## أنواع الحقول في Discord Widget

عند إنشاء الحقول في Discord Widget Editor، يجب تحديد النوع الصحيح:

| النوع | الاستخدام |
|---|---|
| `String` | النصوص مثل اسم القناة وحالة البث والعنوان |
| `Number` | الأرقام مثل المتابعين والمشاهدين |
| `Image` | الصور مثل الصورة الشخصية وصورة البث |

أسماء الحقول حساسة لحالة الأحرف. يجب كتابة الاسم كما هو تمامًا؛ مثلًا:

```text
live_viewers
```

ولا يُكتب:

```text
Live_Viewers
```

# حقول YouTube

| الحقل | النوع | الشرح |
|---|---|---|
| `channel_name` | String | اسم قناة YouTube |
| `avatar` | Image | الصورة الشخصية للقناة |
| `description` | String | وصف القناة، ويتم اختصاره إذا كان طويلًا |
| `status` | String | حالة القناة: `LIVE` أو `OFFLINE` |
| `stream_title` | String | عنوان البث المباشر الحالي |
| `thumbnail` | Image | الصورة المصغرة للبث |
| `subscribers` | Number | عدد المشتركين عندما يكون متاحًا |
| `subscribers_display` | String | العدد كما تعرضه المنصة أو رسالة عدم توفره |
| `videos` | Number | عدد فيديوهات القناة عندما يكون متاحًا |
| `videos_status` | String | عدد الفيديوهات كنص أو رسالة عدم توفره |
| `live_viewers` | Number | عدد مشاهدي البث الآن |
| `channel_url` | String | رابط قناة YouTube |
| `stream_url` | String | رابط البث الحالي |
| `updated_at` | String | وقت آخر تحديث (مثلاً "للتو"، "قبل 5 دقائق") |

مثال:

```text
channel_name = Mohammed
description = منشئ تكنولوجيا وألعاب
status = LIVE
stream_title = Gaming Session
subscribers_display = 12.5K subscribers
live_viewers = 430
updated_at = للتو
```

# حقول Twitch

| الحقل | النوع | الشرح |
|---|---|---|
| `channel_name` | String | اسم قناة Twitch |
| `avatar` | Image | الصورة الشخصية للقناة |
| `status` | String | حالة القناة: `LIVE` أو `OFFLINE` |
| `stream_title` | String | عنوان البث الحالي |
| `thumbnail` | Image | صورة معاينة البث عند الاتصال |
| `game` | String | اللعبة أو التصنيف الحالي |
| `followers` | Number | عدد المتابعين الكامل |
| `followers_compact` | String | عدد المتابعين مختصرًا، مثل `12.5K` |
| `game_image` | Image | صورة اللعبة أو التصنيف الحالي |
| `subscribers` | Number | عدد المشتركين عندما يكون متاحًا للعامة |
| `subscribers_status` | String | عدد المشتركين أو رسالة عدم توفره |
| `live_viewers` | Number | عدد المشاهدين الحالي |
| `uptime` | String | المدة التي استمر فيها البث |
| `channel_url` | String | رابط قناة Twitch |
| `updated_at` | String | وقت آخر تحديث (مثلاً "للتو"، "قبل 5 دقائق") |

مثال:

```text
channel_name = streamername
status = LIVE
stream_title = Competitive Gaming
game = Just Chatting
followers_compact = 12.5K
subscribers_status = Not publicly available
live_viewers = 850
uptime = 2 hours, 15 minutes
updated_at = للتو
```

# حقول Kick

| الحقل | النوع | الشرح |
|---|---|---|
| `channel_name` | String | اسم قناة Kick |
| `avatar` | Image | الصورة الشخصية للقناة |
| `banner` | Image | صورة غلاف القناة |
| `description` | String | وصف القناة |
| `verified` | String | هل القناة موثقة؟ |
| `status` | String | حالة القناة: `LIVE` أو `OFFLINE` |
| `stream_title` | String | عنوان البث الحالي |
| `thumbnail` | Image | صورة البث |
| `category` | String | التصنيف أو اللعبة الحالية |
| `category_image` | Image | صورة التصنيف |
| `followers` | Number | عدد المتابعين |
| `followers_compact` | String | عدد المتابعين مختصرًا، مثل `850K` |
| `subscribers` | Number | عدد المشتركين عندما توفره Kick |
| `subscribers_status` | String | عدد المشتركين أو رسالة عدم توفره |
| `live_viewers` | Number | عدد المشاهدين الحالي |
| `language` | String | لغة البث |
| `uptime` | String | مدة البث |
| `chat_mode` | String | وضع الدردشة الحالي |
| `slow_mode` | String | هل الوضع البطيء مفعل؟ |
| `channel_url` | String | رابط قناة Kick |
| `updated_at` | String | وقت آخر تحديث (مثلاً "للتو"، "قبل 5 دقائق") |

قد يحظر Kick بعض طلبات البرامج المباشرة برمز `403`. يحاول البرنامج قراءة Kick
مباشرة أولًا، وإذا حدث هذا الحظر يستخدم وسيط Jina Reader لقراءة endpoint العام
للقناة فقط. لا يُرسل Bot Token أو Discord User ID أو أي بيانات سرية إلى الوسيط.

مثال:

```text
channel_name = streamer
verified = Verified
status = LIVE
stream_title = Broadcasting Live
category = Just Chatting
followers_compact = 8.5K
subscribers_status = Not publicly available
live_viewers = 320
language = English
chat_mode = Followers
slow_mode = Disabled
updated_at = للتو
```

# ملف الإعداد الموحد

جميع أسماء القنوات وتوكنات Discord الثلاثة توضع داخل ملف واحد:

```text
.env.streaming
```

أنشئه من ملف المثال:

```powershell
Copy-Item .env.streaming.example .env.streaming
```

## أسماء القنوات

```env
YOUTUBE_CHANNEL_NAME=
TWITCH_CHANNEL_NAME=
KICK_CHANNEL_NAME=
```

يمكن إدخال الاسم فقط:

```env
YOUTUBE_CHANNEL_NAME=ChannelName
TWITCH_CHANNEL_NAME=ChannelName
KICK_CHANNEL_NAME=ChannelName
```

أو الاسم مع `@`:

```env
YOUTUBE_CHANNEL_NAME=@ChannelName
TWITCH_CHANNEL_NAME=@ChannelName
KICK_CHANNEL_NAME=@ChannelName
```

أو رابط القناة الكامل:

```env
YOUTUBE_CHANNEL_NAME=https://youtube.com/@ChannelName
TWITCH_CHANNEL_NAME=https://twitch.tv/ChannelName
KICK_CHANNEL_NAME=https://kick.com/ChannelName
```

# بيانات Discord للبوتات الثلاثة

يجب إنشاء ثلاثة Discord Applications وثلاثة Bots:

```text
YouTube Application → YouTube Bot Token
Twitch Application  → Twitch Bot Token
Kick Application    → Kick Bot Token
```

## بوت YouTube

```env
YOUTUBE_DISCORD_APP_ID=
YOUTUBE_DISCORD_USER_ID=
YOUTUBE_DISCORD_BOT_TOKEN=
YOUTUBE_DISCORD_WIDGET_USERNAME=YouTube Live
```

| المتغير | الشرح |
|---|---|
| `YOUTUBE_DISCORD_APP_ID` | رقم Discord Application الخاص بـYouTube |
| `YOUTUBE_DISCORD_USER_ID` | رقم حساب Discord الذي سيظهر عليه Widget |
| `YOUTUBE_DISCORD_BOT_TOKEN` | توكن بوت YouTube |
| `YOUTUBE_DISCORD_WIDGET_USERNAME` | الاسم الظاهر أعلى Widget |

## بوت Twitch

```env
TWITCH_DISCORD_APP_ID=
TWITCH_DISCORD_USER_ID=
TWITCH_DISCORD_BOT_TOKEN=
TWITCH_DISCORD_WIDGET_USERNAME=Twitch Live
IGDB_CLIENT_ID=
IGDB_ACCESS_TOKEN=
```

| المتغير | الشرح |
|---|---|
| `TWITCH_DISCORD_APP_ID` | رقم Discord Application الخاص بـTwitch |
| `TWITCH_DISCORD_USER_ID` | رقم حساب Discord الذي سيظهر عليه Widget |
| `TWITCH_DISCORD_BOT_TOKEN` | توكن بوت Twitch |
| `TWITCH_DISCORD_WIDGET_USERNAME` | الاسم الظاهر أعلى Widget |
| `IGDB_CLIENT_ID` | معرّف IGDB API (اختياري، لصور الألعاب) |
| `IGDB_ACCESS_TOKEN` | رمز IGDB API (اختياري، لصور الألعاب) |

### الحصول على بيانات IGDB

لتفعيل صور الألعاب في Twitch:

1. اذهب إلى https://www.igdb.com/api
2. سجل حساب جديد أو سجل دخول
3. انسخ `Client ID` و `Access Token`
4. ضعهما في `.env.streaming`

إذا لم توفر بيانات IGDB، البوت يعمل بشكل طبيعي—فقط حقل صورة اللعبة سيكون فارغاً.

## بوت Kick

```env
KICK_DISCORD_APP_ID=
KICK_DISCORD_USER_ID=
KICK_DISCORD_BOT_TOKEN=
KICK_DISCORD_WIDGET_USERNAME=Kick Live
```

| المتغير | الشرح |
|---|---|
| `KICK_DISCORD_APP_ID` | رقم Discord Application الخاص بـKick |
| `KICK_DISCORD_USER_ID` | رقم حساب Discord الذي سيظهر عليه Widget |
| `KICK_DISCORD_BOT_TOKEN` | توكن بوت Kick |
| `KICK_DISCORD_WIDGET_USERNAME` | الاسم الظاهر أعلى Widget |

يمكن أن يكون `DISCORD_USER_ID` هو الرقم نفسه في الأقسام الثلاثة لأن الـWidgets
ستظهر على حساب Discord نفسه، لكن يجب أن يكون لكل Application توكن بوت مستقل.

# معنى Not publicly available

بعض المنصات لا تنشر بعض الأرقام للعامة، خصوصًا عدد المشتركين المدفوعين.

عندما يكون الرقم مخفيًا قد تكون النتيجة:

```text
subscribers = 0
subscribers_status = Not publicly available
```

الصفر قيمة رقمية احتياطية حتى لا يتعطل Discord Widget. لا يعني ذلك أن القناة
ليس لديها مشتركون. حقل `subscribers_status` يوضح أن الرقم الحقيقي غير منشور.

# إنشاء Widgets في Discord وTCNO

استخدم دليل:

https://hub.tcno.co/discord/widgets/

ثم نفّذ الخطوات التالية:

1. أنشئ Discord Application خاصًا بـYouTube.
2. أنشئ Discord Application خاصًا بـTwitch.
3. أنشئ Discord Application خاصًا بـKick.
4. فعّل Social SDK في كل Application.
5. أنشئ Widget داخل كل Application.
6. أنشئ حقول YouTube في التطبيق الأول.
7. أنشئ حقول Twitch في التطبيق الثاني.
8. أنشئ حقول Kick في التطبيق الثالث.
9. اجعل الصور من نوع `Image`.
10. اجعل الأرقام من نوع `Number`.
11. اجعل بقية الحقول من نوع `String`.
12. اضغط Save ثم Publish لكل Widget.
13. فوّض كل Application بالنطاقين `openid` و`sdk.social_layer`.
14. أضف الـWidgets الثلاثة إلى بروفايل Discord.

# إعدادات التحديث

داخل `.env.streaming`:

```env
UPDATE_INTERVAL_SECONDS=60
REQUEST_TIMEOUT_MS=20000
MAX_RETRIES=3
```

| المتغير | الشرح |
|---|---|
| `UPDATE_INTERVAL_SECONDS` | عدد الثواني بين كل تحديث |
| `REQUEST_TIMEOUT_MS` | أقصى مدة لانتظار طلب الشبكة |
| `MAX_RETRIES` | عدد محاولات إعادة الطلب عند الفشل |

# اختبار كل منصة

اختبار YouTube دون تعديل Discord:

```powershell
npm run dry-run:youtube
```

اختبار Twitch:

```powershell
npm run dry-run:twitch
```

اختبار Kick:

```powershell
npm run dry-run:kick
```

يظهر الاختبار البيانات وDiscord JSON في الطرفية، لكنه لا يرسل تحديثًا إلى
Discord.

# التشغيل

تشغيل البوتات الثلاثة معًا:

```powershell
npm start
```

أو:

```powershell
npm run start:all
```

يشغّل الأمر YouTube وTwitch وKick كعمليات مستقلة. إذا تعطّل أحد البوتات، يعيد
المشغّل تشغيله بعد خمس ثوانٍ دون إيقاف البوتين الآخرين.

لإيقاف الجميع:

```text
Ctrl+C
```

# الأمان

- لا ترسل Bot Tokens لأي شخص.
- لا تضع التوكنات داخل ملفات JavaScript.
- لا ترفع `.env.streaming` إلى GitHub.
- استخدم Reset Token فورًا إذا ظهر أي توكن في مكان عام.
- استخدم لكل Discord Application.
- 
