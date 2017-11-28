//Room: qunyums.c

inherit ROOM;

void create()
{
        set("short", "群玉楼密室");
        set("long", @LONG
屋子里面布置得简单而富有情趣。房间很宽敞，悬挂着几盆花花草
草，红绿相间，疏密有致，令人赏心悦目。
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"south" : __DIR__"qunyuys8",
        ]));
        set("objects", ([
        	__DIR__"npc/dashou" : 4,
        	__DIR__"npc/xiangxiang": 1,
        	__DIR__"npc/huangyi": 1,   
        ]) );

	setup();
        replace_program(ROOM);
}
