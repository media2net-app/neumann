# Vercel Environment Variables Setup

Om ervoor te zorgen dat zowel localhost als live dezelfde database gebruiken, moet je de volgende environment variable instellen in Vercel:

## Stap 1: Ga naar Vercel Dashboard

1. Ga naar https://vercel.com/dashboard
2. Selecteer je project (neumann)
3. Ga naar **Settings** → **Environment Variables**

## Stap 2: Voeg Environment Variable toe

Voeg de volgende environment variable toe:

**Variable Name:**
```
PRISMA_ACCELERATE_URL
```

**Value:**
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19HdWIyYXhtanZ1NUd4X0JQSUtneDIiLCJhcGlfa2V5IjoiMDFLQUg1VlJETjhEWDZIUE01QTc4SjJGUlgiLCJ0ZW5hbnRfaWQiOiJkOTlkMDhiNGMyM2NhZjJhOGZkMDZmYjc4NzVkYWIyN2UxN2ZiZTQ4YzQ5NmRhY2I1YTI1NmY5M2E4OWRjNzQyIiwiaW50ZXJuYWxfc2VjcmV0IjoiNDBhNjVmNzctMjJmMC00MjY5LTlmODctMDVkNTNkYjkyMGU2In0.VldrPdx_V3sZ20vKNzNJXAoL7rA1VCSzXyI-2JP3kBU
```

**Environment:**
- ✅ Production
- ✅ Preview
- ✅ Development

## Stap 3: Redeploy

Na het toevoegen van de environment variable:
1. Ga naar **Deployments**
2. Klik op de drie puntjes (⋯) naast de laatste deployment
3. Klik op **Redeploy**

Of push een nieuwe commit naar GitHub om automatisch te deployen.

## Verificatie

Na de redeploy zou je moeten zien dat:
- ✅ Localhost en live dezelfde data tonen
- ✅ Klanten die je toevoegt op localhost ook op live verschijnen
- ✅ Wijzigingen op live ook op localhost zichtbaar zijn

## Belangrijk

- Zorg dat de `.env` file lokaal dezelfde `PRISMA_ACCELERATE_URL` bevat
- De `.env` file staat in `.gitignore`, dus wordt niet naar GitHub gepusht
- Vercel gebruikt de environment variables die je in het dashboard instelt

