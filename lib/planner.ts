export type Event = {id:string;title:string;date:string;start:string;end:string;location:string;kind:'class'|'exam';repeat:boolean;leadDays:number};
export type Prefs = {budget:number;area:'all'|'campus'|'off';mode:'walking'|'driving';diet:string;mealPlan:boolean;leadDays:number};
export type Place = {id:string;name:string;location:string;campus:boolean;lat:number;lng:number;price:number;study:boolean;category:string;description:string;source:string;mealPlan:boolean;diets:string[];color:string;icon:string};
export type Plan = {id:string;placeId:string;name:string;date:string;start:string;end:string;friend:string;intent:string;remindMinutes:number;location:string};
export type Point = {lat:number;lng:number};
export type Gap = {start:number;end:number;from:string;to:string;nextTitle?:string};
export const mins=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3,5));
export const clock=(n:number)=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export function campusToday(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function campusMinute(now=new Date()){const p=new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);return mins(p);}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
export function daysUntil(date:string,today:string){return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000);}
export function eventsOn(events:Event[],date:string){const weekday=new Date(date+'T12:00:00Z').getUTCDay();return events.filter(e=>e.date===date||(e.repeat&&e.kind==='class'&&e.date<=date&&new Date(e.date+'T12:00:00Z').getUTCDay()===weekday)).sort((a,b)=>mins(a.start)-mins(b.start));}
export function findGaps(events:Event[],date:string,start=8*60,end=20*60,origin='Talley Student Union',plans:Plan[]=[]):Gap[]{
 const blocks=[...eventsOn(events,date),...plans.filter(p=>p.date===date)].sort((a,b)=>mins(a.start)-mins(b.start));let cursor=start,from=origin,lastFinished=-1;const gaps:Gap[]=[];
 for(const e of blocks){const a=mins(e.start),b=mins(e.end);if(b<=cursor){if(b>=lastFinished){from=e.location;lastFinished=b;}continue;}if(a>=end)break;if(a-cursor>=25)gaps.push({start:cursor,end:Math.min(a,end),from,to:e.location,nextTitle:'title' in e?e.title:e.name});if(b>cursor){cursor=b;from=e.location;lastFinished=b;}}
 if(end-cursor>=25)gaps.push({start:cursor,end,from,to:''});return gaps;
}
export function estimateMinutes(a:Point,b:Point,mode:'walking'|'driving'){const rad=Math.PI/180;const lat=(b.lat-a.lat)*rad,lon=(b.lng-a.lng)*rad;const h=Math.sin(lat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(lon/2)**2;const km=6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));return Math.max(2,Math.ceil(km*1.35/(mode==='walking'?.075:.45)+(mode==='driving'?10:0)));}
export function rankPlaces(places:Place[],gap:Gap,prefs:Prefs,intent:string,resolve:(name:string)=>Point|undefined){
 return places.filter(p=>(prefs.area==='all'||(prefs.area==='campus')===p.campus)&&p.price<=prefs.budget&&(prefs.diet==='Anything'||p.diets.includes(prefs.diet))).map(p=>{
 const origin=resolve(gap.from),destination=gap.to?resolve(gap.to):undefined;const mode=p.campus?'walking':prefs.mode;
 const outbound=origin?estimateMinutes(origin,p,mode):null;const onward=!gap.to?0:destination?estimateMinutes(p,destination,mode):null;
 const available=outbound===null||onward===null?null:gap.end-gap.start-outbound-onward-5;
 return {place:p,outbound,onward,available,mode,score:(intent==='study'&&p.study?50:0)+(prefs.mealPlan&&p.mealPlan?12:0)-(outbound??30)-p.price};
 }).filter(r=>r.available===null||r.available>=(intent==='study'?40:20)).sort((a,b)=>b.score-a.score);
}
export function upcomingExams(events:Event[],today:string){return events.filter(e=>e.kind==='exam'&&daysUntil(e.date,today)>=0&&daysUntil(e.date,today)<=e.leadDays).sort((a,b)=>a.date.localeCompare(b.date));}
export function overlaps(a:{start:string;end:string},b:{start:string;end:string}){return mins(a.start)<mins(b.end)&&mins(b.start)<mins(a.end);}
function escapeIcs(s:string){return s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
export function calendarFile(items:{id:string;title:string;date:string;start:string;end:string;location:string;description:string;alarm:number}[]){return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PackBreak//Campus Planner//EN','CALSCALE:GREGORIAN','BEGIN:VTIMEZONE','TZID:America/New_York','BEGIN:DAYLIGHT','DTSTART:20070311T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','TZOFFSETFROM:-0500','TZOFFSETTO:-0400','TZNAME:EDT','END:DAYLIGHT','BEGIN:STANDARD','DTSTART:20071104T020000','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','TZOFFSETFROM:-0400','TZOFFSETTO:-0500','TZNAME:EST','END:STANDARD','END:VTIMEZONE',...items.flatMap(e=>['BEGIN:VEVENT',`UID:${e.id}@packbreak`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z/,'Z')}`,`DTSTART;TZID=America/New_York:${e.date.replaceAll('-','')}T${e.start.replace(':','')}00`,`DTEND;TZID=America/New_York:${e.date.replaceAll('-','')}T${e.end.replace(':','')}00`,`SUMMARY:${escapeIcs(e.title)}`,`LOCATION:${escapeIcs(e.location)}`,`DESCRIPTION:${escapeIcs(e.description)}`,'BEGIN:VALARM',`TRIGGER:-PT${e.alarm}M`,'ACTION:DISPLAY',`DESCRIPTION:${escapeIcs(e.title)}`,'END:VALARM','END:VEVENT']),'END:VCALENDAR'].map(foldIcs).join('\r\n')+'\r\n';}

function foldIcs(line:string){const encoder=new TextEncoder();let result='',count=0;for(const char of line){const bytes=encoder.encode(char).length;if(count+bytes>74){result+='\r\n ';count=1;}result+=char;count+=bytes;}return result;}
