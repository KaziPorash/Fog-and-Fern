-- Fog & Fern: initial demo inventory, safe to re-run (no customer data).
-- To update existing products use SQL UPDATE; seed does not overwrite them.

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'monstera', 'Monstera Deliciosa', 'A little statement. A lot of green.', 3800, 'foliage', 'Bestseller', 'monstera.jpg', 'Bright, indirect light', 'Water when the top soil feels dry', 'Medium · nursery pot included', 'Big, beautifully split leaves bring a little of the outdoors into your favorite corner. A classic for a reason.', 25, TRUE, 1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'rubber-plant', 'Rubber Plant', 'Glossy leaves, quiet confidence.', 3200, 'foliage', 'Easy care', 'rubber-plant.jpg', 'Bright, indirect light', 'Let the top soil dry between waterings', 'Small · nursery pot included', 'Sculptural foliage and deep green leaves make an everyday space feel a little more considered.', 25, TRUE, 2
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'haworthia', 'Zebra Haworthia', 'Small space. Big personality.', 1800, 'succulents', 'Easy care', 'haworthia.jpg', 'Bright, indirect light', 'Let the soil dry fully between waterings', 'Small · decorative pot included', 'A compact succulent with textured, striped leaves. Just the right amount of green for a desk, shelf, or sunny little nook.', 25, TRUE, 3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'cactus', 'Desert Cactus', 'Your sunny windowsill companion.', 1600, 'succulents', 'Easy care', 'cactus.jpg', 'A bright, sunny spot', 'Water sparingly when the soil is dry', 'Small · terracotta pot included', 'A tiny desert escape, with sculptural lines and a wonderfully unfussy personality. Give it light and a little room to grow.', 25, TRUE, 4
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'fern', 'Woodland Fern', 'A softer kind of green.', 2600, 'foliage', 'Lush foliage', 'fern.jpg', 'Gentle, indirect light', 'Keep soil lightly moist, never waterlogged', 'Medium · nursery pot included', 'Feathery fronds and layers of soft green bring a woodland feeling to your indoor collection.', 25, TRUE, 5
) ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, subtitle, price_cents, category, label, image, light, water, size, description, stock, active, display_order) VALUES (
  'potting-mix', 'Indoor Potting Mix', 'Good things start at the roots.', 1200, 'essentials', 'Plant essential', 'potting-mix.jpg', 'For indoor repotting', 'Choose a pot with drainage', '2-quart bag · soil blend', 'A fresh foundation for your next repotting day. An everyday indoor mix for many leafy houseplants; use a specialist mix for succulents.', 25, TRUE, 6
) ON CONFLICT (id) DO NOTHING;
