-- Launch seed. Safe to re-run (upserts). Prices are 0 = "Price on request" until set in admin.
-- Descriptions are placeholders: never add ingredient, allergen or health claims here.

insert into store_settings (id) values (1) on conflict (id) do nothing;

insert into tags (slug, label, sort_order) values
  ('eggless', 'Eggless', 1),
  ('egg', 'Egg', 2),
  ('pull-up', 'Pull-Up', 3),
  ('sugar-free', 'Sugar-Free', 4),
  ('gift-box', 'Gift Box', 5)
on conflict (slug) do update set label = excluded.label, sort_order = excluded.sort_order;

with src (display_no, slug, name, tag_slugs, featured) as (values
  (1,  'signature-belgian-chocolate',  'Signature Belgian Chocolate Cake',  array['eggless'],               true),
  (2,  'chocolate-pistachio',          'Chocolate Pistachio Cake',          array['eggless'],               true),
  (3,  'hazelnut',                     'Hazelnut Cake',                     array['egg'],                   true),
  (4,  'nutella-fudge',                'Nutella Fudge Cake',                array['eggless'],               false),
  (5,  'blueberry-rare-cheesecake',    'Blueberry Rare Cheesecake',         array['egg'],                   false),
  (6,  'coconut-pineapple',            'Coconut Pineapple Cake',            array['eggless'],               false),
  (7,  'salted-caramel',               'Salted Caramel Cake',               array['egg'],                   false),
  (8,  'sugar-free-truffle',           'Sugar-Free Truffle Cake',           array['eggless','sugar-free'],  true),
  (9,  'white-chocolate-raspberry',    'White Chocolate Raspberry Cake',    array['eggless'],               false),
  (10, 'berry-heart',                  'Berry Heart Cake',                  array['eggless'],               false),
  (11, 'russian-medovik',              'Russian Medovik Cake',              array['eggless'],               false),
  (12, 'rasmalai-tres-leches',         'Rasmalai Tres Leches Cake',         array['eggless'],               false),
  (13, 'red-velvet-pull-up',           'Red Velvet Pull-Up Cake',           array['eggless','pull-up'],     false),
  (14, 'raspberry-pistachio-pull-up',  'Raspberry Pistachio Pull-Up Cake',  array['eggless','pull-up'],     false),
  (15, 'chocolate-pull-up',            'Chocolate Pull-Up Cake',            array['eggless','pull-up'],     false)
),
ins as (
  insert into products (slug, display_no, name, description, is_featured, sort_order)
  select slug, display_no, name, '[PLACEHOLDER: description to be written by the bakery]', featured, display_no from src
  on conflict (slug) do update set display_no = excluded.display_no, name = excluded.name
  returning id, slug
),
v as (
  insert into product_variants (product_id, weight_grams, price_paise)
  select ins.id, w, 0 from ins cross join (values (500), (1000)) as weights(w)
  on conflict (product_id, weight_grams) do nothing
)
insert into product_tags (product_id, tag_id)
select ins.id, t.id from ins join src using (slug) join tags t on t.slug = any (src.tag_slugs)
on conflict do nothing;

-- INTERIM photos from /design. Rights and product mapping unconfirmed: replace before launch.
insert into product_images (product_id, src, width, height, alt, sort_order)
select p.id, x.src, 1280, 1600, x.alt, 0
from (values
  ('chocolate-pistachio', '/images/interim/chocolate-pistachio.jpg', 'Chocolate Pistachio Cake on a white stand'),
  ('hazelnut',            '/images/interim/hazelnut.jpg',            'Hazelnut Cake on a white stand'),
  ('sugar-free-truffle',  '/images/interim/truffle.jpg',             'Truffle Cake on a white stand')
) as x(slug, src, alt)
join products p on p.slug = x.slug
where not exists (select 1 from product_images i where i.product_id = p.id);

-- HSR Layout's public pincode. Edit or extend in admin.
insert into serviceable_pincodes (pincode, area_name) values ('560102', 'HSR Layout')
on conflict (pincode) do nothing;

-- Default slots (IST). Same-day cutoff = 4 hours before the slot starts. All editable in admin.
insert into delivery_slots (label, start_time, end_time, capacity, same_day_cutoff, kind, is_enabled, sort_order)
select * from (values
  ('11 AM – 1 PM', time '11:00', time '13:00', 3, time '07:00', 'standard'::slot_kind, true,  1),
  ('1 PM – 3 PM',  time '13:00', time '15:00', 3, time '09:00', 'standard'::slot_kind, true,  2),
  ('3 PM – 5 PM',  time '15:00', time '17:00', 3, time '11:00', 'standard'::slot_kind, true,  3),
  ('5 PM – 7 PM',  time '17:00', time '19:00', 3, time '13:00', 'standard'::slot_kind, true,  4),
  ('7 PM – 9 PM',  time '19:00', time '21:00', 3, time '15:00', 'standard'::slot_kind, true,  5),
  ('Midnight',     time '23:00', time '23:59', 0, time '15:00', 'midnight'::slot_kind, false, 6)
) as s
where not exists (select 1 from delivery_slots);

-- After your first login, make yourself admin (replace the number):
--   update users set role = 'admin' where phone = '+91XXXXXXXXXX';
