inherit ROOM;

void create()
{
        set("short", "潭底洞内");
        set("long", @LONG
鳄潭水气蒸浸，洞中潮湿滑溜，腥臭难闻。
LONG);
        set("exits", ([
               "southwest"   : __DIR__"hole1",
               "out"         : __DIR__"undertan",
        ]));

       /* set("objects", ([
 
        ]));
       */

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
