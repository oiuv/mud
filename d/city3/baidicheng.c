#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIW "白帝城" NOR );
        set("long", @LONG
朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，千
舟已过万重山。这里就是有名的白帝城了，遥看四周，只见青
山绿水，一片大好风景。庙内塑有刘备及孔明等一干名士的雕
像，凭栏怀古，心潮汹涌，令人神怡。
LONG);
        set("exits", ([
  		"west" : __DIR__"shudao10",
		"east" : __DIR__"shudao9",
  
        ]));
        set("objects", ([
                "/d/beijing/npc/shiren" : 1,
                "/d/beijing/npc/shusheng1" : 2,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");
        setup();
        replace_program(ROOM);
}

