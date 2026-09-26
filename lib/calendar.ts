import type {Event} from './planner';
import {campusToday,addDays} from './planner';
type GoogleEvent={id:string;summary?:string;location?:string;start?:{dateTime?:string;date?:string};end?:{dateTime?:string;date?:string}};
type TokenResponse={access_token?:string;error?:string};
declare global{interface Window{google?:{accounts:{oauth2:{initTokenClient:(options:{client_id:string;scope:string;callback:(response:TokenResponse)=>void;error_callback:()=>void})=>{requestAccessToken:()=>void}}}}}}
function time(date:string){return new Intl.DateTimeFormat('en-GB',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(date));}
export function importGoogle(clientId:string,leadDays:number):Promise<{events:Event[];notes:string}>{
 return new Promise((resolve,reject)=>{
 if(!window.google)return reject(Error('Google sign-in is still loading. Try again shortly.'));
 const client=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:'https://www.googleapis.com/auth/calendar.events.readonly',error_callback:()=>reject(Error('Google sign-in was closed or blocked. Please try again.')),callback:async token=>{
 if(token.error||!token.access_token)return reject(Error('Calendar access was not granted. Manual entry and photo import are still available.'));
 try{let pageToken='',skipped=0;const events:Event[]=[];
 do{const q=new URLSearchParams({timeMin:new Date().toISOString(),timeMax:new Date(addDays(campusToday(),60)+'T23:59:00Z').toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250',timeZone:'America/New_York'});if(pageToken)q.set('pageToken',pageToken);
 const response=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${q}`,{headers:{Authorization:`Bearer ${token.access_token}`}});if(!response.ok)throw Error('Calendar import failed. Check Calendar API access and your Google OAuth setup.');const data=await response.json();
 for(const e of (data.items||[]) as GoogleEvent[]){if(!e.start?.dateTime||!e.end?.dateTime||campusToday(new Date(e.start.dateTime))!==campusToday(new Date(e.end.dateTime))){skipped++;continue;}events.push({id:'google-'+e.id,title:e.summary||'Untitled event',date:campusToday(new Date(e.start.dateTime)),start:time(e.start.dateTime),end:time(e.end.dateTime),location:e.location||'',kind:/exam|midterm|final|quiz/i.test(e.summary||'')?'exam':'class',repeat:false,leadDays});}pageToken=data.nextPageToken||'';
 }while(pageToken&&events.length<500);
 resolve({events:events.slice(0,500),notes:`Imported primary-calendar events for the next 60 days. Review names, locations, and exam labels. ${skipped?`${skipped} all-day or multi-day events were skipped.`:''} This is a one-time import; reconnect to refresh.`});
 }catch(e){reject(e);}
 }});client.requestAccessToken();
 });
}
