// pinghuqiuyue.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "平湖秋月");
        set("long", @LONG
平湖秋月三面临水，四面曲栏画廊，直挹波际。曾有“万顷湖平
长似镜，四时月好最宜秋”的联句来描写这里秋夜时皓月当空的幽美
景色。朝西北走便是放鹤亭。东北边则是白堤。西边就是孤山。
LONG);
        set("exits", ([
            "west"      : __DIR__"gushan",
            "northwest" : __DIR__"fangheting",
            "northeast" : __DIR__"baiti",
        ]));
        set("outdoors", "hangzhou");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
