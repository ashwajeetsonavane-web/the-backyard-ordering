# THE BACKYARD — Mobile Direct Ordering

A clean mobile-first direct ordering website for THE BACKYARD.

## Included
- Mobile-first menu and cart
- Customer name, phone and location
- Browser location sharing
- UPI QR and COD
- Website order confirmation (no WhatsApp redirect)
- Order tracking page
- Admin order dashboard
- Status updates
- Supabase database
- Optional WhatsApp admin notifications
- Vercel-ready

## 1. Create Supabase database
Open Supabase SQL Editor and run `supabase.sql`.

## 2. Create Vercel environment variables
Project → Settings → Environment Variables:

`SUPABASE_URL` = your Supabase project URL

`SUPABASE_SERVICE_ROLE_KEY` = your Supabase server/service-role secret key

`ADMIN_KEY` = make your own strong admin password

Optional WhatsApp:
`WHATSAPP_TOKEN`
`WHATSAPP_PHONE_NUMBER_ID`
`ADMIN_WHATSAPP` = 917397964842

Never put SUPABASE_SERVICE_ROLE_KEY in frontend files.

## 3. GitHub
Create ONE new repository, upload the contents of this folder to the repository root. Do not put the whole folder inside another folder.

The root should show:
`api/`
`public/`
`lib.js`
`menu.json`
`package.json`
`supabase.sql`
`vercel.json`

## 4. Vercel
Import the GitHub repository. Framework preset can be `Other`. Build command can be empty. Deploy.

The public website is `/`.
Admin is `/admin`.
Tracking is `/track/ORDERID`.

## 5. Custom domain
Add `thebackyardcafe.online` and `www.thebackyardcafe.online` in Vercel Domains and follow the DNS values Vercel displays.

## 6. Test
1. Open the site on a phone.
2. Add an item.
3. Enter name, phone and location.
4. Choose COD or UPI.
5. Place order.
6. Open `/admin` and enter ADMIN_KEY.
7. Change status.
8. Open the tracking link.

## Important
The UPI QR currently uses `7397964842@okbizaxis`. Replace `public/upi-qr.png` and the displayed UPI ID if your payment details change.
