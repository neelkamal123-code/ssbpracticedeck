# SSB Practice Web App

Premium minimal dark interface for reflective SSB preparation across:
- WAT (Word Association Test)
- SRT (Situation Reaction Test)
- TAT (Thematic Apperception Test)
- Lecturette

Built with:
- Next.js (App Router)
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Firebase (Auth, Firestore, Storage)

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

If Firebase env vars are not configured, the app uses local fallback services/data.
If Firebase env vars are configured, the app uses Firebase for:
- Google/Apple/Email authentication
- Profile + onboarding storage
- Avatar upload/update
- SSB dataset reads (Firestore, with local fallback if read fails)

## Firebase setup (what you need to do)
1. Create a Firebase project.
2. Add a Web App in Firebase Console.
3. Copy `.env.example` to `.env.local` and fill:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```
4. In Authentication > Sign-in method, enable:
   - Google
   - Apple
   - Email/Password
5. In Authentication > Settings > Authorized domains:
   - add localhost and your production domain.
6. In Firestore, add deck collections:
   - `ssb/wat/items`
   - `ssb/srt/items`
   - `ssb/tat/items`
   - `ssb/lecturette/items`
7. In Firestore, profile docs are stored at:
   - `profiles/{uid}`
8. In Storage, avatars are stored at:
   - `avatars/{uid}/{timestamp-file}`
9. Restart dev server after env setup:
```bash
npm run dev
```

## Suggested Firebase rules

Firestore:
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /ssb/{section}/items/{itemId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Storage:
```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Folder structure
```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
    profile/
      page.tsx
  components/
    auth/
      auth-screen.tsx
      profile-onboarding.tsx
    ssb/
      authenticated-practice.tsx
      practice-app.tsx
      practice-shell.tsx
      section-tabs.tsx
      swipe-card-deck.tsx
      cards/
        card-frame.tsx
        wat-card.tsx
        srt-card.tsx
        tat-card.tsx
        lecturette-card.tsx
  data/
    ssb/
      wat.json
      srt.json
      tat.json
      lecturette.json
  domain/
    ssb/
      sections.ts
      types.ts
  lib/
    firebase/
      client.ts
    icon-map.tsx
  providers/
    app-providers.tsx
    auth-provider.tsx
  services/
    auth/
      contracts.ts
      firebase-auth-service.ts
      index.ts
      local-auth-service.ts
    ssb/
      contracts.ts
      firebase-data-source.ts
      index.ts
      local-data-source.ts
      mappers.ts
```

## Data model (Firestore ready)
Each item is a single document shape that works both in static JSON and Firestore.

Common fields:
- `id`
- `title`
- `icon`
- `category`
- `suggestions` or `anchors` or `facts`
- `externalLink` (optional)

## Vercel deployment strategy
1. Push repo to GitHub.
2. Import project in Vercel.
3. Build command: `npm run build`.
4. Output: default Next.js output.
5. Add all `NEXT_PUBLIC_FIREBASE_*` env vars.
6. Deploy to Preview first, then promote to Production.
