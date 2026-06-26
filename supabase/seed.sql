-- ============================================================================
-- FARMIO PTS HUB — Seed Data
-- Run this AFTER schema.sql, in the Supabase SQL Editor.
-- Populates the real agent roster + a few sample customers/orders so the
-- dashboards aren't empty on first load. Safe to delete all rows later
-- once you're entering real data.
-- ============================================================================

insert into public.agents (name, phone_number, status, monthly_lead_target, monthly_conversion_target, monthly_revenue_target_retailer, monthly_revenue_target_fnb, notes) values
('Lina',    '65 9086 6533', 'Active',   160, 24, 4224, 1368, 'Highly motivated and resourceful. Less "tech-savvy"/industry experience. 10-min weekly call: refine pitch + outreach channels.'),
('Caleb',   '65 9001 1403', 'Active',   40,  6,  1056, 342,  'Slightly more "chill." Weekly review (Mon/Fri) via text + bi-weekly call: current issues, outreach channels, pitch.'),
('Daniel',  null,           'Active',   0,   0,  0,    0,    null),
('Joanna',  '65 8111 9480', 'Active',   0,   0,  0,    0,    'Enjoys forming networks. Prefers "high revenue" customers over hawkers. Wants ownership — frame check-ins as ownership of projects.'),
('Kartik',  null,           'Inactive', 0,   0,  0,    0,    'Low activation due to lack of incentives (?)'),
('Timothy', null,           'Inactive', 0,   0,  0,    0,    'Low activation due to lack of incentives (?)'),
('Alan',    null,           'Inactive', 0,   0,  0,    0,    'Low activation due to lack of incentives (?)'),
('Simon',   null,           'Inactive', 0,   0,  0,    0,    'Low activation due to lack of incentives (?)'),
('Kai',     null,           'Inactive', 0,   0,  0,    0,    'Low activation due to lack of incentives (?)');

-- Sample customers (linked to agents by name lookup)
insert into public.customers (customer_name, customer_contact_number, assigned_agent_id, business_type, relationship_status)
select 'Fame by Dads Corner', null, id, 'F&B', 'Active' from public.agents where name = 'Lina'
union all
select 'Han Zai Lai', '65 87776789', id, 'Hawker', 'Lost' from public.agents where name = 'Caleb'
union all
select 'Passion Mart Pte Ltd', null, id, 'Minimart', 'Active' from public.agents where name = 'Caleb'
union all
select 'Ketty & Eisz', '65 94574610', id, 'Hawker', 'Lost' from public.agents where name = 'Caleb'
union all
select 'Bethel Development Centre', null, id, 'Childcare', 'Active' from public.agents where name = 'Joanna';

-- Sample orders (a handful of real-looking rows so the dashboards render data)
insert into public.orders (order_date, agent_id, customer_id, payment_method, revenue_sgd, products, order_type, cac_sgd, order_status, commission_amount, commission_status, commission_paid_date)
select
  '2026-04-16', a.id, c.id, 'Credit', 285.0,
  '2 x Triple Bundle; 50 pcs Quail Egg; 2 x 18kg Oil', 'New', 35, 'Paid', 35, 'Paid', '2026-05-04'
from public.agents a join public.customers c on c.customer_name = 'Fame by Dads Corner'
where a.name = 'Lina'
union all
select
  '2026-04-23', a.id, c.id, 'PayNow', 55.0,
  '1 x Egg+Oil Bundle', 'New', 35, 'Paid', 35, 'Paid', '2026-04-09'
from public.agents a join public.customers c on c.customer_name = 'Han Zai Lai'
where a.name = 'Caleb'
union all
select
  '2026-04-23', a.id, c.id, 'PayNow', 69.0,
  '1 x Grade B Carton', 'New', 50, 'Paid', 50, 'Paid', '2026-04-27'
from public.agents a join public.customers c on c.customer_name = 'Passion Mart Pte Ltd'
where a.name = 'Caleb'
union all
select
  '2026-04-29', a.id, c.id, 'PayNow', 112.0,
  '1 x $85 Bundle; 1 x Jasmine Rice', 'New', 35, 'Paid', 35, 'Pending', null
from public.agents a join public.customers c on c.customer_name = 'Ketty & Eisz'
where a.name = 'Caleb'
union all
select
  '2026-05-06', a.id, c.id, 'PayNow', 55.0,
  '1 x Egg+Oil Bundle', 'New', 35, 'Paid', 35, 'Pending', null
from public.agents a join public.customers c on c.customer_name = 'Bethel Development Centre'
where a.name = 'Joanna';
