import { mysql as sql } from "@/utils/mysql";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedStart = Number(url.searchParams.get("start") ?? 0);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 10);

  const start = Number.isInteger(requestedStart) ? Math.max(0, requestedStart) : 0;
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 10;

  const stmt = `
    select
      a.id as id,
      a.name as name,
      a.html as html,
      a.address as address,
      a.description as description,
      a.is_free,
      a.currency,
      a.price,
      a.contact_method as contact_method,
      a.contact_email as contact_email,
      a.contact_phone as contact_phone,
      a.city_id as city_id,
      a.province_id as province_id,
      cast(date(a.create_time) as char) as create_date,
      a.item_id as item_id,
      a.category_id as category_id,
      a.viewed as viewed,
      p.ids as picture_ids
    from advertise a
    left outer join (
      select advertise_id,
        group_concat(concat(id, ' ', is_main, ' ', edit_time) separator ',') as ids
      from picture
      group by advertise_id
    ) p on a.id = p.advertise_id
    where a.active = ?
    order by a.create_time desc
    limit ${start}, ${limit}
  `;

  try {
    const ads = await new Promise<unknown[]>((resolve, reject) => {
      sql.handle.query(stmt, [1], (error, rows) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      });
    });

    return Response.json({ ads, start, limit });
  } catch (error) {
    return Response.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
