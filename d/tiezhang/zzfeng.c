#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIR "中指峰" NOR);
        set("long", @LONG
这里就是铁掌山的最高峰——中指峰。由于山势太高，峰顶仍存有大量
的积雪，白雪皑皑，在阳光的照射下，泛起一片耀眼的银光。纵目远眺，湘
西几百里景色尽收眼底，泸溪，辰溪如两条玉带，从山下缓缓流过。远处那
条白色的亮线，就是湘西的大江——沅江。
LONG    );

        set("exits", ([
                "southdown" : __DIR__"shanlu-9",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
