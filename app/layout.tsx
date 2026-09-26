import './globals.css';
import './red.css';
export const metadata={title:'PackBreak — your NC State campus companion',description:'Find food, friends, and study time between your NC State classes.'};
export const viewport={width:'device-width',initialScale:1,themeColor:'#c61f22'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
