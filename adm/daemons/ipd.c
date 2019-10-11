// ivy 2015年更新IP数据库
#include <ansi.h>
string seek_ip_address(string ip)
{
        string *ip_address, *ip_number;
        string str;
        string *ip_list_start, *ip_list_end;
        string *user_ip;
        string ip_config;
        int i, j, k = 0,n = 0;
        int ip_start, ip_end, now_ip;

        user_ip = explode(ip, ".");
        
        //ip_config = "/adm/etc/ip/ip011";
        if ( atoi(user_ip[0]) == 60 )
                ip_config = "/adm/etc/ip/ip011";

        else if ( atoi(user_ip[0]) == 61 )
             {
                if( atoi(user_ip[1]) <= 54 ) 
                    ip_config = "/adm/etc/ip/ip011";
                else if ( atoi(user_ip[1]) <= 132 && atoi(user_ip[1]) > 54 )
                    ip_config = "/adm/etc/ip/ip012";
                else if ( atoi(user_ip[1]) <= 139 && atoi(user_ip[1]) > 132 )
                    ip_config = "/adm/etc/ip/ip013";
                else if ( atoi(user_ip[1]) <= 150 && atoi(user_ip[1]) > 139 )
                    ip_config = "/adm/etc/ip/ip021";
                else if ( atoi(user_ip[1]) <= 153 && atoi(user_ip[1]) > 150 )
                    ip_config = "/adm/etc/ip/ip022";
                else if ( atoi(user_ip[1]) <= 159 && atoi(user_ip[1]) > 153 )
                    ip_config = "/adm/etc/ip/ip023";
                else if ( atoi(user_ip[1]) <= 167 && atoi(user_ip[1]) > 159 )
                    ip_config = "/adm/etc/ip/ip024";
                else if ( atoi(user_ip[1]) <= 177 && atoi(user_ip[1]) > 167 )
                    ip_config = "/adm/etc/ip/ip031";
                else if ( atoi(user_ip[1]) <= 179 && atoi(user_ip[1]) > 177 )
                    ip_config = "/adm/etc/ip/ip032";
                else if ( atoi(user_ip[1]) <= 182 && atoi(user_ip[1]) > 179 )
                    ip_config = "/adm/etc/ip/ip033";
                else if ( atoi(user_ip[1]) <= 184 && atoi(user_ip[1]) > 182 )
                    ip_config = "/adm/etc/ip/ip034";
                else if ( atoi(user_ip[1]) <= 186 && atoi(user_ip[1]) > 184 )
                    ip_config = "/adm/etc/ip/ip035";
                else if ( atoi(user_ip[1]) <= 191 && atoi(user_ip[1]) > 186 )
                    ip_config = "/adm/etc/ip/ip041";
                else if ( atoi(user_ip[1]) <= 239 && atoi(user_ip[1]) > 191 )
                    ip_config = "/adm/etc/ip/ip042";
                else 
                    ip_config = "/adm/etc/ip043";
             }
        else if ( atoi(user_ip[0]) == 202 )
             {
                if ( atoi(user_ip[1]) <= 101 && atoi(user_ip[1]) > 60 )
                    ip_config = "/adm/etc/ip/ip051";
                else if ( atoi(user_ip[1]) <= 103 && atoi(user_ip[1]) > 101 )
                    ip_config = "/adm/etc/ip/ip052";
                else if ( atoi(user_ip[1]) <= 113 && atoi(user_ip[1]) > 103 )
                    ip_config = "/adm/etc/ip/ip061";
                else if ( atoi(user_ip[1]) <= 130 && atoi(user_ip[1]) > 113 )
                    ip_config = "/adm/etc/ip/ip062";
                else if ( atoi(user_ip[1]) <= 255 && atoi(user_ip[1]) > 130 )
                    ip_config = "/adm/etc/ip/ip063";
             }
        else if ( atoi(user_ip[0]) <= 209 && atoi(user_ip[0]) > 202)
                    ip_config = "/adm/etc/ip/ip071";
        else if ( atoi(user_ip[0]) == 210 )
             {
                if ( atoi(user_ip[1]) <= 25 )
                    ip_config = "/adm/etc/ip/ip071";
                else if ( atoi(user_ip[1]) <= 51 && atoi(user_ip[1]) > 25 )
                    ip_config = "/adm/etc/ip/ip072";
                else
                    ip_config = "/adm/etc/ip/ip073";
             }
        else if ( atoi(user_ip[0]) == 211 )
             {
                if ( atoi(user_ip[1]) <= 90 )
                    ip_config = "/adm/etc/ip/ip081";
                else if ( atoi(user_ip[1]) <= 97 && atoi(user_ip[1]) > 90 )
                    ip_config = "/adm/etc/ip/ip082";
                else if ( atoi(user_ip[1]) <= 141 && atoi(user_ip[1]) > 97 )
                    ip_config = "/adm/etc/ip/ip083";
                else
                    ip_config = "/adm/etc/ip/ip084";
             }
        else if ( atoi(user_ip[0]) == 212 )
             {
                if ( atoi(user_ip[1]) <= 63 )
                    ip_config = "/adm/etc/ip/ip091";
                else
                    ip_config = "/adm/etc/ip/ip092";
             }
        else if ( atoi(user_ip[0]) == 213 )
             {
                if ( atoi(user_ip[1]) <= 149 )
                    ip_config = "/adm/etc/ip/ip092";
                else
                    ip_config = "/adm/etc/ip/ip093";
             }
        else if ( atoi(user_ip[0]) <= 217 && atoi(user_ip[0]) > 213 )
                    ip_config = "/adm/etc/ip/ip093";
        else if ( atoi(user_ip[0]) == 218 )
             {
                if ( atoi(user_ip[1]) <= 4 )
                   ip_config = "/adm/etc/ip/ip101";
                else if ( atoi(user_ip[1]) <= 6 && atoi(user_ip[1]) > 4 )
                    ip_config = "/adm/etc/ip/ip102";
                else if ( atoi(user_ip[1]) <= 8 && atoi(user_ip[1]) > 6 )
                    ip_config = "/adm/etc/ip/ip103";
                else if ( atoi(user_ip[1]) == 9 )
                    ip_config = "/adm/etc/ip/ip104";
                else if ( atoi(user_ip[1]) == 10 )
                    ip_config = "/adm/etc/ip/ip111";
                else if ( atoi(user_ip[1]) <= 14 && atoi(user_ip[1]) > 10 )
                    ip_config = "/adm/etc/ip/ip112";
                else if ( atoi(user_ip[1]) <= 18 && atoi(user_ip[1]) > 15 )
                    ip_config = "/adm/etc/ip/ip113";
                else if ( atoi(user_ip[1]) <= 21 && atoi(user_ip[1]) > 18 )
                    ip_config = "/adm/etc/ip/ip114";
                else if ( atoi(user_ip[1]) == 22 )
                    ip_config = "/adm/etc/ip/ip121";
                else if ( atoi(user_ip[1]) <= 26 && atoi(user_ip[1]) > 22 )
                    ip_config = "/adm/etc/ip/ip122";
                else if ( atoi(user_ip[1]) == 27 )
                    ip_config = "/adm/etc/ip/ip123";
                else if ( atoi(user_ip[1]) == 28 )
                    ip_config = "/adm/etc/ip/ip124";
                else if ( atoi(user_ip[1]) <= 58 && atoi(user_ip[1]) > 28 )
                    ip_config = "/adm/etc/ip/ip131";
                else if ( atoi(user_ip[1]) <= 61 && atoi(user_ip[1]) > 58 )
                    ip_config = "/adm/etc/ip/ip132";
                else if ( atoi(user_ip[1]) == 62 )
                    {
                        if ( atoi(user_ip[2]) <= 59 )
                            ip_config = "/adm/etc/ip/ip133";
                        else
                            ip_config = "/adm/etc/ip/ip134";
                    }
                else if ( atoi(user_ip[1]) <= 65 && atoi(user_ip[1]) > 62 )
                    ip_config = "/adm/etc/ip/ip135";
                else if ( atoi(user_ip[1]) <= 74 && atoi(user_ip[1]) > 65 )
                    ip_config = "/adm/etc/ip/ip141";
                else if ( atoi(user_ip[1]) == 75 )
                    ip_config = "/adm/etc/ip/ip142";
                else if ( atoi(user_ip[1]) <= 77 && atoi(user_ip[1]) > 75 )
                    ip_config = "/adm/etc/ip/ip143";
                else if ( atoi(user_ip[1]) <= 87 && atoi(user_ip[1]) > 77 )
                    ip_config = "/adm/etc/ip/ip144";
                else if ( atoi(user_ip[1]) == 88 )
                    ip_config = "/adm/etc/ip/ip151";
                else if ( atoi(user_ip[1]) <= 90 && atoi(user_ip[1]) > 88 )
                    ip_config = "/adm/etc/ip/ip152";
                else if ( atoi(user_ip[1]) <= 99 && atoi(user_ip[1]) > 90 )
                    ip_config = "/adm/etc/ip/ip153";
                else if ( atoi(user_ip[1]) <= 196 && atoi(user_ip[1]) > 99 )
                    ip_config = "/adm/etc/ip/ip154";
                else if ( atoi(user_ip[1]) <= 246 && atoi(user_ip[1]) > 196 )
                    ip_config = "/adm/etc/ip/ip155";
                else
                    ip_config = "/adm/etc/ip/ip156";
             }
        else if ( atoi(user_ip[0]) == 219 )
             {
                if ( atoi(user_ip[1]) <= 136 )
                   ip_config = "/adm/etc/ip/ip161";
                else if ( atoi(user_ip[1]) <= 138 && atoi(user_ip[1]) > 136 )
                    ip_config = "/adm/etc/ip/ip162";
                else if ( atoi(user_ip[1]) <= 144 && atoi(user_ip[1]) > 138 )
                    ip_config = "/adm/etc/ip/ip163";
                else if ( atoi(user_ip[1]) <= 147 && atoi(user_ip[1]) > 144 )
                    ip_config = "/adm/etc/ip/ip164";
                else if ( atoi(user_ip[1]) <= 149 && atoi(user_ip[1]) > 147 )
                    ip_config = "/adm/etc/ip/ip165";
                else if ( atoi(user_ip[1]) <= 155 && atoi(user_ip[1]) > 149 )
                    ip_config = "/adm/etc/ip/ip171";
                else if ( atoi(user_ip[1]) <= 215 && atoi(user_ip[1]) > 155 )
                    ip_config = "/adm/etc/ip/ip172";
                else if ( atoi(user_ip[1]) <= 233 && atoi(user_ip[1]) > 215 )
                    ip_config = "/adm/etc/ip/ip173";
                else if ( atoi(user_ip[1]) <= 235 && atoi(user_ip[1]) > 233 )
                    ip_config = "/adm/etc/ip/ip174";
                else if ( atoi(user_ip[1]) <= 238 && atoi(user_ip[1]) > 235 )
                    ip_config = "/adm/etc/ip/ip175";
                else if ( atoi(user_ip[1]) <= 242 && atoi(user_ip[1]) > 238 )
                    ip_config = "/adm/etc/ip/ip176";
                else
                    ip_config = "/adm/etc/ip/ip181";
             }
        else if ( atoi(user_ip[0]) == 220 )
             {
                if ( atoi(user_ip[1]) <= 165 )
                   ip_config = "/adm/etc/ip/ip181";
                else if ( atoi(user_ip[1]) <= 172 && atoi(user_ip[1]) > 165 )
                    ip_config = "/adm/etc/ip/ip182";
                else if ( atoi(user_ip[1]) <= 184 && atoi(user_ip[1]) > 172 )
                    ip_config = "/adm/etc/ip/ip183";
                else
                    ip_config = "/adm/etc/ip/ip184";
             }
        else if ( atoi(user_ip[0]) == 221 )
             {
                if ( atoi(user_ip[1]) <= 13 )
                   ip_config = "/adm/etc/ip/ip191";
                else if ( atoi(user_ip[1]) <= 204 && atoi(user_ip[1]) > 13 )
                    ip_config = "/adm/etc/ip/ip192";
                else if ( atoi(user_ip[1]) <= 230 && atoi(user_ip[1]) > 204 )
                    ip_config = "/adm/etc/ip/ip193";
                else
                    ip_config = "/adm/etc/ip/ip194";
             }
        else if ( atoi(user_ip[0]) == 222 )
             {
                if ( atoi(user_ip[1]) <= 51 )
                   ip_config = "/adm/etc/ip/ip194";
                else
                    ip_config = "/adm/etc/ip/ip195";
             }
        else ip_config = "/adm/etc/ip/ip000";
        
        str = read_file(ip_config);
        if (!str) return "数据读取失败";
        ip_address = explode(str, "\n");
        for (i = 0; i < sizeof(ip_address); i++) {
                ip_number=explode(ip_address[i], ".");
                if (atoi(ip_number[0]) == atoi(user_ip[0])) {
                        ip_list_start = explode(ip_address[i][0..14], ".");
                        ip_list_end = explode(ip_address[i][16..30], ".");

                       for( j = 1;j <= 3;j++ )
                         {
                                ip_start=atoi(ip_list_start[j]);
                                ip_end=atoi(ip_list_end[j]);
                                now_ip=atoi(user_ip[j]);
                                if ( j == 1 && now_ip <= ip_end && now_ip >= ip_start )
                                        k++;
                                if ( j == 2 && k == 1 )
                                      {
                                        if( now_ip < ip_end && now_ip > ip_start )
                                            k=k+2;
                                        else if( now_ip == ip_start && now_ip == ip_end )
                                           {
                                            k++;
                                            n=3;
                                           }  
                                        else if( now_ip == ip_start && n!=3 )
                                           {
                                            k++;
                                            n=1;
                                            }                                           
                                        else if( now_ip == ip_end && n!=3 )
                                           { 
                                            k++;
                                            n=2;
                                            }                                               
                                      }
                                if ( j == 3 && k == 2 )
                                      {
                                         if( n == 1 && now_ip >= ip_start )                                       
                                            k++;
                                         else if ( n == 2 && now_ip <= ip_end )
                                            k++;
                                         else if ( n == 3 && now_ip >= ip_start && now_ip <= ip_end )
                                            k++;
                                      }
                                        
                        }
                        if ( k == 3 ) {
                                return ip_address[i][32..];
                        }
                        k=0;
                        n=0;
                }
        }
        return "未知地址";

}

