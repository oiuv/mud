//Room: xiyuan.c

inherit ROOM;

void create ()
{
        set ("short", "戏院");
        set ("long", @LONG
这里屋深幽暗，屋子西端搭有一座精巧但已有点退色的戏台。戏台
两边挂有数盏明亮的灯笼。前几排有些矮凳，后面是一些红油茶桌和宽
背扶手椅。
LONG);
        set("exits", ([
        	"south" : __DIR__"liande-beikou",
        ]));
        set("objects", ([
        	__DIR__"npc/xizi" : 1,
        ]));

        setup();
        replace_program(ROOM);
}


