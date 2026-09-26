import type {Event} from './planner';
import {campusToday,addDays} from './planner';
type GoogleEvent={id:string;summary?:string;location?:string;start?:{dateTime?:string;date?:string};end?:{dateTime?:string;date?:string}};
type GoogleCalendar={id:string;summary?:string;primary?:boolean;accessRole?:string;selected?:boolean};
type TokenResponse={access_token?:string;error?:string};
declare global{interface Window{google?:{accounts:{oauth2:{initTokenClient:(options:{client_id:string;scope:string;callback:(response:TokenResponse)=>void;error_callback:()=>void})=>{requestAccessToken:()=>void}}}}}}
function time(date:string){return new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(date));}
export function importGoogle(clientId:string,leadDays:number):Promise<{events:Event[];notes:string}>{
 return new Promise((resolve,reject)=>{
 if(!window.google)return reject(Error('Google sign-in is still loading. Try again shortly.'));
 const client=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly',error_callback:()=>reject(Error('Google sign-in was closed or blocked. Please try again.')),callback:async token=>{
 if(token.error||!token.access_token)return reject(Error('Calendar access was not granted. Manual entry and photo import are still available.'));
 try{let skipped=0;const failed:string[]=[];const events:Event[]=[];const auth={Authorization:`Bearer ${token.access_token}`};const calendarResponse=await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250',{headers:auth});if(!calendarResponse.ok)throw Error('Could not list your calendars. Reconnect and allow both calendar-list and event access. Check that Google Calendar API is enabled.');const calendarData=await calendarResponse.json();const calendars=((calendarData.items||[]) as GoogleCalendar[]).filter(c=>c.id&&c.accessRole!=='freeBusyReader'&&c.accessRole!=='none'&&(c.primary||c.selected!==false));if(!calendars.length)calendars.push({id:'primary',summary:'Primary',primary:true});
 for(const cal of calendars){let pageToken='';do{const q=new URLSearchParams({timeMin:new Date().toISOString(),timeMax:new Date(addDays(campusToday(),60)+'T23:59:00Z').toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250',timeZone:'America/New_York'});if(pageToken)q.set('pageToken',pageToken);
 const response=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${q}`,{headers:auth});if(!response.ok){failed.push(cal.summary||'Unnamed calendar');pageToken='';continue;}const data=await response.json();
 for(const e of (data.items||[]) as GoogleEvent[]){if(!e.start?.dateTime||!e.end?.dateTime||campusToday(new Date(e.start.dateTime))!==campusToday(new Date(e.end.dateTime))){skipped++;continue;}const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(cal.id+'|'+e.id));const stableId='google-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');events.push({id:stableId,title:e.summary||'Untitled event',date:campusToday(new Date(e.start.dateTime)),start:time(e.start.dateTime),end:time(e.end.dateTime),location:e.location||'',kind:/exam|midterm|final|quiz/i.test(e.summary||'')?'exam':'class',repeat:false,leadDays});}pageToken=data.nextPageToken||'';
 }while(pageToken&&events.length<500);if(events.length>=500)break;}
 if(!events.length)throw Error(`No timed events were imported. ${failed.length?`Could not read: ${failed.join(', ')}. Reconnect and allow calendar access. `:''}${skipped?`${skipped} all-day or multi-day events were skipped. `:''}Check that your classes appear in a visible Google Calendar for the next 60 days under the account you selected. A university timetable is not imported unless it is already in Google Calendar.`);
 events.sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)||a.title.localeCompare(b.title));
 resolve({events:events.slice(0,500),notes:`Imported timed events from ${calendars.length} Google calendar${calendars.length===1?'':'s'} for the next 60 days. Review names, locations, and exam labels. ${skipped?`${skipped} all-day or multi-day events were skipped.`:''} ${failed.length?`Could not read: ${failed.join(', ')}. `:''}This is a one-time import; reconnect to refresh.`});
 }catch(e){reject(e);}
 }});client.requestAccessToken();
 });
}
