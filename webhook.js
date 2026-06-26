export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const AIRTABLE_API_KEY = 'patQd64RxlNWzgrk8.f985ee1002071cbb1ec00b87a4dd1fae0921ad37bbbf6a7a948b7503f6b1e554';
  const AIRTABLE_BASE_ID = 'app8jKzf1mSn3mv8l';
  const AIRTABLE_TABLE   = 'tblMolRddeoeJyr2d';

  try {
    const body = req.body;
    const payload = body.payload || body;

    const attendee = payload.attendees?.[0] || {};
    const startTime = payload.startTime || payload.start_time || '';
    const date = startTime ? new Date(startTime) : new Date();

    const dateStr = date.toLocaleDateString('pt-PT', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      timeZone: 'Europe/Lisbon'
    });
    const timeStr = date.toLocaleTimeString('pt-PT', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon'
    });

    const fields = {
      'Decision Maker Name': attendee.name || payload.name || '',
      'Email':               attendee.email || payload.email || '',
      'Phone Number':        attendee.timeZone || '',
      'Company Name':        payload.eventTitle || 'Discovery Call',
      'Lead Date':           date.toISOString().slice(0, 10),
      'Motivo da reunião':   `Marcou via cal.com\nData: ${dateStr} às ${timeStr}`,
      'Business Area':       'Cal.com Booking',
    };

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );

    if (!airtableRes.ok) {
      const err = await airtableRes.json();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
